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
            // PCSC 연결 확인 및 컨텍스트/리더/카드 연결
            if (!pcscService.isConnected()) {
                await pcscService.connect();
            }
            await pcscService.establishContext();
            await pcscService.getReaderList();
            await pcscService.connectCard();

            // ATR 조회
            const atr = await pcscService.getATR();

            // UID 조회 (APDU 기반)
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
            // 키 로드 (slot 0 사용)
            await pcscService.loadMifareKey(keyConfig.keyValue);
            await this.delay(1);

            for (const sectorNumber of sectorNumbers) {
                const blockNumber = sectorNumber * 4;

                try {
                    // 인증
                    const authResp = await pcscService.authenticateMifare(String(blockNumber), keyConfig.keyType);
                    await this.delay(1);
                    const authSw = this.extractStatusWord(authResp);
                    if (authSw && authSw !== '9000') {
                        throw new Error(`AUTH failed (SW=${authSw})`);
                    }

                    // 섹터 인증 상태 업데이트
                    this.card.setSectorAuthenticated(sectorNumber, true);

                    // 4개 블록 읽기
                    const blocks: string[] = [];
                    for (let i = 0; i < 4; i++) {
                        const raw = await pcscService.readMifareBlock(String(blockNumber + i));
                        await this.delay(1);
                        const sw = this.extractStatusWord(raw);
                        if (sw && sw !== '9000') {
                            throw new Error(`READ failed at block ${blockNumber + i} (SW=${sw})`);
                        }
                        const trimmed = this.stripStatusWord(raw).substring(0, 32);
                        blocks.push(trimmed);
                    }

                    // 섹터 데이터 업데이트
                    this.card.setSectorData(sectorNumber, blocks);
                } catch (err) {
                    const reason = (err as Error).message || 'Unknown error';
                    this.card.setSectorError(sectorNumber, reason);
                    throw err;
                }

                // 섹터 간 딜레이
                await this.delay(5);
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

            // 인증
            const blockNumber = sectorNumber * 4;
            const authResp = await pcscService.authenticateMifare(String(blockNumber), keyConfig.keyType);
            const authSw = this.extractStatusWord(authResp);
            if (authSw && authSw !== '9000') {
                throw new Error(`AUTH failed (SW=${authSw})`);
            }

            // 블록 읽기
            const absoluteBlockNumber = sectorNumber * 4 + blockIndex;
            const raw = await pcscService.readMifareBlock(String(absoluteBlockNumber));
            const sw = this.extractStatusWord(raw);
            if (sw && sw !== '9000') {
                throw new Error(`READ failed (SW=${sw})`);
            }
            const data = this.stripStatusWord(raw).substring(0, 32);

            // 카드 모델 업데이트
            this.card.setBlockData(sectorNumber, blockIndex, data);

            return data;
        } catch (error) {
            this.card.setSectorError(sectorNumber, (error as Error).message || 'Read failed');
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

            // 인증
            const blockNumber = sectorNumber * 4;
            await pcscService.authenticateMifare(String(blockNumber), keyConfig.keyType);

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

    /**
     * APDU 응답에서 상태코드(마지막 4자리)를 제거
     */
    private stripStatusWord(apduResponse: string): string {
        const clean = apduResponse.toUpperCase();
        if (clean.length >= 4) {
            return clean.slice(0, -4);
        }
        return clean;
    }

    /**
     * APDU 응답의 상태코드 추출 (마지막 4자리)
     */
    private extractStatusWord(apduResponse: string): string {
        const clean = apduResponse.toUpperCase();
        if (clean.length >= 4) {
            return clean.slice(-4);
        }
        return '';
    }
}
