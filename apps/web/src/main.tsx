import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import App from './app/app';

// Firebase client initialisation
const firebaseApp = initializeApp({
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'],
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'],
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
  appId: import.meta.env['VITE_FIREBASE_APP_ID'],
});

export const firebaseAuth = getAuth(firebaseApp);

// Apollo Client with Firebase token injection
const httpLink = createHttpLink({
  uri: import.meta.env['VITE_GRAPHQL_URL'] ?? 'http://localhost:4000/graphql',
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
  </StrictMode>,
);
