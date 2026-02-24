import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShotForm } from './ShotForm';

describe('ShotForm', () => {
  const defaultProps = {
    beanId: 'bean-123',
    onSubmit: vi.fn(),
  };

  it('renders all input fields', () => {
    render(<ShotForm {...defaultProps} />);
    expect(screen.getByLabelText('Dose (g)')).toBeInTheDocument();
    expect(screen.getByLabelText('Yield (g)')).toBeInTheDocument();
    expect(screen.getByLabelText('Time (s)')).toBeInTheDocument();
    expect(screen.getByLabelText('Grind Setting (optional)')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', () => {
    render(<ShotForm {...defaultProps} />);

    // Clear default dose value and submit
    fireEvent.change(screen.getByLabelText('Dose (g)'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Log Shot'));

    expect(screen.getByText('Enter a valid dose')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid yield')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid time')).toBeInTheDocument();
  });

  it('calculates and displays ratio', () => {
    render(<ShotForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Dose (g)'), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText('Yield (g)'), { target: { value: '36' } });

    expect(screen.getByText('1:2.0')).toBeInTheDocument();
  });

  it('calls onSubmit with form values', () => {
    const handleSubmit = vi.fn();
    render(<ShotForm {...defaultProps} onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Dose (g)'), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText('Yield (g)'), { target: { value: '36' } });
    fireEvent.change(screen.getByLabelText('Time (s)'), { target: { value: '28' } });
    fireEvent.click(screen.getByText('Log Shot'));

    expect(handleSubmit).toHaveBeenCalledWith({
      beanId: 'bean-123',
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      grindSetting: '',
      taste: { balance: 0 },
      notes: '',
    });
  });

  it('pre-fills from previous shot', () => {
    const previousShot = {
      id: 'shot-1',
      beanId: 'bean-123',
      doseGrams: 18,
      yieldGrams: 40,
      timeSeconds: 30,
      grindSetting: '2.5',
      ratio: 2.22,
      taste: { balance: 0 as const },
      notes: '',
      shotNumber: 1,
      isDialedShot: false,
      createdAt: '2026-01-01',
    };

    render(<ShotForm {...defaultProps} previousShot={previousShot} />);

    expect(screen.getByLabelText('Dose (g)')).toHaveValue(18);
    expect(screen.getByLabelText('Yield (g)')).toHaveValue(40);
    expect(screen.getByLabelText('Time (s)')).toHaveValue(30);
    expect(screen.getByLabelText('Grind Setting (optional)')).toHaveValue('2.5');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(<ShotForm {...defaultProps} onCancel={handleCancel} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalled();
  });
});
