/**
 * Mifare Card Class
 * Mifare 카드 모델 - 섹터, 블록, 키 관리
 */

import { Card } from './Card';
import {
    CardInfo,
    CardType,
    CardReadingStatus,
    MifareSector,
    MifareKeyType,
    MifareKeyConfig,
} from '../../types';

export class MifareCard extends Card {
    private sectors: MifareSector[] = [];
    private keyConfig: MifareKeyConfig = {
        keyType: MifareKeyType.KEY_A,
        keyValue: 'FFFFFFFFFFFF', // 기본 키
    };

    constructor() {
        super();
        this.initializeSectors();
    }

    /**
     * 카드 타입
     */
    get type(): CardType {
        return CardType.MIFARE_1K;
    }

    /**
     * 섹터 데이터 getter
     */
    get sectorData(): MifareSector[] {
        return this.sectors;
    }

    /**
     * 키 설정 getter
     */
    get currentKeyConfig(): MifareKeyConfig {
        return { ...this.keyConfig };
    }

    /**
     * 섹터 초기화 (16개 섹터, 각 4개 블록)
     */
    private initializeSectors(): void {
        this.sectors = Array.from({ length: 16 }, (_, index) => ({
            sectorNumber: index,
            blocks: ['', '', '', ''],
            isAuthenticated: false,
        }));
    }

    /**
     * 카드 초기화
     */
    initialize(info: CardInfo): void {
        this.updateInfo(info);
        this.updateStatus(CardReadingStatus.IDLE);
    }

    /**
     * 카드 연결
     */
    async connect(): Promise<boolean> {
        this.updateStatus(CardReadingStatus.DETECTING);
        // 실제 연결 로직은 Service에서 처리
        return true;
    }

    /**
     * 카드 연결 해제
     */
    async disconnect(): Promise<boolean> {
        this.reset();
        return true;
    }

    /**
     * 카드 정보 읽기
     */
    async readInfo(): Promise<CardInfo> {
        if (!this._info) {
            throw new Error('Card not initialized');
        }
        return this._info;
    }

    /**
     * 키 설정
     */
    setKeyConfig(config: MifareKeyConfig): void {
        this.keyConfig = { ...config };
    }

    /**
     * 특정 섹터 데이터 설정
     */
    setSectorData(sectorNumber: number, blocks: string[]): void {
        if (sectorNumber < 0 || sectorNumber >= this.sectors.length) {
            throw new Error(`Invalid sector number: ${sectorNumber}`);
        }
        if (blocks.length !== 4) {
            throw new Error('Sector must have exactly 4 blocks');
        }
        this.sectors[sectorNumber].blocks = [...blocks];
    }

    /**
     * 섹터 오류 표시 (4개 블록에 동일한 메시지 기록)
     */
    setSectorError(sectorNumber: number, reason: string): void {
        this.setSectorData(sectorNumber, Array(4).fill(`ERROR: ${reason}`));
        this.sectors[sectorNumber].isAuthenticated = false;
    }

    /**
     * 특정 블록 데이터 설정
     */
    setBlockData(sectorNumber: number, blockIndex: number, data: string): void {
        if (sectorNumber < 0 || sectorNumber >= this.sectors.length) {
            throw new Error(`Invalid sector number: ${sectorNumber}`);
        }
        if (blockIndex < 0 || blockIndex >= 4) {
            throw new Error(`Invalid block index: ${blockIndex}`);
        }
        this.sectors[sectorNumber].blocks[blockIndex] = data;
    }

    /**
     * 섹터 인증 상태 설정
     */
    setSectorAuthenticated(sectorNumber: number, authenticated: boolean): void {
        if (sectorNumber < 0 || sectorNumber >= this.sectors.length) {
            throw new Error(`Invalid sector number: ${sectorNumber}`);
        }
        this.sectors[sectorNumber].isAuthenticated = authenticated;
    }

    /**
     * 특정 섹터 데이터 가져오기
     */
    getSector(sectorNumber: number): MifareSector | null {
        if (sectorNumber < 0 || sectorNumber >= this.sectors.length) {
            return null;
        }
        return { ...this.sectors[sectorNumber] };
    }

    /**
     * 특정 블록 데이터 가져오기
     */
    getBlockData(sectorNumber: number, blockIndex: number): string | null {
        const sector = this.getSector(sectorNumber);
        if (!sector || blockIndex < 0 || blockIndex >= 4) {
            return null;
        }
        return sector.blocks[blockIndex];
    }

    /**
     * 모든 섹터 데이터 초기화
     */
    clearAllSectors(): void {
        this.initializeSectors();
    }

    /**
     * 카드 리셋 (오버라이드)
     */
    override reset(): void {
        super.reset();
        this.initializeSectors();
    }
}
