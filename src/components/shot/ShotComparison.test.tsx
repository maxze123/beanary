import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShotComparison } from './ShotComparison';
import type { Shot } from '../../types';

const createMockShot = (overrides: Partial<Shot> = {}): Shot => ({
  id: 'shot-1',
  beanId: 'bean-1',
  doseGrams: 18,
  yieldGrams: 36,
  timeSeconds: 28,
  grindSetting: '',
  ratio: 2,
  taste: { balance: 0 },
  notes: '',
  shotNumber: 1,
  isDialedShot: false,
  createdAt: '2026-01-01',
  ...overrides,
});

describe('ShotComparison', () => {
  it('renders current shot details', () => {
    const shot = createMockShot();
    render(<ShotComparison currentShot={shot} />);

    expect(screen.getByText('Shot #1')).toBeInTheDocument();
    expect(screen.getByText('18g')).toBeInTheDocument();
    expect(screen.getByText('36g')).toBeInTheDocument();
    expect(screen.getByText('28s')).toBeInTheDocument();
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('shows comparison with previous shot', () => {
    const current = createMockShot({ shotNumber: 2, yieldGrams: 40, timeSeconds: 30 });
    const previous = createMockShot({ shotNumber: 1, yieldGrams: 36, timeSeconds: 28 });

    render(<ShotComparison currentShot={current} previousShot={previous} />);

    expect(screen.getByText('vs Shot #1')).toBeInTheDocument();
    expect(screen.getByText('+4g')).toBeInTheDocument();
    expect(screen.getByText('+2s')).toBeInTheDocument();
  });

  it('shows 0g for unchanged yield', () => {
    const current = createMockShot({ shotNumber: 2, yieldGrams: 36 });
    const previous = createMockShot({ shotNumber: 1, yieldGrams: 36 });

    render(<ShotComparison currentShot={current} previousShot={previous} />);

    expect(screen.getByText('0g')).toBeInTheDocument();
  });

  it('shows previous shot taste in comparison', () => {
    const current = createMockShot({ shotNumber: 2, taste: { balance: 0 } });
    const previous = createMockShot({ shotNumber: 1, taste: { balance: -1 } });

    render(<ShotComparison currentShot={current} previousShot={previous} />);

    // Should show "Slightly Sour" as the previous taste
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Slightly Sour')).toBeInTheDocument();
  });

  it('shows "Mark as Dialed" button for balanced shots', () => {
    const shot = createMockShot({ taste: { balance: 0 } });
    const handleDial = vi.fn();

    render(<ShotComparison currentShot={shot} onMarkAsDialed={handleDial} />);

    const button = screen.getByText('Mark as Dialed');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleDial).toHaveBeenCalled();
  });

  it('shows guidance card', () => {
    const shot = createMockShot({ taste: { balance: -1 }, timeSeconds: 18 });
    render(<ShotComparison currentShot={shot} />);

    // Should show guidance for sour + fast shot
    expect(screen.getByText('Grind finer')).toBeInTheDocument();
  });

  it('does not show "Mark as Dialed" for non-balanced shots', () => {
    const shot = createMockShot({ taste: { balance: -1 } });
    render(<ShotComparison currentShot={shot} onMarkAsDialed={() => {}} />);

    expect(screen.queryByText('Mark as Dialed')).not.toBeInTheDocument();
  });
});
