/**
 * Generates a unique identifier using crypto.randomUUID().
 * Used for all entity IDs (beans, shots).
 */
export function generateId(): string {
  return crypto.randomUUID();
}
