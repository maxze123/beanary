import { describe, it, expect, beforeEach } from 'vitest';
import { useBeanStore } from './beanStore';
import { resetDatabase } from '../db';

describe('beanStore', () => {
  beforeEach(async () => {
    await resetDatabase();
    useBeanStore.setState({
      beans: [],
      currentBean: null,
      isLoading: false,
      error: null,
    });
  });

  it('starts with empty state', () => {
    const state = useBeanStore.getState();
    expect(state.beans).toEqual([]);
    expect(state.currentBean).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loads empty beans list', async () => {
    await useBeanStore.getState().loadBeans();
    const state = useBeanStore.getState();
    expect(state.beans).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('adds a bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Test Bean',
      roaster: 'Test Roaster',
    });

    expect(bean.name).toBe('Test Bean');

    const state = useBeanStore.getState();
    expect(state.beans).toHaveLength(1);
    expect(state.beans[0].name).toBe('Test Bean');
  });

  it('loads a specific bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Test Bean',
      roaster: 'Test Roaster',
    });

    await useBeanStore.getState().loadBean(bean.id);

    const state = useBeanStore.getState();
    expect(state.currentBean).not.toBeNull();
    expect(state.currentBean?.id).toBe(bean.id);
  });

  it('edits a bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Original',
      roaster: 'Roaster',
    });

    await useBeanStore.getState().editBean({
      id: bean.id,
      name: 'Updated',
    });

    const state = useBeanStore.getState();
    expect(state.beans[0].name).toBe('Updated');
  });

  it('removes a bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Test',
      roaster: 'Roaster',
    });

    await useBeanStore.getState().removeBean(bean.id);

    const state = useBeanStore.getState();
    expect(state.beans).toHaveLength(0);
  });

  it('clears error', () => {
    useBeanStore.setState({ error: 'Some error' });
    useBeanStore.getState().clearError();
    expect(useBeanStore.getState().error).toBeNull();
  });
});
