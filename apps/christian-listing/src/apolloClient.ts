import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { firebaseAuth } from './firebase';

const httpLink = createHttpLink({
  uri: process.env['VITE_GATEWAY_URL'] ?? 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const token = await firebaseAuth.currentUser?.getIdToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
