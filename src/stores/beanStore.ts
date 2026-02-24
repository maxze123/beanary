import { create } from 'zustand';
import type { Bean } from '../types';
import {
  getAllBeans,
  getBeanById,
  createBean,
  updateBean,
  deleteBean,
  markBeanAsDialed,
  clearDialedStatus,
} from '../db';
import type { CreateBeanInput, UpdateBeanInput } from '../types';

interface BeanState {
  beans: Bean[];
  currentBean: Bean | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBeans: () => Promise<void>;
  loadBean: (id: string) => Promise<void>;
  addBean: (input: CreateBeanInput) => Promise<Bean>;
  editBean: (input: UpdateBeanInput) => Promise<void>;
  removeBean: (id: string) => Promise<void>;
  dialBean: (beanId: string, shotId: string) => Promise<void>;
  undialBean: (beanId: string) => Promise<void>;
  clearError: () => void;
}

export const useBeanStore = create<BeanState>((set, get) => ({
  beans: [],
  currentBean: null,
  isLoading: false,
  error: null,

  loadBeans: async () => {
    set({ isLoading: true, error: null });
    try {
      const beans = await getAllBeans();
      set({ beans, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load beans', isLoading: false });
    }
  },

  loadBean: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const bean = await getBeanById(id);
      set({ currentBean: bean || null, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load bean', isLoading: false });
    }
  },

  addBean: async (input: CreateBeanInput) => {
    set({ isLoading: true, error: null });
    try {
      const bean = await createBean(input);
      const beans = await getAllBeans();
      set({ beans, isLoading: false });
      return bean;
    } catch (e) {
      set({ error: 'Failed to add bean', isLoading: false });
      throw e;
    }
  },

  editBean: async (input: UpdateBeanInput) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateBean(input);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === input.id ? updated : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to update bean', isLoading: false });
      throw e;
    }
  },

  removeBean: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteBean(id);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === id ? null : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to delete bean', isLoading: false });
      throw e;
    }
  },

  dialBean: async (beanId: string, shotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await markBeanAsDialed(beanId, shotId);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === beanId ? updated : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to mark as dialed', isLoading: false });
      throw e;
    }
  },

  undialBean: async (beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await clearDialedStatus(beanId);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === beanId ? updated : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to clear dialed status', isLoading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
