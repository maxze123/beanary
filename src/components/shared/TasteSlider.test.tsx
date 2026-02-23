import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TasteSlider } from './TasteSlider';

describe('TasteSlider', () => {
  it('renders with current value label', () => {
    render(<TasteSlider value={0} onChange={() => {}} />);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('shows sour label for negative values', () => {
    render(<TasteSlider value={-2} onChange={() => {}} />);
    expect(screen.getByText('Very Sour')).toBeInTheDocument();
  });

  it('shows bitter label for positive values', () => {
    render(<TasteSlider value={2} onChange={() => {}} />);
    expect(screen.getByText('Very Bitter')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<TasteSlider value={0} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1' } });

    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('can be disabled', () => {
    render(<TasteSlider value={0} onChange={() => {}} disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });
});
