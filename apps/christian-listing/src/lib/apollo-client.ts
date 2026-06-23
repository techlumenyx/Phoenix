import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuth } from 'firebase/auth';

const httpLink = createHttpLink({
  uri: process.env['CL_GRAPHQL_URL'] ?? 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const user = getAuth().currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
