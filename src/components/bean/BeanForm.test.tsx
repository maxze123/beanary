import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeanForm } from './BeanForm';

describe('BeanForm', () => {
  it('renders all fields', () => {
    render(<BeanForm onSubmit={() => {}} />);
    expect(screen.getByLabelText('Bean Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Roaster')).toBeInTheDocument();
    expect(screen.getByLabelText('Roast Date (optional)')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', () => {
    render(<BeanForm onSubmit={() => {}} />);
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Bean name is required')).toBeInTheDocument();
    expect(screen.getByText('Roaster is required')).toBeInTheDocument();
  });

  it('calls onSubmit with form values', () => {
    const handleSubmit = vi.fn();
    render(<BeanForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Bean Name'), {
      target: { value: 'Test Bean' },
    });
    fireEvent.change(screen.getByLabelText('Roaster'), {
      target: { value: 'Test Roaster' },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Test Bean',
      roaster: 'Test Roaster',
      roastDate: null,
      notes: '',
    });
  });

  it('populates initial values', () => {
    render(
      <BeanForm
        onSubmit={() => {}}
        initialValues={{ name: 'Existing', roaster: 'Roaster' }}
      />
    );
    expect(screen.getByLabelText('Bean Name')).toHaveValue('Existing');
    expect(screen.getByLabelText('Roaster')).toHaveValue('Roaster');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(<BeanForm onSubmit={() => {}} onCancel={handleCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalled();
  });
});
