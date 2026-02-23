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
      {icon && <div className="mb-4 text-crema-400 dark:text-steam-400">{icon}</div>}
      <h3 className="text-lg font-medium text-espresso-900 dark:text-steam-50 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-espresso-700/60 dark:text-steam-300 mb-4 max-w-xs">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
