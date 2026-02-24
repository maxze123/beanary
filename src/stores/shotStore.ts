import { create } from 'zustand';
import type { Shot } from '../types';
import type { CreateShotInput } from '../types';
import {
  getShotsForBean,
  getLatestShotForBean,
  createShot,
  deleteShot,
} from '../db';

interface ShotState {
  shots: Shot[];
  latestShot: Shot | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadShots: (beanId: string) => Promise<void>;
  loadLatestShot: (beanId: string) => Promise<void>;
  addShot: (input: CreateShotInput) => Promise<Shot>;
  removeShot: (id: string, beanId: string) => Promise<void>;
  clearShots: () => void;
  clearError: () => void;
}

export const useShotStore = create<ShotState>((set) => ({
  shots: [],
  latestShot: null,
  isLoading: false,
  error: null,

  loadShots: async (beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      const shots = await getShotsForBean(beanId);
      const latestShot = shots.length > 0 ? shots[shots.length - 1] : null;
      set({ shots, latestShot, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load shots', isLoading: false });
    }
  },

  loadLatestShot: async (beanId: string) => {
    try {
      const shot = await getLatestShotForBean(beanId);
      set({ latestShot: shot || null });
    } catch (e) {
      // Silent fail - not critical
    }
  },

  addShot: async (input: CreateShotInput) => {
    set({ isLoading: true, error: null });
    try {
      const shot = await createShot(input);
      const shots = await getShotsForBean(input.beanId);
      set({ shots, latestShot: shot, isLoading: false });
      return shot;
    } catch (e) {
      set({ error: 'Failed to log shot', isLoading: false });
      throw e;
    }
  },

  removeShot: async (id: string, beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteShot(id);
      const shots = await getShotsForBean(beanId);
      const latestShot = shots.length > 0 ? shots[shots.length - 1] : null;
      set({ shots, latestShot, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to delete shot', isLoading: false });
      throw e;
    }
  },

  clearShots: () => set({ shots: [], latestShot: null }),

  clearError: () => set({ error: null }),
}));
