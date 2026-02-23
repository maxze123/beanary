import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardDivider } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies padding classes', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    expect(container.firstChild).toHaveClass('p-3');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('CardDivider', () => {
  it('renders a divider', () => {
    const { container } = render(<CardDivider />);
    expect(container.firstChild).toHaveClass('border-t');
  });
});
