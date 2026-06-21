import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('displays the admin heading', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(getByRole('heading', { name: /cl admin/i })).toBeTruthy();
  });
});
