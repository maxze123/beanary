import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md';
}

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
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
  children?: ReactNode;
  className?: string;
}

export function CardDivider({ children, className = '' }: CardDividerProps) {
  return (
    <div
      className={`border-t border-crema-200 dark:border-roast-700 mt-3 pt-3 ${className}`}
    >
      {children}
    </div>
  );
}
