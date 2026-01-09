/**
 * Mifare Store
 * Mifare 카드 상태 관리 - MifareService와 연동
 */

import { create } from 'zustand';
import { MifareService } from '../core/services';
import {
    CardInfo,
    MifareSector,
    MifareKeyConfig,
    MifareKeyType,
    CardReadingStatus,
} from '../types';

interface MifareStore {
    // State
    cardInfo: CardInfo | null;
    sectorData: MifareSector[];
    selectedSectors: boolean[];
    keyConfig: MifareKeyConfig;
    status: CardReadingStatus;
    error: string | null;

    // Service instance
    service: MifareService;

    // Actions
    detectCard: () => Promise<void>;
    readSectors: (sectorNumbers: number[]) => Promise<void>;
    readAllSectors: () => Promise<void>;
    selectSector: (index: number) => void;
    selectAllSectors: () => void;
    deselectAllSectors: () => void;
    setKeyConfig: (config: MifareKeyConfig) => void;
    clearData: () => void;
    reset: () => void;
}

export const useMifareStore = create<MifareStore>((set, get) => ({
    // Initial State
    cardInfo: null,
    sectorData: Array.from({ length: 16 }, (_, index) => ({
        sectorNumber: index,
        blocks: ['', '', '', ''],
        isAuthenticated: false,
    })),
    selectedSectors: Array(16).fill(false),
    keyConfig: {
        keyType: MifareKeyType.KEY_A,
        keyValue: 'FFFFFFFFFFFF',
    },
    status: CardReadingStatus.IDLE,
    error: null,

    // Service instance
    service: new MifareService(),

    // Actions
    detectCard: async () => {
        const { service } = get();
        set({ status: CardReadingStatus.DETECTING, error: null });

        try {
            const cardInfo = await service.detectCard();
            set({
                cardInfo,
                status: CardReadingStatus.SUCCESS,
            });
        } catch (error) {
            set({
                status: CardReadingStatus.ERROR,
                error: (error as Error).message,
            });
            throw error;
        }
    },

    readSectors: async (sectorNumbers: number[]) => {
        const { service, keyConfig } = get();
        set({ status: CardReadingStatus.READING, error: null });

        try {
            await service.readSectors(sectorNumbers, keyConfig, (_sectorNumber, card) => {
                const sectorData = card.sectorData.map((sector) => ({
                    ...sector,
                    blocks: [...sector.blocks],
                }));
                set({
                    sectorData,
                    status: CardReadingStatus.READING,
                });
            });
            const card = service.getCard();

            set({
                sectorData: card.sectorData.map((sector) => ({
                    ...sector,
                    blocks: [...sector.blocks],
                })),
                status: CardReadingStatus.SUCCESS,
            });
        } catch (error) {
            set({
                status: CardReadingStatus.ERROR,
                error: (error as Error).message,
            });
            throw error;
        }
    },

    readAllSectors: async () => {
        const { selectedSectors } = get();
        const sectorNumbers = selectedSectors
            .map((selected, index) => (selected ? index : -1))
            .filter(index => index !== -1);

        await get().readSectors(sectorNumbers);
    },

    selectSector: (index: number) => {
        set(state => {
            const newSelected = [...state.selectedSectors];
            newSelected[index] = !newSelected[index];
            return { selectedSectors: newSelected };
        });
    },

    selectAllSectors: () => {
        set({ selectedSectors: Array(16).fill(true) });
    },

    deselectAllSectors: () => {
        set({ selectedSectors: Array(16).fill(false) });
    },

    setKeyConfig: (config: MifareKeyConfig) => {
        const { service } = get();
        service.getCard().setKeyConfig(config);
        set({ keyConfig: config });
    },

    clearData: () => {
        const { service } = get();
        service.getCard().clearAllSectors();
        set({
            sectorData: Array.from({ length: 16 }, (_, index) => ({
                sectorNumber: index,
                blocks: ['', '', '', ''],
                isAuthenticated: false,
            })),
        });
    },

    reset: () => {
        const { service } = get();
        service.reset();
        set({
            cardInfo: null,
            sectorData: Array.from({ length: 16 }, (_, index) => ({
                sectorNumber: index,
                blocks: ['', '', '', ''],
                isAuthenticated: false,
            })),
            selectedSectors: Array(16).fill(false),
            status: CardReadingStatus.IDLE,
            error: null,
        });
    },
}));
