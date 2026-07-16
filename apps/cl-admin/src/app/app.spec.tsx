import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';

const mockAuthState = {
  user: null,
  admin: null,
  initialized: true,
  signingIn: false,
  accessDenied: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
};

jest.mock('../auth/authStore', () => ({
  useAdminAuth: (selector?: (state: typeof mockAuthState) => unknown) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

describe('admin App', () => {
  it('renders the dedicated staff sign-in route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /sign in to administration/i })).toBeTruthy();
    expect(screen.getByText(/community and organisation accounts cannot access/i)).toBeTruthy();
  });

  it('redirects signed-out visitors to sign in', async () => {
    render(
      <MemoryRouter initialEntries={['/moderation']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /sign in to administration/i })).toBeTruthy();
  });
});
