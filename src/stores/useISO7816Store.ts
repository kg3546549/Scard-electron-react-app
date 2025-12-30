/**
 * ISO7816 Store
 * ISO7816 카드 상태 관리 - ISO7816Service와 연동
 */

import { create } from 'zustand';
import { ISO7816Service } from '../core/services';
import { APDUCommand, APDUResponse } from '../core/models';
import {
    CardInfo,
    APDUTransaction,
    CardReadingStatus,
    QuickAPDUCommand,
    APDUCommandCategory,
} from '../types';

interface ISO7816Store {
    // State
    cardInfo: CardInfo | null;
    transactions: APDUTransaction[];
    currentCommand: string;
    currentResponse: string;
    status: CardReadingStatus;
    error: string | null;

    // Service instance
    service: ISO7816Service;

    // Quick commands
    quickCommands: QuickAPDUCommand[];

    // Actions
    connectCard: () => Promise<void>;
    transmitAPDU: (command: string) => Promise<APDUResponse>;
    setCurrentCommand: (command: string) => void;
    clearCommand: () => void;
    clearTransactions: () => void;
    loadQuickCommand: (template: string) => void;
    reset: () => void;
}

export const useISO7816Store = create<ISO7816Store>((set, get) => ({
    // Initial State
    cardInfo: null,
    transactions: [],
    currentCommand: '',
    currentResponse: '',
    status: CardReadingStatus.IDLE,
    error: null,

    // Service instance
    service: new ISO7816Service(),

    // Quick commands
    quickCommands: [
        {
            name: 'Select AID',
            description: 'Select Application ID (A4)',
            template: '00A40400',
            category: APDUCommandCategory.FILE_SELECTION,
        },
        {
            name: 'Get Challenge',
            description: 'Get Challenge (84)',
            template: '00840000',
            category: APDUCommandCategory.SECURITY,
        },
        {
            name: 'Read Binary',
            description: 'Read Binary (B0)',
            template: '00B00000',
            category: APDUCommandCategory.READ,
        },
        {
            name: 'Read Record',
            description: 'Read Record (B2)',
            template: '00B20000',
            category: APDUCommandCategory.READ,
        },
        {
            name: 'Create Session',
            description: 'Create Session (8A)',
            template: '008A0000',
            category: APDUCommandCategory.SECURITY,
        },
        {
            name: 'External Authentication',
            description: 'External Authentication (82)',
            template: '00820000',
            category: APDUCommandCategory.AUTHENTICATION,
        },
        {
            name: 'Internal Authentication',
            description: 'Internal Authentication (88)',
            template: '00880000',
            category: APDUCommandCategory.AUTHENTICATION,
        },
    ],

    // Actions
    connectCard: async () => {
        const { service } = get();
        set({ status: CardReadingStatus.DETECTING, error: null });

        try {
            const cardInfo = await service.connectCard();
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

    transmitAPDU: async (command: string) => {
        const { service } = get();
        set({ status: CardReadingStatus.READING, error: null });

        try {
            // 입력 검증
            const cleanedCommand = command.replace(/\s/g, '');
            if (cleanedCommand.length < 8) {
                throw new Error('APDU command must be at least 4 bytes (8 hex characters)');
            }
            if (cleanedCommand.length % 2 !== 0) {
                throw new Error('APDU command must have even length');
            }

            const response = await service.transmitAPDU(cleanedCommand);
            const transactions = service.getTransactionHistory();

            set({
                transactions,
                currentResponse: response.toHexString(),
                status: CardReadingStatus.SUCCESS,
            });

            return response;
        } catch (error) {
            set({
                status: CardReadingStatus.ERROR,
                error: (error as Error).message,
            });
            throw error;
        }
    },

    setCurrentCommand: (command: string) => {
        set({ currentCommand: command });
    },

    clearCommand: () => {
        set({ currentCommand: '', currentResponse: '' });
    },

    clearTransactions: () => {
        const { service } = get();
        service.clearTransactionHistory();
        set({ transactions: [] });
    },

    loadQuickCommand: (template: string) => {
        set({ currentCommand: template });
    },

    reset: () => {
        const { service } = get();
        service.reset();
        set({
            cardInfo: null,
            transactions: [],
            currentCommand: '',
            currentResponse: '',
            status: CardReadingStatus.IDLE,
            error: null,
        });
    },
}));
