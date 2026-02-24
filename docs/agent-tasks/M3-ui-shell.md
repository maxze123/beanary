# Agent Task: M3 - UI Shell

**Milestone:** M3  
**Agent:** Claude Code  
**Estimated time:** 60-90 minutes  
**Depends on:** M0 (Project Setup) complete  
**Can run parallel with:** M1, M2 (no shared files)

---

## Context

You are creating the app skeleton, navigation, and shared UI components for an espresso dial-in companion app called "Beanary". This milestone establishes the visual foundation that all features will build on.

Read the following documentation files before starting:
- `/docs/05-design-system.md` — Colors, typography, spacing, component specs
- `/docs/02-tech-stack.md` — Project structure

---

## Objective

Create the app layout, routing, navigation, and reusable UI components.

**Success criteria:**
- App renders with correct layout structure
- Navigation between pages works
- All shared components render correctly
- Light and dark mode both work (via system preference)
- Mobile-first responsive layout (375px baseline)
- All components have basic tests
- No linting errors

---

## Files to Create

```
src/components/shared/
├── Button.tsx
├── Button.test.tsx
├── Input.tsx
├── Input.test.tsx
├── Card.tsx
├── Card.test.tsx
├── TasteSlider.tsx
├── TasteSlider.test.tsx
├── Modal.tsx
├── Modal.test.tsx
├── EmptyState.tsx
├── StarRating.tsx
├── StarRating.test.tsx
├── Badge.tsx
└── index.ts

src/components/layout/
├── AppLayout.tsx
├── BottomNav.tsx
└── index.ts

src/pages/
├── Library.tsx
├── BeanDetail.tsx
├── NewBean.tsx
├── LogShot.tsx
├── Settings.tsx
└── index.ts

src/
├── App.tsx (update)
└── App.test.tsx (update)
```

---

## Step-by-Step Instructions

### 1. Create Button Component

Create `src/components/shared/Button.tsx`:

```tsx
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-caramel-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-caramel-500 text-white hover:bg-caramel-600 active:scale-[0.98]',
    secondary:
      'bg-crema-100 dark:bg-roast-800 text-espresso-900 dark:text-steam-50 border border-crema-200 dark:border-roast-700 hover:bg-crema-200 dark:hover:bg-roast-700',
    ghost:
      'text-caramel-500 hover:bg-caramel-100 dark:hover:bg-caramel-500/20',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

Create `src/components/shared/Button.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>);
    expect(screen.getByText('Btn')).toHaveClass('bg-caramel-500');

    rerender(<Button variant="ghost">Btn</Button>);
    expect(screen.getByText('Btn')).toHaveClass('text-caramel-500');
  });
});
```

### 2. Create Input Component

Create `src/components/shared/Input.tsx`:

```tsx
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs text-espresso-700/60 dark:text-steam-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-11 px-3 rounded-lg
            bg-crema-50 dark:bg-roast-800
            border border-crema-200 dark:border-roast-600
            text-espresso-900 dark:text-steam-50
            placeholder:text-crema-400 dark:placeholder:text-steam-400
            focus:outline-none focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

Create `src/components/shared/Input.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Dose" />);
    expect(screen.getByLabelText('Dose')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '18' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
```

### 3. Create Card Component

Create `src/components/shared/Card.tsx`:

```tsx
import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md';
}

export function Card({
  children,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
  };

  return (
    <div
      className={`
        bg-crema-100 dark:bg-roast-900
        border border-crema-200 dark:border-roast-700
        rounded-2xl
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardDividerProps {
  className?: string;
}

export function CardDivider({ className = '' }: CardDividerProps) {
  return (
    <div
      className={`border-t border-crema-200 dark:border-roast-700 mt-3 pt-3 ${className}`}
    />
  );
}
```

Create `src/components/shared/Card.test.tsx`:

```tsx
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
```

### 4. Create TasteSlider Component

Create `src/components/shared/TasteSlider.tsx`:

```tsx
import { type BalanceValue } from '../../types';

interface TasteSliderProps {
  value: BalanceValue;
  onChange: (value: BalanceValue) => void;
  disabled?: boolean;
}

const balanceLabels: Record<BalanceValue, string> = {
  '-2': 'Very Sour',
  '-1': 'Slightly Sour',
  '0': 'Balanced',
  '1': 'Slightly Bitter',
  '2': 'Very Bitter',
};

