import type { GuidanceSuggestion } from '../../types';
import { Card } from '../shared';

interface GuidanceCardProps {
  guidance: GuidanceSuggestion;
}

export function GuidanceCard({ guidance }: GuidanceCardProps) {
  const { action, message, confidence, reasoning } = guidance;

  // Color scheme based on action
  const getActionStyles = () => {
    switch (action) {
      case 'none':
        return {
          bg: 'bg-dialed-light dark:bg-dialed-dm-bg',
          border: 'border-dialed/30 dark:border-dialed-dm-text/30',
          icon: 'text-dialed-dark dark:text-dialed-dm-text',
          text: 'text-dialed-dark dark:text-dialed-dm-text',
        };
      case 'grind-finer':
      case 'grind-coarser':
        return {
          bg: 'bg-caramel-100 dark:bg-caramel-500/20',
          border: 'border-caramel-300 dark:border-caramel-500/30',
          icon: 'text-caramel-600 dark:text-caramel-400',
          text: 'text-caramel-700 dark:text-caramel-300',
        };
      case 'experiment':
      default:
        return {
          bg: 'bg-crema-100 dark:bg-roast-800',
          border: 'border-crema-300 dark:border-roast-600',
          icon: 'text-espresso-700 dark:text-steam-300',
          text: 'text-espresso-700 dark:text-steam-300',
        };
    }
  };

  const styles = getActionStyles();

  // Icon based on action
  const renderIcon = () => {
    switch (action) {
      case 'none':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'grind-finer':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        );
      case 'grind-coarser':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        );
      case 'experiment':
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  // Confidence indicator
  const renderConfidence = () => {
    const dots = confidence === 'high' ? 3 : confidence === 'medium' ? 2 : 1;
    return (
      <div className="flex items-center gap-0.5" title={`${confidence} confidence`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i <= dots
                ? 'bg-current opacity-100'
                : 'bg-current opacity-30'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className={`${styles.bg} border ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} mt-0.5`}>
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium ${styles.text}`}>
              {message}
            </span>
            <div className={styles.icon}>
              {renderConfidence()}
            </div>
          </div>
          <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
            {reasoning}
          </p>
        </div>
      </div>
    </Card>
  );
}
