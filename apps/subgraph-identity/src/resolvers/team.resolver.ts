import { randomUUID } from 'node:crypto';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { getAuth } from 'firebase-admin/auth';
import {
  canAccessOrganisation,
  getOrganisationAccess,
  ORGANISATION_ROLES,
  type OrganisationRole,
} from '@christian-listings/auth';
import { OrganisationModel, OrgInviteModel, UserModel } from '../models';
import type { GraphQLContext } from '../context';

const MANAGERS: OrganisationRole[] = ['master_admin', 'site_admin'];
function access(ctx: GraphQLContext, orgId: string) {
  if (!canAccessOrganisation(ctx.auth, orgId, MANAGERS))
    throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
  return getOrganisationAccess(ctx.auth)!;
}
function validRoles(input: string[]) {
  const result = [...new Set(input)].filter((role): role is OrganisationRole =>
    ORGANISATION_ROLES.includes(role as OrganisationRole),
  );
  if (result.includes('master_admin'))
    throw new GraphQLError('Master admin cannot be assigned', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  if (!result.length)
    throw new GraphQLError('Select at least one role', { extensions: { code: 'BAD_USER_INPUT' } });
  return result;
}
function userShape(doc: any) {
  return {
    id: doc._id.toString(),
    firebaseUid: doc.firebaseUid,
    email: doc.email,
    name: doc.name ?? '',
    region: doc.region ?? '',
    isVerified: doc.isVerified ?? false,
    onboardingCompleted: doc.onboardingCompleted,
    preferences: doc.preferences ?? [],
    roles: doc.roles ?? [],
    orgId: doc.orgId?.toString() ?? null,
    avatarUrl: doc.avatarUrl ?? null,
    bio: doc.bio ?? null,
    socialLinks: doc.socialLinks ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
function inviteShape(doc: any) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    organisation: { id: doc.organisationId.toString() },
    roles: doc.roles,
    status: doc.status,
    token: doc.token,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
  };
}
async function getInvite(id: string, ctx: GraphQLContext) {
  const doc = await OrgInviteModel.findById(id);
  if (!doc) throw new GraphQLError('Invitation not found', { extensions: { code: 'NOT_FOUND' } });
  access(ctx, doc.organisationId.toString());
  return doc;
}

export const teamResolvers = {
  Query: {
    organisationTeam: async (
      _: unknown,
      { organisationId }: { organisationId: string },
      ctx: GraphQLContext,
    ) => {
      access(ctx, organisationId);
      const docs = await UserModel.find({
        orgId: new mongoose.Types.ObjectId(organisationId),
      }).sort({ orgJoinedAt: 1 });
      return docs.map((doc) => ({
        user: userShape(doc),
        roles: doc.roles,
        joinedAt: doc.orgJoinedAt,
      }));
    },
    organisationInvites: async (
      _: unknown,
      { organisationId }: { organisationId: string },
      ctx: GraphQLContext,
    ) => {
      access(ctx, organisationId);
      await OrgInviteModel.updateMany(
        { organisationId, status: 'PENDING', expiresAt: { $lte: new Date() } },
        { $set: { status: 'EXPIRED' } },
      );
      return (await OrgInviteModel.find({ organisationId }).sort({ createdAt: -1 })).map(
        inviteShape,
      );
    },
    organisationInvite: async (_: unknown, { token }: { token: string }) => {
      const doc = await OrgInviteModel.findOne({ token });
      if (!doc) return null;
      if (doc.status === 'PENDING' && doc.expiresAt <= new Date()) {
        doc.status = 'EXPIRED';
        await doc.save();
      }
      return inviteShape(doc);
    },
  },
  Mutation: {
    inviteOrganisationMember: async (
      _: unknown,
      { organisationId, email, roles }: { organisationId: string; email: string; roles: string[] },
      ctx: GraphQLContext,
    ) => {
      const actor = access(ctx, organisationId);
      const assignedRoles = validRoles(roles);
      if (assignedRoles.includes('site_admin') && !actor.roles.includes('master_admin'))
        throw new GraphQLError('Only the master admin can invite administrators', {
          extensions: { code: 'FORBIDDEN' },
        });
      const normalised = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalised))
        throw new GraphQLError('Enter a valid email', { extensions: { code: 'BAD_USER_INPUT' } });
      const existing = await UserModel.findOne({ email: normalised });
      if (existing?.orgId)
        throw new GraphQLError('This user already belongs to an organisation', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      try {
        return inviteShape(
          await OrgInviteModel.create({
            email: normalised,
            organisationId,
            roles: assignedRoles,
            invitedBy: ctx.auth.firebaseUid,
            token: randomUUID(),
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 86400000),
          }),
        );
      } catch (error: any) {
        if (error?.code === 11000)
          throw new GraphQLError('A pending invitation already exists for this email', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        throw error;
      }
    },
    acceptOrganisationInvite: async (
      _: unknown,
      { token }: { token: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid)
        throw new GraphQLError('Sign in to accept this invitation', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      const invite = await OrgInviteModel.findOne({ token });
      if (!invite || invite.status !== 'PENDING' || invite.expiresAt <= new Date())
        throw new GraphQLError('This invitation is no longer valid', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      let user = await UserModel.findOne({ firebaseUid: ctx.auth.firebaseUid });
      const email = String(ctx.auth.decodedToken?.email ?? user?.email ?? '').toLowerCase();
      if (email !== invite.email.toLowerCase())
        throw new GraphQLError(`Sign in using ${invite.email}`, {
          extensions: { code: 'FORBIDDEN' },
        });
      if (!user) {
        user = await UserModel.create({
          firebaseUid: ctx.auth.firebaseUid,
          email,
          name: String(ctx.auth.decodedToken?.name ?? email.split('@')[0]),
          preferences: [],
          roles: [],
          onboardingCompleted: false,
        });
      }
      if (user.orgId && user.orgId.toString() !== invite.organisationId.toString())
        throw new GraphQLError('Your account already belongs to another organisation', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      user.orgId = invite.organisationId;
      user.roles = invite.roles;
      user.orgInvitedBy = invite.invitedBy;
      user.orgJoinedAt = new Date();
      await user.save();
      await getAuth().setCustomUserClaims(user.firebaseUid, {
        accountType: 'organisation',
        orgId: invite.organisationId.toString(),
        roles: invite.roles,
      });
      invite.status = 'ACCEPTED';
      await invite.save();
      const org = await OrganisationModel.findById(invite.organisationId);
      if (!org) throw new GraphQLError('Organisation not found');
      return { id: org._id.toString(), name: org.name ?? '' };
    },
    revokeOrganisationInvite: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const invite = await getInvite(id, ctx);
      if (invite.status === 'ACCEPTED')
        throw new GraphQLError('Accepted invitations cannot be revoked', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      invite.status = 'REVOKED';
      await invite.save();
      return inviteShape(invite);
    },
    resendOrganisationInvite: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const invite = await getInvite(id, ctx);
      if (invite.status === 'ACCEPTED')
        throw new GraphQLError('This invitation was accepted', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      invite.status = 'PENDING';
      invite.token = randomUUID();
      invite.expiresAt = new Date(Date.now() + 7 * 86400000);
      await invite.save();
      return inviteShape(invite);
    },
    updateOrganisationMemberRoles: async (
      _: unknown,
      {
        organisationId,
        userId,
        roles,
      }: { organisationId: string; userId: string; roles: string[] },
      ctx: GraphQLContext,
    ) => {
      const actor = access(ctx, organisationId);
      const assignedRoles = validRoles(roles);
      if (assignedRoles.includes('site_admin') && !actor.roles.includes('master_admin'))
        throw new GraphQLError('Only the master admin can assign administrators', {
          extensions: { code: 'FORBIDDEN' },
        });
      const member = await UserModel.findOne({ _id: userId, orgId: organisationId });
      if (!member)
        throw new GraphQLError('Member not found', { extensions: { code: 'NOT_FOUND' } });
      if (member.roles.includes('master_admin'))
        throw new GraphQLError('Master admin roles cannot be changed', {
          extensions: { code: 'FORBIDDEN' },
        });
      if (!actor.roles.includes('master_admin') && member.roles.includes('site_admin'))
        throw new GraphQLError('Only the master admin can modify administrators', {
          extensions: { code: 'FORBIDDEN' },
        });
      member.roles = assignedRoles;
      await member.save();
      await getAuth().setCustomUserClaims(member.firebaseUid, {
        accountType: 'organisation',
        orgId: organisationId,
        roles: member.roles,
      });
      return { user: userShape(member), roles: member.roles, joinedAt: member.orgJoinedAt };
    },
    removeOrganisationMember: async (
      _: unknown,
      { organisationId, userId }: { organisationId: string; userId: string },
      ctx: GraphQLContext,
    ) => {
      const actor = access(ctx, organisationId);
      const member = await UserModel.findOne({ _id: userId, orgId: organisationId });
      if (!member) return true;
      if (member.roles.includes('master_admin'))
        throw new GraphQLError('Master admin cannot be removed', {
          extensions: { code: 'FORBIDDEN' },
        });
      if (!actor.roles.includes('master_admin') && member.roles.includes('site_admin'))
        throw new GraphQLError('Only the master admin can remove administrators', {
          extensions: { code: 'FORBIDDEN' },
        });
      member.orgId = null;
      member.roles = [];
      member.orgInvitedBy = null;
      member.orgJoinedAt = null;
      await member.save();
      await getAuth().setCustomUserClaims(member.firebaseUid, { accountType: 'member', roles: [] });
      return true;
    },
  },
};
