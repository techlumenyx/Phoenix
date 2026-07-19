import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { useToast } from '../../components/ui/ToastProvider';

interface TeamMember {
  user: { id: string; name: string; email: string; avatarUrl?: string | null };
  roles: string[];
  joinedAt?: string | null;
}
interface TeamInvite {
  id: string;
  email: string;
  roles: string[];
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

const TEAM_ORG = gql`
  query TeamOrgId {
    myOrganisations {
      id
    }
  }
`;

const TEAM = gql`
  query OrganisationTeamPage($id: ID!) {
    organisationTeam(organisationId: $id) {
      user {
        id
        name
        email
        avatarUrl
      }
      roles
      joinedAt
    }
    organisationInvites(organisationId: $id) {
      id
      email
      roles
      status
      token
      expiresAt
      createdAt
    }
  }
`;
const INVITE = gql`
  mutation InviteTeamMember($id: ID!, $email: String!, $roles: [String!]!) {
    inviteOrganisationMember(organisationId: $id, email: $email, roles: $roles) {
      id
      email
      token
      status
      expiresAt
      roles
    }
  }
`;
const REVOKE = gql`
  mutation RevokeTeamInvite($id: ID!) {
    revokeOrganisationInvite(id: $id) {
      id
      status
    }
  }
`;
const RESEND = gql`
  mutation ResendTeamInvite($id: ID!) {
    resendOrganisationInvite(id: $id) {
      id
      token
      status
      expiresAt
    }
  }
`;
const UPDATE_ROLES = gql`
  mutation UpdateTeamRoles($orgId: ID!, $userId: ID!, $roles: [String!]!) {
    updateOrganisationMemberRoles(organisationId: $orgId, userId: $userId, roles: $roles) {
      roles
      user {
        id
      }
    }
  }
`;
const REMOVE = gql`
  mutation RemoveTeamMember($orgId: ID!, $userId: ID!) {
    removeOrganisationMember(organisationId: $orgId, userId: $userId)
  }
`;

const OPTIONS = [
  ['site_admin', 'Administrator', 'Manage settings, invitations, team members and all content.'],
  ['events_manager', 'Events Manager', 'Create and manage organisation events.'],
  ['jobs_manager', 'Jobs Manager', 'Create jobs and manage applicants.'],
  ['classifieds_manager', 'Listings Manager', 'Create listings and manage seller conversations.'],
] as const;

export default function OrgTeamPage() {
  const { showToast } = useToast();
  const { data: orgData } = useQuery(TEAM_ORG);
  const orgId = orgData?.myOrganisations?.[0]?.id as string | undefined;
  const { data, loading, error, refetch } = useQuery(TEAM, {
    variables: { id: orgId },
    skip: !orgId,
  });
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState<string[]>(['events_manager']);
  const [message, setMessage] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState<TeamMember | null>(null);
  const [invite, { loading: inviting }] = useMutation(INVITE);
  const [revoke] = useMutation(REVOKE);
  const [resend] = useMutation(RESEND);
  const [updateRoles] = useMutation(UPDATE_ROLES);
  const [remove] = useMutation(REMOVE);
  const members = data?.organisationTeam ?? [];
  const invites = data?.organisationInvites ?? [];
  const link = (token: string) => `${window.location.origin}/org/invite/${token}`;
  async function createInvite() {
    if (!orgId) return;
    try {
      const result = await invite({ variables: { id: orgId, email, roles: selected } });
      const url = link(result.data.inviteOrganisationMember.token);
      await navigator.clipboard.writeText(url);
      setMessage('Invitation created and link copied.');
      showToast('Invitation created and link copied.', 'success');
      setShowInvite(false);
      setEmail('');
      await refetch();
    } catch {
      const text = 'We couldn’t send the invitation. Check the details and try again.';
      setMessage(text);
      showToast(text, 'error');
    }
  }
  async function changeRoles(userId: string, roles: string[]) {
    if (!orgId) return;
    await updateRoles({ variables: { orgId, userId, roles } });
    await refetch();
  }
  async function removeMember(userId: string, confirmed = false) {
    if (
      !orgId ||
      (!confirmed &&
        !window.confirm(
          'Remove this member’s organisation access? Their existing content will be retained.',
        ))
    )
      return;
    await remove({ variables: { orgId, userId } });
    await refetch();
    setPendingRemoval(null);
    showToast('Team member removed. Their existing content was retained.', 'success');
  }

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">Team & Roles</h1>
          <p className="mt-2 text-sm text-gray-500">
            Invite collaborators and control their organisation access.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="rounded-lg bg-[#302d2e] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Invite collaborator
        </button>
      </div>
      {message && <p className="mt-5 rounded-lg bg-[#fff0de] px-4 py-3 text-sm">{message}</p>}
      <section className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="font-serif text-xl font-bold">Members</h2>
        </div>
        {loading && <p className="p-10 text-center text-sm">Loading...</p>}
        {error && <p className="p-10 text-center text-sm text-red-600">We couldn’t load the organisation team. Please try again.</p>}
        {members.map((member: TeamMember) => (
          <div
            key={member.user.id}
            className="flex flex-col gap-4 border-b p-5 last:border-0 md:flex-row md:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#eee6ef] font-bold">
                {member.user.avatarUrl ? (
                  <img src={member.user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  member.user.name.charAt(0)
                )}
              </div>
              <div>
                <strong>{member.user.name}</strong>
                <p className="text-xs text-gray-500">{member.user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.roles.includes('master_admin') ? (
                <span className="rounded-full bg-[#fff0de] px-3 py-1 text-xs font-semibold">
                  Master Admin
                </span>
              ) : (
                OPTIONS.map(([role, label]) => (
                  <label
                    key={role}
                    className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={member.roles.includes(role)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...member.roles, role]
                          : member.roles.filter((item: string) => item !== role);
                        if (next.length) changeRoles(member.user.id, next);
                      }}
                    />
                    {label}
                  </label>
                ))
              )}
            </div>
            {!member.roles.includes('master_admin') && (
              <button
                onClick={() => setPendingRemoval(member)}
                className="text-xs font-semibold text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </section>
      <section className="mt-6 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="font-serif text-xl font-bold">Invitations</h2>
        </div>
        {invites.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-400">No invitations yet.</p>
        )}
        {invites.map((item: TeamInvite) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 border-b p-5 last:border-0 md:flex-row md:items-center"
          >
            <div className="flex-1">
              <strong className="text-sm">{item.email}</strong>
              <p className="mt-1 text-xs text-gray-500">
                {item.roles.map((role: string) => role.replaceAll('_', ' ')).join(', ')} ·{' '}
                {item.status} · expires {new Date(item.expiresAt).toLocaleDateString()}
              </p>
            </div>
            {item.status === 'PENDING' && (
              <>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(link(item.token)).then(() => {
                      setMessage('Invitation link copied.');
                      showToast('Invitation link copied.', 'success');
                    })
                  }
                  className="text-xs font-semibold"
                >
                  Copy link
                </button>
                <button
                  onClick={() => revoke({ variables: { id: item.id } }).then(() => refetch())}
                  className="text-xs text-red-600"
                >
                  Revoke
                </button>
              </>
            )}
            {['EXPIRED', 'REVOKED'].includes(item.status) && (
              <button
                onClick={() =>
                  resend({ variables: { id: item.id } }).then(async (result) => {
                    await navigator.clipboard.writeText(
                      link(result.data.resendOrganisationInvite.token),
                    );
                    setMessage('New invitation link copied.');
                    showToast('New invitation link copied.', 'success');
                    await refetch();
                  })
                }
                className="text-xs font-semibold"
              >
                Resend
              </button>
            )}
          </div>
        ))}
      </section>
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[30px] bg-white p-8 md:p-10">
            <h2 className="text-center font-serif text-3xl font-bold">Invite Collaborator</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-gray-500">
              Create a secure invitation link for a collaborator. They must sign in with the invited
              email.
            </p>
            <label className="mt-8 block text-sm font-semibold">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="collaborator@example.com"
                className="mt-3 w-full rounded-[15px] bg-[#eee6ef] px-5 py-4 outline-none"
              />
            </label>
            <h3 className="mt-7 text-sm font-semibold">Roles and permissions</h3>
            <div className="mt-3 space-y-3">
              {OPTIONS.map(([role, label, description]) => (
                <label
                  key={role}
                  className={`flex cursor-pointer gap-4 rounded-[15px] border p-4 ${selected.includes(role) ? 'bg-[#eee6ef]' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(role)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, role]
                          : current.filter((item) => item !== role),
                      )
                    }
                  />
                  <div>
                    <strong>{label}</strong>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-7 rounded-[15px] bg-[#fff0de] p-4 text-sm leading-6">
              <strong>Roles & Permissions:</strong> Invitations are valid for 7 days. Multiple roles
              can be assigned.
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button onClick={() => setShowInvite(false)} className="rounded-[15px] border py-3">
                Cancel
              </button>
              <button
                disabled={inviting || !email || !selected.length}
                onClick={createInvite}
                className="rounded-[15px] bg-[#332f33] py-3 text-white disabled:opacity-40"
              >
                {inviting ? 'Creating...' : 'Create Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        open={Boolean(pendingRemoval)}
        title="Remove team member?"
        description={`${pendingRemoval?.user.name ?? 'This member'} will immediately lose organisation access. Their existing events, jobs, listings, and messages will be retained.`}
        confirmLabel="Remove member"
        tone="danger"
        onClose={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (pendingRemoval) return removeMember(pendingRemoval.user.id, true);
        }}
      />
    </main>
  );
}
