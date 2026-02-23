import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders 5 stars', () => {
    render(<StarRating value={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('calls onChange when star is clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating value={3} onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('4 stars'));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('does not call onChange when readonly', () => {
    const handleChange = vi.fn();
    render(<StarRating value={3} onChange={handleChange} readonly />);

    fireEvent.click(screen.getByLabelText('4 stars'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('displays null value as empty stars', () => {
    const { container } = render(<StarRating value={null} />);
    const filledStars = container.querySelectorAll('.text-caramel-400');
    expect(filledStars).toHaveLength(0);
  });
});
