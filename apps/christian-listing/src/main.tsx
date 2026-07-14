import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apolloClient';
import router from './router';
import { ToastProvider } from './components/ui/ToastProvider';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ApolloProvider>
  </StrictMode>
);
