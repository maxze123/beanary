import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GuidanceCard } from './GuidanceCard';
import type { GuidanceSuggestion } from '../../types';

describe('GuidanceCard', () => {
  it('renders guidance message and reasoning', () => {
    const guidance: GuidanceSuggestion = {
      action: 'grind-finer',
      message: 'Grind finer',
      confidence: 'high',
      reasoning: 'Shot ran fast and tastes sour.',
    };

    render(<GuidanceCard guidance={guidance} />);

    expect(screen.getByText('Grind finer')).toBeInTheDocument();
    expect(screen.getByText('Shot ran fast and tastes sour.')).toBeInTheDocument();
  });

  it('renders success styling for "none" action', () => {
    const guidance: GuidanceSuggestion = {
      action: 'none',
      message: 'This tastes dialed in!',
      confidence: 'high',
      reasoning: 'Consider saving this recipe.',
    };

    render(<GuidanceCard guidance={guidance} />);

    expect(screen.getByText('This tastes dialed in!')).toBeInTheDocument();
  });

  it('renders all confidence levels', () => {
    const highConfidence: GuidanceSuggestion = {
      action: 'grind-finer',
      message: 'Test',
      confidence: 'high',
      reasoning: 'Test',
    };

    const { container } = render(<GuidanceCard guidance={highConfidence} />);

    // Should have 3 dots for high confidence
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(3);
  });

  it('renders experiment action', () => {
    const guidance: GuidanceSuggestion = {
      action: 'experiment',
      message: 'Check your puck prep',
      confidence: 'low',
      reasoning: 'Unusual extraction behavior.',
    };

    render(<GuidanceCard guidance={guidance} />);

    expect(screen.getByText('Check your puck prep')).toBeInTheDocument();
  });
});
