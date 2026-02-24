import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BeanCard } from './BeanCard';
import type { Bean } from '../../types';

const baseMockBean: Bean = {
  id: '123',
  name: 'Ethiopia Yirgacheffe',
  roaster: 'Square Mile',
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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('BeanCard', () => {
  it('renders bean name and roaster', () => {
    renderWithRouter(<BeanCard bean={baseMockBean} />);
    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(screen.getByText('Square Mile')).toBeInTheDocument();
  });

  it('shows empty state when no shots', () => {
    renderWithRouter(<BeanCard bean={baseMockBean} shotCount={0} />);
    expect(screen.getByText(/No shots yet/)).toBeInTheDocument();
  });

  it('shows progress badge when has shots but not dialed', () => {
    renderWithRouter(<BeanCard bean={baseMockBean} shotCount={3} />);
    expect(screen.getByText('Dialing in')).toBeInTheDocument();
    expect(screen.getByText(/3 shots logged/)).toBeInTheDocument();
  });

  it('shows dialed badge and recipe when dialed', () => {
    const dialedBean: Bean = {
      ...baseMockBean,
      isDialedIn: true,
      dialedRecipe: {
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        grindSetting: '2.5',
        ratio: 2,
        sourceShotId: 'shot-1',
        savedAt: '2026-01-01',
      },
    };

    renderWithRouter(<BeanCard bean={dialedBean} />);
    expect(screen.getByText('Dialed')).toBeInTheDocument();
    expect(screen.getByText('18g')).toBeInTheDocument();
    expect(screen.getByText('36g')).toBeInTheDocument();
    expect(screen.getByText('28s')).toBeInTheDocument();
  });

  it('shows rating when set', () => {
    const ratedBean: Bean = { ...baseMockBean, rating: 4 };
    renderWithRouter(<BeanCard bean={ratedBean} />);
    // StarRating renders 5 buttons
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });
});