export function TasteSlider({ value, onChange, disabled }: TasteSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value) as BalanceValue);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-espresso-700/60 dark:text-steam-300 mb-2">
        <span>Sour</span>
        <span>Bitter</span>
      </div>
      
      <input
        type="range"
        min={-2}
        max={2}
        step={1}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="
          w-full h-1 rounded-full appearance-none cursor-pointer
          bg-crema-200 dark:bg-roast-700
          disabled:opacity-50 disabled:cursor-not-allowed
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-caramel-500
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-caramel-500
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer
        "
      />
      
      <div className="mt-2 text-center">
        <span className="text-sm font-medium text-espresso-900 dark:text-steam-50">
          {balanceLabels[value.toString() as keyof typeof balanceLabels]}
        </span>
      </div>
    </div>
  );
}
```

Create `src/components/shared/TasteSlider.test.tsx`:

```tsx
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
```

### 5. Create Modal Component

Create `src/components/shared/Modal.tsx`:

```tsx
import { type ReactNode, useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-espresso-950/50 dark:bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="
          relative w-full max-w-sm
          bg-crema-50 dark:bg-roast-900
          rounded-2xl shadow-xl
          p-5
        "
      >
        <h2
          id="modal-title"
          className="text-lg font-semibold text-espresso-900 dark:text-steam-50 mb-3"
        >
          {title}
        </h2>
        
        <div className="text-sm text-espresso-700 dark:text-steam-200">
          {children}
        </div>
        
        {actions && (
          <div className="mt-4 flex gap-2 justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'primary' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
```

Create `src/components/shared/Modal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ConfirmModal } from './Modal';

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    );
    
    // Click the backdrop (the first div with the bg class)
    const backdrop = document.querySelector('.bg-espresso-950\\/50');
    if (backdrop) fireEvent.click(backdrop);
    
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});

describe('ConfirmModal', () => {
  it('renders confirm and cancel buttons', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm Action"
        message="Are you sure?"
      />
    );
    
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when confirmed', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Confirm"
        message="Sure?"
      />
    );
    
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(handleConfirm).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
```

### 6. Create EmptyState Component

Create `src/components/shared/EmptyState.tsx`:

```tsx
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-crema-400 dark:text-steam-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-espresso-900 dark:text-steam-50 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-espresso-700/60 dark:text-steam-300 mb-4 max-w-xs">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
```

### 7. Create StarRating Component

Create `src/components/shared/StarRating.tsx`:

```tsx
interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`${sizeClasses} ${
              value !== null && star <= value
                ? 'text-caramel-400'
                : 'text-crema-300 dark:text-roast-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
```

Create `src/components/shared/StarRating.test.tsx`:

```tsx
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
```

### 8. Create Badge Component

Create `src/components/shared/Badge.tsx`:

```tsx
import { type ReactNode } from 'react';

interface BadgeProps {
  variant: 'dialed' | 'progress' | 'default';
  children: ReactNode;
  icon?: ReactNode;
}

export function Badge({ variant, children, icon }: BadgeProps) {
  const variants = {
    dialed: 'bg-dialed-light dark:bg-dialed-dm-bg text-dialed-dark dark:text-dialed-dm-text',
    progress: 'bg-caramel-100 dark:bg-caramel-500/20 text-caramel-500 dark:text-caramel-300',
    default: 'bg-crema-200 dark:bg-roast-700 text-espresso-700 dark:text-steam-200',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        text-xs font-medium
        ${variants[variant]}
      `}
    >
      {icon}
      {children}
    </span>
  );
}

// Pre-built badge variants
export function DialedBadge() {
  return (
    <Badge
      variant="dialed"
      icon={
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      }
    >
      Dialed
    </Badge>
  );
}

export function ProgressBadge() {
  return (
    <Badge
      variant="progress"
      icon={<span className="w-1.5 h-1.5 rounded-full bg-caramel-400" />}
    >
      Dialing in
    </Badge>
  );
}
```

### 9. Create Shared Components Barrel Export

Create `src/components/shared/index.ts`:

```typescript
export { Button } from './Button';
export { Input } from './Input';
export { Card, CardDivider } from './Card';
export { TasteSlider } from './TasteSlider';
export { Modal, ConfirmModal } from './Modal';
export { EmptyState } from './EmptyState';
export { StarRating } from './StarRating';
export { Badge, DialedBadge, ProgressBadge } from './Badge';
```

### 10. Create Layout Components

Create `src/components/layout/BottomNav.tsx`:

```tsx
import { NavLink } from 'react-router-dom';

