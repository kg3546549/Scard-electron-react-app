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
    CardType,
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
    writeBlock: (sectorNumber: number, blockIndex: number, data: string) => Promise<void>;
    connectCard: () => Promise<void>;
    readUID: () => Promise<void>;
    authenticateSectorOnly: (sectorNumber: number) => Promise<void>;
    readSectorOnly: (sectorNumber: number) => Promise<void>;
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

    writeBlock: async (sectorNumber: number, blockIndex: number, data: string) => {
        const { service, keyConfig } = get();
        set({ status: CardReadingStatus.WRITING, error: null });

        try {
            await service.writeBlock(sectorNumber, blockIndex, data, keyConfig);
            // Update local state
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

    connectCard: async () => {
        const { service } = get();
        set({ status: CardReadingStatus.CONNECTING, error: null });
        try {
            await service.connect();
            set({ status: CardReadingStatus.SUCCESS });
        } catch (error) {
            set({ status: CardReadingStatus.ERROR, error: (error as Error).message });
            throw error;
        }
    },

    readUID: async () => {
        const { service } = get();
        set({ status: CardReadingStatus.GETTING_UID, error: null });
        try {
            const uid = await service.readUID();
            // cardInfo might need update if it exists
            const currentCardInfo = get().cardInfo;
            if (currentCardInfo) {
                set({ cardInfo: { ...currentCardInfo, uid } });
            } else {
                 // Minimal card info if not detected yet
                 set({ cardInfo: { 
                     type: CardType.UNKNOWN, 
                     atr: '', 
                     uid, 
                 } as CardInfo });
            }
            set({ status: CardReadingStatus.SUCCESS });
        } catch (error) {
            set({ status: CardReadingStatus.ERROR, error: (error as Error).message });
            throw error;
        }
    },

    authenticateSectorOnly: async (sectorNumber: number) => {
        const { service, keyConfig } = get();
        set({ status: CardReadingStatus.AUTHENTICATING, error: null });
        try {
            await service.authenticateSector(sectorNumber, keyConfig);
            // Update sector auth status
            const card = service.getCard();
            set({
                sectorData: card.sectorData.map((sector) => ({
                    ...sector,
                    blocks: [...sector.blocks],
                })),
                status: CardReadingStatus.SUCCESS,
            });
        } catch (error) {
            set({ status: CardReadingStatus.ERROR, error: (error as Error).message });
            throw error;
        }
    },

    readSectorOnly: async (sectorNumber: number) => {
        const { service } = get();
        set({ status: CardReadingStatus.READING, error: null });
        try {
            await service.readSectorBlocks(sectorNumber);
            const card = service.getCard();
            set({
                sectorData: card.sectorData.map((sector) => ({
                    ...sector,
                    blocks: [...sector.blocks],
                })),
                status: CardReadingStatus.SUCCESS,
            });
        } catch (error) {
            set({ status: CardReadingStatus.ERROR, error: (error as Error).message });
            throw error;
        }
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
