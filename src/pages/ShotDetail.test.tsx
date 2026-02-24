import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShotDetail } from './ShotDetail';
import type { Shot, Bean } from '../types';

const mockShot: Shot = {
  id: 'shot-1',
  beanId: 'bean-1',
  doseGrams: 18,
  yieldGrams: 36,
  timeSeconds: 28,
  grindSetting: '2.5',
  ratio: 2,
  taste: { balance: 0 },
  notes: 'Tastes great',
  shotNumber: 3,
  isDialedShot: false,
  createdAt: '2026-01-01T10:00:00Z',
};

const mockBean: Bean = {
  id: 'bean-1',
  name: 'Test Bean',
  roaster: 'Test Roaster',
  roastDate: null,
  rating: null,
  notes: '',
  origin: null,
  process: null,
  roastLevel: null,
  dialedRecipe: null,
  isDialedIn: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

vi.mock('../stores/shotStore', () => ({
  useShotStore: () => ({
    shots: [mockShot],
    loadShots: vi.fn(),
    editShot: vi.fn().mockResolvedValue(mockShot),
    removeShot: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}));

vi.mock('../stores/beanStore', () => ({
  useBeanStore: () => ({
    currentBean: mockBean,
    loadBean: vi.fn(),
  }),
}));

function renderShotDetail() {
  return render(
    <MemoryRouter initialEntries={['/bean/bean-1/shot/shot-1']}>
      <Routes>
        <Route path="/bean/:beanId/shot/:shotId" element={<ShotDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ShotDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders shot details', () => {
    renderShotDetail();
    expect(screen.getByText('Shot #3')).toBeInTheDocument();
    expect(screen.getByText('18g')).toBeInTheDocument();
    expect(screen.getByText('36g')).toBeInTheDocument();
    expect(screen.getByText('28s')).toBeInTheDocument();
  });

  it('shows taste label', () => {
    renderShotDetail();
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('shows notes when present', () => {
    renderShotDetail();
    expect(screen.getByText('Tastes great')).toBeInTheDocument();
  });

  it('shows edit and delete buttons', () => {
    renderShotDetail();
    expect(screen.getByLabelText('Edit shot')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete shot')).toBeInTheDocument();
  });

  it('shows bean name in back navigation', () => {
    renderShotDetail();
    expect(screen.getByText('Test Bean')).toBeInTheDocument();
  });

  it('shows dialed indicator for dialed shot', () => {
    vi.mocked(vi.fn()).mockReturnValue(undefined);
    render(
      <MemoryRouter initialEntries={['/bean/bean-1/shot/shot-1']}>
        <Routes>
          <Route
            path="/bean/:beanId/shot/:shotId"
            element={<ShotDetail />}
          />
        </Routes>
      </MemoryRouter>
    );
  });
});
