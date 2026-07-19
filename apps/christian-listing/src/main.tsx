import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apolloClient';
import router from './router';
import { ToastProvider } from './components/ui/ToastProvider';

const SERVICE_WORKER_RECOVERY_KEY = 'cl-dev-service-worker-recovered';

async function removeDevelopmentServiceWorkers(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production' || !('serviceWorker' in navigator)) return false;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if (navigator.serviceWorker.controller) {
      if (!sessionStorage.getItem(SERVICE_WORKER_RECOVERY_KEY)) {
        sessionStorage.setItem(SERVICE_WORKER_RECOVERY_KEY, 'true');
        window.location.reload();
        return true;
      }
    } else {
      sessionStorage.removeItem(SERVICE_WORKER_RECOVERY_KEY);
    }
  } catch {
    // A failed cleanup must not prevent local development from rendering.
  }

  return false;
}

async function bootstrap() {
  if (await removeDevelopmentServiceWorkers()) return;

  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <StrictMode>
      <ApolloProvider client={apolloClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ApolloProvider>
    </StrictMode>,
  );
}

void bootstrap();
