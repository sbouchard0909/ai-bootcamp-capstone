import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('Travel Planning App')).toBeInTheDocument();
  });

  it('should display app title', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /travel planning app/i });
    expect(heading).toBeInTheDocument();
  });

  it('should display button with initial count', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /count is 0/i });
    expect(button).toBeInTheDocument();
  });
});