export function BottomNav() {
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 ${
      isActive
        ? 'text-espresso-900 dark:text-steam-50'
        : 'text-espresso-700/50 dark:text-steam-400'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-crema-50 dark:bg-roast-950 border-t border-crema-200 dark:border-roast-700 px-6 py-3 pb-safe">
      <div className="max-w-[375px] mx-auto flex justify-around items-center">
        {/* Library */}
        <NavLink to="/" className={navItemClass}>
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          <span className="text-xs font-medium">Library</span>
        </NavLink>

        {/* Add Bean - FAB */}
        <NavLink
          to="/bean/new"
          className="-mt-4 flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-caramel-500 flex items-center justify-center shadow-lg shadow-caramel-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
        </NavLink>

        {/* Settings */}
        <NavLink to="/settings" className={navItemClass}>
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xs">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
```

Create `src/components/layout/AppLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-crema-50 dark:bg-roast-950 text-espresso-900 dark:text-steam-50">
      <div className="max-w-[375px] mx-auto min-h-screen pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
```

Create `src/components/layout/index.ts`:

```typescript
export { AppLayout } from './AppLayout';
export { BottomNav } from './BottomNav';
```

### 11. Create Page Placeholders

Create `src/pages/Library.tsx`:

```tsx
export function Library() {
  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold">Your Beans</h1>
      <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
        Your coffee library
      </p>
    </div>
  );
}
```

Create `src/pages/BeanDetail.tsx`:

```tsx
import { useParams } from 'react-router-dom';

export function BeanDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold">Bean Detail</h1>
      <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
        Bean ID: {id}
      </p>
    </div>
  );
}
```

Create `src/pages/NewBean.tsx`:

```tsx
export function NewBean() {
  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold">Add Bean</h1>
      <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
        Add a new coffee to your library
      </p>
    </div>
  );
}
```

Create `src/pages/LogShot.tsx`:

```tsx
import { useParams } from 'react-router-dom';

export function LogShot() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold">Log Shot</h1>
      <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
        Bean ID: {id}
      </p>
    </div>
  );
}
```

Create `src/pages/Settings.tsx`:

```tsx
export function Settings() {
  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
        App settings and data export
      </p>
    </div>
  );
}
```

Create `src/pages/index.ts`:

```typescript
export { Library } from './Library';
export { BeanDetail } from './BeanDetail';
export { NewBean } from './NewBean';
export { LogShot } from './LogShot';
export { Settings } from './Settings';
```

### 12. Update App.tsx with Routing

Update `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { Library, BeanDetail, NewBean, LogShot, Settings } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Library />} />
          <Route path="/bean/new" element={<NewBean />} />
          <Route path="/bean/:id" element={<BeanDetail />} />
          <Route path="/bean/:id/shot" element={<LogShot />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 13. Update App Test

Update `src/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the library page by default', () => {
    render(<App />);
    expect(screen.getByText('Your Beans')).toBeInTheDocument();
  });

  it('renders bottom navigation', () => {
    render(<App />);
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
```

### 14. Add Safe Area CSS

Update `src/index.css` to add safe area support:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Safe area utilities for iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.pt-safe {
  padding-top: env(safe-area-inset-top, 0);
}
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run dev` starts and shows the app
- [ ] Navigation between all pages works
- [ ] Bottom navigation highlights active page
- [ ] FAB (add button) links to /bean/new
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly (change system preference)
- [ ] All component tests pass (`npm run test:run`)
- [ ] No linting errors (`npm run lint`)
- [ ] App looks correct at 375px viewport width

---

## Notes for Agent

- Follow the design system exactly (colors, spacing, typography)
- Use the coffee-themed color names (espresso, crema, roast, steam, caramel)
- All components must support both light and dark mode
- Keep page components minimal—they're placeholders for now
- Test files can be simpler than shown if time is limited, but cover basic functionality
- Commit message: `feat(ui): add app shell and shared components`
