/**
 * Mifare Service
 * Mifare 카드 서비스 - 섹터 읽기/쓰기, 키 로드 및 인증
 */

import { pcscService } from './PCSCService';
import { MifareCard } from '../models';
import { CardInfo, CardType, MifareKeyConfig, MifareKeyType } from '../../types';

export class MifareService {
    private card: MifareCard;

    constructor() {
        this.card = new MifareCard();
    }

    /**
     * 카드 감지 및 정보 읽기
     */
    async detectCard(): Promise<CardInfo> {
        try {
            // PCSC 연결 확인
            if (!pcscService.isConnected()) {
                await pcscService.connect();
                await this.delay(100);
            }

            // Context 설정
            await pcscService.establishContext();
            await this.delay(100);

            // 리더 목록 조회
            await pcscService.getReaderList();
            await this.delay(100);

            // 카드 연결
            await pcscService.connectCard();
            await this.delay(100);

            // ATR 조회
            const atr = await pcscService.getATR();
            await this.delay(100);

            // UID 조회
            const uid = await pcscService.getMifareUID();

            const cardInfo: CardInfo = {
                type: CardType.MIFARE_1K,
                atr,
                uid,
            };

            this.card.initialize(cardInfo);
            return cardInfo;
        } catch (error) {
            console.error('Failed to detect card:', error);
            throw error;
        }
    }

    /**
     * 섹터 읽기
     */
    async readSectors(sectorNumbers: number[], keyConfig: MifareKeyConfig): Promise<void> {
        try {
            for (const sectorNumber of sectorNumbers) {
                // 키 로드
                await pcscService.loadMifareKey(keyConfig.keyValue);
                await this.delay(100);

                // 인증
                const blockNumber = sectorNumber * 4;
                await pcscService.authenticateMifare(String(blockNumber), keyConfig.keyType);
                await this.delay(100);

                // 섹터 인증 상태 업데이트
                this.card.setSectorAuthenticated(sectorNumber, true);

                // 4개 블록 읽기
                const blocks: string[] = [];
                for (let i = 0; i < 4; i++) {
                    const data = await pcscService.readMifareBlock(String(blockNumber + i));
                    blocks.push(data.substring(0, 32)); // 16바이트 = 32자리 hex
                    await this.delay(200);
                }

                // 섹터 데이터 업데이트
                this.card.setSectorData(sectorNumber, blocks);
            }
        } catch (error) {
            console.error('Failed to read sectors:', error);
            throw error;
        }
    }

    /**
     * 특정 블록 읽기
     */
    async readBlock(sectorNumber: number, blockIndex: number, keyConfig: MifareKeyConfig): Promise<string> {
        try {
            // 키 로드
            await pcscService.loadMifareKey(keyConfig.keyValue);
            await this.delay(100);

            // 인증
            const blockNumber = sectorNumber * 4;
            await pcscService.authenticateMifare(String(blockNumber), keyConfig.keyType);
            await this.delay(100);

            // 블록 읽기
            const absoluteBlockNumber = sectorNumber * 4 + blockIndex;
            const data = await pcscService.readMifareBlock(String(absoluteBlockNumber));

            // 카드 모델 업데이트
            this.card.setBlockData(sectorNumber, blockIndex, data.substring(0, 32));

            return data.substring(0, 32);
        } catch (error) {
            console.error('Failed to read block:', error);
            throw error;
        }
    }

    /**
     * 특정 블록 쓰기
     */
    async writeBlock(
        sectorNumber: number,
        blockIndex: number,
        data: string,
        keyConfig: MifareKeyConfig
    ): Promise<void> {
        try {
            // 키 로드
            await pcscService.loadMifareKey(keyConfig.keyValue);
            await this.delay(100);

            // 인증
            const blockNumber = sectorNumber * 4;
            await pcscService.authenticateMifare(String(blockNumber), keyConfig.keyType);
            await this.delay(100);

            // 블록 쓰기
            const absoluteBlockNumber = sectorNumber * 4 + blockIndex;
            await pcscService.writeMifareBlock(String(absoluteBlockNumber), data);

            // 카드 모델 업데이트
            this.card.setBlockData(sectorNumber, blockIndex, data);
        } catch (error) {
            console.error('Failed to write block:', error);
            throw error;
        }
    }

    /**
     * 카드 모델 가져오기
     */
    getCard(): MifareCard {
        return this.card;
    }

    /**
     * 카드 리셋
     */
    reset(): void {
        this.card.reset();
    }

    /**
     * 지연 유틸리티
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
