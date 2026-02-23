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
