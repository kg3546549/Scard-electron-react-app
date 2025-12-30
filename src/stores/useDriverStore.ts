/**
 * Driver Store
 * 드라이버 연결 상태 관리
 */

import { create } from 'zustand';
import { pcscService } from '../core/services';
import { DriverConnectionStatus, DriverEvent } from '../types';

interface DriverStore {
    // State
    connectionStatus: DriverConnectionStatus;
    readerList: string[];
    error: string | null;
    lastEvent: DriverEvent | null;

    // Actions
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    establishContext: () => Promise<void>;
    releaseContext: () => Promise<void>;
    getReaderList: () => Promise<void>;
    connectCard: () => Promise<void>;
    disconnectCard: () => Promise<void>;
    reset: () => void;
}

export const useDriverStore = create<DriverStore>((set, get) => {
    // 드라이버 이벤트 리스너 등록
    pcscService.addEventListener((event: DriverEvent) => {
        set({ lastEvent: event });

        // 연결 상태 업데이트
        if (event.type === 'DRIVER_STARTED') {
            set({ connectionStatus: DriverConnectionStatus.RUNNING });
        } else if (event.type === 'DRIVER_STOPPED') {
            set({ connectionStatus: DriverConnectionStatus.STOPPED });
        } else if (event.type === 'CONTEXT_ESTABLISHED') {
            set({ connectionStatus: DriverConnectionStatus.CONTEXT_READY });
        } else if (event.type === 'CONTEXT_RELEASED') {
            set({ connectionStatus: DriverConnectionStatus.RUNNING });
        } else if (event.type === 'ERROR') {
            set({
                connectionStatus: DriverConnectionStatus.ERROR,
                error: event.error?.message || 'Unknown error',
            });
        }
    });

    return {
        // Initial State
        connectionStatus: DriverConnectionStatus.STOPPED,
        readerList: [],
        error: null,
        lastEvent: null,

        // Actions
        connect: async () => {
            set({ connectionStatus: DriverConnectionStatus.STARTING, error: null });
            try {
                await pcscService.connect();
                // 상태는 이벤트 리스너에서 CONTEXT_READY로 업데이트됨
            } catch (error) {
                set({
                    connectionStatus: DriverConnectionStatus.ERROR,
                    error: (error as Error).message,
                });
                throw error;
            }
        },

        disconnect: async () => {
            try {
                await pcscService.disconnect();
                // 상태는 이벤트 리스너에서 업데이트됨
            } catch (error) {
                set({ error: (error as Error).message });
                throw error;
            }
        },

        establishContext: async () => {
            try {
                await pcscService.establishContext();
                set({ error: null });
            } catch (error) {
                set({ error: (error as Error).message });
                throw error;
            }
        },

        releaseContext: async () => {
            try {
                await pcscService.releaseContext();
                set({ error: null });
            } catch (error) {
                set({ error: (error as Error).message });
                throw error;
            }
        },

        getReaderList: async () => {
            try {
                const readers = await pcscService.getReaderList();
                set({ readerList: readers, error: null });
            } catch (error) {
                set({ error: (error as Error).message });
                throw error;
            }
        },

        connectCard: async () => {
            try {
                await pcscService.connectCard();
                set({ error: null });
            } catch (error) {
                set({ error: (error as Error).message });
                throw error;
            }
        },

        disconnectCard: async () => {
            try {
                await pcscService.disconnectCard();
                set({ error: null });
            } catch (error) {
                set({ error: (error as Error).message });
                throw error;
            }
        },

        reset: () => {
            set({
                connectionStatus: DriverConnectionStatus.STOPPED,
                readerList: [],
                error: null,
                lastEvent: null,
            });
        },
    };
});
