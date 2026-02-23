import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the library page by default', () => {
    render(<App />);
    expect(screen.getByText('Your Beans')).toBeInTheDocument();
  });

  it('renders bottom navigation', () => {
    render(<App />);
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
