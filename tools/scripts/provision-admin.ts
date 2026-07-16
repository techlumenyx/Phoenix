import { createMongoConnection } from '@christian-listings/db';
import { getFirebaseAdmin } from '@christian-listings/auth';
import {
  ADMIN_ROLES,
  AdminSchema,
  type AdminRole,
  type IAdmin,
} from '../../apps/subgraph-identity/src/models/admin.model';

interface CliOptions {
  email: string;
  name?: string;
  roles: AdminRole[];
  disable: boolean;
}

function valueAfter(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseOptions(): CliOptions {
  const email = valueAfter('--email')?.trim().toLowerCase();
  if (!email) throw new Error('--email is required');

  const disable = process.argv.includes('--disable');
  const rolesValue = valueAfter('--roles') ?? 'SUPER_ADMIN';
  const roles = rolesValue
    .split(',')
    .map((role) => role.trim().toUpperCase())
    .filter(Boolean) as AdminRole[];

  const invalidRoles = roles.filter((role) => !ADMIN_ROLES.includes(role));
  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles: ${invalidRoles.join(', ')}. Allowed: ${ADMIN_ROLES.join(', ')}`);
  }
  if (!disable && roles.length === 0) throw new Error('At least one role is required');

  return {
    email,
    name: valueAfter('--name')?.trim(),
    roles,
    disable,
  };
}

async function main() {
  const options = parseOptions();
  const mongoUri = process.env['MONGO_URI'];
  if (!mongoUri) throw new Error('MONGO_URI is required');

  const connection = await createMongoConnection(mongoUri, 'cl_identity');
  const AdminModel = connection.model<IAdmin>('Admin', AdminSchema);
  const auth = getFirebaseAdmin().auth();

  try {
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(options.email);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== 'auth/user-not-found' || options.disable) throw error;

      const initialPassword = process.env['ADMIN_INITIAL_PASSWORD'];
      if (!initialPassword || initialPassword.length < 12) {
        throw new Error('ADMIN_INITIAL_PASSWORD (minimum 12 characters) is required for a new admin');
      }
      if (!options.name) throw new Error('--name is required when creating a new admin');

      firebaseUser = await auth.createUser({
        email: options.email,
        password: initialPassword,
        displayName: options.name,
        emailVerified: false,
        disabled: false,
      });
    }

    if (options.disable) {
      await auth.updateUser(firebaseUser.uid, { disabled: true });
      await auth.setCustomUserClaims(firebaseUser.uid, { accountType: 'admin', roles: [] });
      await auth.revokeRefreshTokens(firebaseUser.uid);
      await AdminModel.updateOne(
        { firebaseUid: firebaseUser.uid },
        { $set: { status: 'DISABLED', roles: [] } },
      );
      console.log(`Disabled admin ${options.email}`);
      return;
    }

    const name = options.name ?? firebaseUser.displayName;
    if (!name) throw new Error('--name is required because this Firebase user has no display name');

    await auth.updateUser(firebaseUser.uid, {
      displayName: name,
      disabled: false,
    });
    await auth.setCustomUserClaims(firebaseUser.uid, {
      accountType: 'admin',
      roles: options.roles,
    });
    await auth.revokeRefreshTokens(firebaseUser.uid);

    await AdminModel.updateOne(
      { firebaseUid: firebaseUser.uid },
      {
        $set: {
          email: options.email,
          name,
          roles: options.roles,
          status: 'ACTIVE',
        },
        $setOnInsert: { lastLoginAt: null },
      },
      { upsert: true },
    );

    console.log(`Provisioned admin ${options.email} with roles: ${options.roles.join(', ')}`);
    console.log('Existing sessions were revoked. The admin must sign in again.');
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
