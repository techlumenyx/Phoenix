import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import App from './app/app';

const firebaseApp = initializeApp({
  apiKey: process.env['CL_FIREBASE_API_KEY'],
  authDomain: process.env['CL_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['CL_FIREBASE_PROJECT_ID'],
  appId: process.env['CL_FIREBASE_APP_ID'],
});

export const firebaseAuth = getAuth(firebaseApp);

const httpLink = createHttpLink({
  uri: process.env['CL_GRAPHQL_URL'] ?? 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const user = firebaseAuth.currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
);
