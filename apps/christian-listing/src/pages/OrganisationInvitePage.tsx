import { gql, useMutation, useQuery } from '@apollo/client';
import { getAuth } from 'firebase/auth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const INVITE = gql`
  query OrganisationInvitation($token: String!) {
    organisationInvite(token: $token) {
      id
      email
      roles
      status
      expiresAt
      organisation {
        id
        name
        logoUrl
      }
    }
  }
`;
const ACCEPT = gql`
  mutation AcceptOrganisationInvitation($token: String!) {
    acceptOrganisationInvite(token: $token) {
      id
      name
    }
  }
`;
export default function OrganisationInvitePage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data, loading, error } = useQuery(INVITE, { variables: { token } });
  const [accept, { loading: accepting, error: acceptError }] = useMutation(ACCEPT);
  const invite = data?.organisationInvite;
  async function acceptInvite() {
    await accept({ variables: { token } });
    await getAuth().currentUser?.getIdToken(true);
    useAuthStore.setState({ accountType: 'organisation' });
    navigate('/org', { replace: true });
  }
  if (loading) return <div className="py-24 text-center">Loading invitation...</div>;
  if (error || !invite) return <State title="Invitation not found" detail={error?.message} />;
  if (invite.status !== 'PENDING' || new Date(invite.expiresAt) <= new Date())
    return (
      <State
        title="Invitation unavailable"
        detail={`This invitation is ${invite.status.toLowerCase()}.`}
      />
    );
  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#eee6ef] font-serif text-3xl font-bold">
          {invite.organisation.logoUrl ? (
            <img src={invite.organisation.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            invite.organisation.name.charAt(0)
          )}
        </div>
        <h1 className="mt-5 font-serif text-3xl font-bold">Join {invite.organisation.name}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          This invitation is for <strong>{invite.email}</strong>. Sign in or create an account using
          this exact email.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {invite.roles.map((role: string) => (
            <span key={role} className="rounded-full bg-[#eee6ef] px-3 py-1 text-xs">
              {role.replaceAll('_', ' ')}
            </span>
          ))}
        </div>
        {user ? (
          <button
            disabled={accepting}
            onClick={acceptInvite}
            className="mt-8 w-full rounded-xl bg-[#332f33] py-3 font-semibold text-white disabled:opacity-50"
          >
            {accepting ? 'Joining...' : 'Accept invitation'}
          </button>
        ) : (
          <Link
            to="/signin"
            state={{ from: { pathname: `/org/invite/${token}` } }}
            className="mt-8 block w-full rounded-xl bg-[#332f33] py-3 font-semibold text-white"
          >
            Sign in or create account
          </Link>
        )}
        {acceptError && <p className="mt-4 text-sm text-red-600">{acceptError.message}</p>}
      </div>
    </main>
  );
}
function State({ title, detail }: { title: string; detail?: string }) {
  return (
    <main className="py-24 text-center">
      <h1 className="font-serif text-3xl font-bold">{title}</h1>
      {detail && <p className="mt-3 text-sm text-gray-500">{detail}</p>}
      <Link to="/" className="mt-6 inline-block underline">
        Return home
      </Link>
    </main>
  );
}
