import { describe, it, expect, beforeEach } from 'vitest';
import { useShotStore } from './shotStore';
import { useBeanStore } from './beanStore';
import { resetDatabase } from '../db';

describe('shotStore', () => {
  let testBeanId: string;

  beforeEach(async () => {
    await resetDatabase();
    useShotStore.setState({
      shots: [],
      latestShot: null,
      isLoading: false,
      error: null,
    });

    // Create a test bean
    const bean = await useBeanStore.getState().addBean({
      name: 'Test Bean',
      roaster: 'Test Roaster',
    });
    testBeanId = bean.id;
  });

  it('starts with empty state', () => {
    const state = useShotStore.getState();
    expect(state.shots).toEqual([]);
    expect(state.latestShot).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loads empty shots list', async () => {
    await useShotStore.getState().loadShots(testBeanId);
    const state = useShotStore.getState();
    expect(state.shots).toEqual([]);
    expect(state.latestShot).toBeNull();
  });

  it('adds a shot', async () => {
    const shot = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    expect(shot.doseGrams).toBe(18);
    expect(shot.ratio).toBe(2);

    const state = useShotStore.getState();
    expect(state.shots).toHaveLength(1);
    expect(state.latestShot?.id).toBe(shot.id);
  });

  it('tracks shot numbers', async () => {
    const shot1 = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 24,
      taste: { balance: -1 },
    });

    const shot2 = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    expect(shot1.shotNumber).toBe(1);
    expect(shot2.shotNumber).toBe(2);
  });

  it('removes a shot', async () => {
    const shot = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    await useShotStore.getState().removeShot(shot.id, testBeanId);

    const state = useShotStore.getState();
    expect(state.shots).toHaveLength(0);
    expect(state.latestShot).toBeNull();
  });

  it('clears shots', async () => {
    await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    useShotStore.getState().clearShots();

    const state = useShotStore.getState();
    expect(state.shots).toEqual([]);
    expect(state.latestShot).toBeNull();
  });
});
