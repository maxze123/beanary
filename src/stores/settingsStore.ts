import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EquipmentProfile } from '../types';

interface SettingsState {
  equipment: EquipmentProfile;
  telemetryEnabled: boolean;

  setEquipment: (equipment: Partial<EquipmentProfile>) => void;
  setTelemetryEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      equipment: {
        grinder: '',
        machine: '',
      },
      telemetryEnabled: false,

      setEquipment: (equipment) => {
        set({
          equipment: {
            ...get().equipment,
            ...equipment,
          },
        });
      },

      setTelemetryEnabled: (enabled) => {
        set({ telemetryEnabled: enabled });
      },
    }),
    {
      name: 'beanary-settings',
    }
  )
);
