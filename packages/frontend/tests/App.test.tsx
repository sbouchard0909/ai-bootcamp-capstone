import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders application title', () => {
    render(<App />);
    expect(screen.getByText('Travel Planning App')).toBeInTheDocument();
  });

  it('shows login/register links when unauthenticated', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Register' })[0]).toBeInTheDocument();
  });
});
