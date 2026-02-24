/**
 * Calculate the ratio from dose and yield.
 * Returns rounded to 2 decimal places.
 */
export function calculateRatio(doseGrams: number, yieldGrams: number): number {
  if (doseGrams <= 0) return 0;
  return Math.round((yieldGrams / doseGrams) * 100) / 100;
}

/**
 * Format ratio for display (e.g., "1:2.2")
 */
export function formatRatio(ratio: number): string {
  return `1:${ratio.toFixed(1)}`;
}

/**
 * Format time for display (e.g., "28s" or "1:05")
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get a human-readable label for a balance value.
 */
export function getBalanceLabel(balance: number): string {
  const labels: Record<number, string> = {
    [-2]: 'Very Sour',
    [-1]: 'Slightly Sour',
    [0]: 'Balanced',
    [1]: 'Slightly Bitter',
    [2]: 'Very Bitter',
  };
  return labels[balance] || 'Unknown';
}

/**
 * Get a color class for a balance value.
 */
export function getBalanceColor(balance: number): string {
  if (balance === 0) return 'text-dialed dark:text-dialed-dm-text';
  if (balance < 0) return 'text-amber-600 dark:text-amber-400';
  return 'text-orange-600 dark:text-orange-400';
}
