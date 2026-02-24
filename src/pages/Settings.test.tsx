import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from './Settings';

// Mock the database reset
vi.mock('../db', async () => {
  const actual = await vi.importActual('../db');
  return {
    ...actual,
    resetDatabase: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock the stores
vi.mock('../stores/beanStore', () => ({
  useBeanStore: () => ({
    loadBeans: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../stores/shotStore', () => ({
  useShotStore: () => ({
    clearShots: vi.fn(),
  }),
}));

vi.mock('../stores/themeStore', () => ({
  useThemeStore: () => ({
    mode: 'system',
    setMode: vi.fn(),
  }),
}));

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings page', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Your Data')).toBeInTheDocument();
    expect(screen.getByText('About Beanary')).toBeInTheDocument();
  });

  it('has export button', () => {
    render(<Settings />);
    expect(screen.getByText('Export Data (JSON)')).toBeInTheDocument();
  });

  it('has clear data button', () => {
    render(<Settings />);
    expect(screen.getByText('Clear All Data')).toBeInTheDocument();
  });

  it('shows confirmation modal when clearing data', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText('Clear All Data'));

    expect(screen.getByText('Clear All Data?')).toBeInTheDocument();
    expect(screen.getByText(/permanently delete/)).toBeInTheDocument();
  });

  it('shows install instructions', () => {
    render(<Settings />);
    expect(screen.getByText('Install the App')).toBeInTheDocument();
  });
});
