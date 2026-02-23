import { describe, it, expect, beforeEach } from 'vitest';
import { db, resetDatabase } from './database';

describe('BeanaryDatabase', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('initializes with empty tables', async () => {
    const beanCount = await db.beans.count();
    const shotCount = await db.shots.count();
    expect(beanCount).toBe(0);
    expect(shotCount).toBe(0);
  });

  it('has beans table', () => {
    expect(db.beans).toBeDefined();
  });

  it('has shots table', () => {
    expect(db.shots).toBeDefined();
  });
});
