/**
 * Settings Store
 * 설정 상태 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
    // State
    pcscPort: string;
    diagramPath: string;
    autoConnect: boolean;
    theme: 'light' | 'dark';

    // Actions
    setPcscPort: (port: string) => void;
    setDiagramPath: (path: string) => void;
    setAutoConnect: (enabled: boolean) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    reset: () => void;
}

const defaultSettings = {
    pcscPort: 'localhost:8888',
    diagramPath: '',
    autoConnect: false,
    theme: 'light' as const,
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            // Initial State
            ...defaultSettings,

            // Actions
            setPcscPort: (port: string) => {
                set({ pcscPort: port });
            },

            setDiagramPath: (path: string) => {
                set({ diagramPath: path });
            },

            setAutoConnect: (enabled: boolean) => {
                set({ autoConnect: enabled });
            },

            setTheme: (theme: 'light' | 'dark') => {
                set({ theme });
            },

            reset: () => {
                set(defaultSettings);
            },
        }),
        {
            name: 'scard-settings', // localStorage key
        }
    )
);
