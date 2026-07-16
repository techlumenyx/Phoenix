import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { firebaseAuth } from '../firebase';

const httpLink = createHttpLink({
  uri: process.env['CL_GRAPHQL_URL'] ?? 'http://localhost:4000/',
});

const authLink = setContext(async (_, { headers }) => {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      'x-request-id': requestId,
      ...(typeof window !== 'undefined' ? { 'x-admin-route': window.location.pathname } : {}),
    },
  };
});

export const adminApolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
});
