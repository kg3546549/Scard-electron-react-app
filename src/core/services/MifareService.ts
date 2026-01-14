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
            await this.connect();

            // ATR 조회
            const atr = await pcscService.getATR();

            // UID 조회 (APDU 기반)
            const uid = await this.readUID();
            
            let sak: string | undefined;
            let ats: string | undefined;
            
            try {
                const sakResp = await pcscService.getMifareSAK();
                const sakSw = this.extractStatusWord(sakResp);
                if (!sakSw || sakSw === '9000') {
                    sak = this.stripStatusWord(sakResp);
                }
            } catch (_error) {
                sak = undefined;
            }
            try {
                const atsResp = await pcscService.getMifareATS();
                const atsSw = this.extractStatusWord(atsResp);
                if (!atsSw || atsSw === '9000') {
                    ats = this.stripStatusWord(atsResp);
                }
            } catch (_error) {
                ats = undefined;
            }
            let cardType = CardType.UNKNOWN;
            if (sak && sak.length >= 2) {
                const sakByteHex = sak.slice(-2);
                const sakByte = parseInt(sakByteHex, 16);
                if (!Number.isNaN(sakByte)) {
                    if (sakByte === 0x08) {
                        cardType = CardType.MIFARE_1K;
                    } else if (sakByte === 0x18) {
                        cardType = CardType.MIFARE_4K;
                    } else if (sakByte === 0x20) {
                        cardType = CardType.DESFIRE;
                    } else if (sakByte === 0x00) {
                        cardType = CardType.ISO7816;
                    }
                }
            }
            if (cardType === CardType.UNKNOWN) {
                if (ats && ats.length > 0) {
                    cardType = CardType.ISO7816;
                } else if (uid && uid.length > 0) {
                    // SAK 미지원 리더 대비 기본값
                    cardType = CardType.MIFARE_1K;
                }
            }

            const cardInfo: CardInfo = {
                type: cardType,
                atr,
                uid,
                sak,
                ats,
            };

            this.card.initialize(cardInfo);
            return cardInfo;
        } catch (error) {
            console.error('Failed to detect card:', error);
            throw error;
        }
    }

    /**
     * 리더 및 카드 연결 (Select 단계 대응)
     */
    async connect(): Promise<void> {
        // PCSC 연결 확인 및 컨텍스트/리더/카드 연결
        if (!pcscService.isConnected()) {
            await pcscService.connect();
        }
        await pcscService.establishContext();
        await pcscService.getReaderList();
        await pcscService.connectCard();
    }

    /**
     * UID 읽기 (Anticollision 단계 대응)
     */
    async readUID(): Promise<string> {
        const uid = await pcscService.getMifareUID();
        // cardInfo가 있으면 업데이트
        const currentInfo = this.card.info;
        if (currentInfo) {
            this.card.initialize({ ...currentInfo, uid });
        }
        return uid;
    }


    /**
     * 섹터 읽기
     */
    async readSectors(
        sectorNumbers: number[],
        keyConfig: MifareKeyConfig,
        onSectorUpdate?: (sectorNumber: number, card: MifareCard) => void
    ): Promise<void> {
        try {
            // 키 로드 (slot 0 사용)
            await pcscService.loadMifareKey(keyConfig.keyValue);
            await this.delay(1);

            for (const sectorNumber of sectorNumbers) {
                try {
                    // 인증
                    await this.authenticateSector(sectorNumber, keyConfig, false); // 키 로드 이미 함

                    // 4개 블록 읽기
                    await this.readSectorBlocks(sectorNumber);

                } catch (err) {
                    const reason = (err as Error).message || 'Unknown error';
                    this.card.setSectorError(sectorNumber, reason);
                }

                if (onSectorUpdate) {
                    onSectorUpdate(sectorNumber, this.card);
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
     * 특정 섹터 인증 (단일 단계용)
     * @param loadKey 키 로드 수행 여부 (반복 작업시 최적화 위해)
     */
    async authenticateSector(
        sectorNumber: number, 
        keyConfig: MifareKeyConfig, 
        loadKey: boolean = true
    ): Promise<void> {
        try {
            if (loadKey) {
                await pcscService.loadMifareKey(keyConfig.keyValue);
                await this.delay(1);
            }

            const blockNumber = sectorNumber * 4;
            const authResp = await pcscService.authenticateMifare(String(blockNumber), keyConfig.keyType);
            await this.delay(1);
            const authSw = this.extractStatusWord(authResp);
            if (authSw && authSw !== '9000') {
                throw new Error(`AUTH failed (SW=${authSw})`);
            }

            // 섹터 인증 상태 업데이트
            this.card.setSectorAuthenticated(sectorNumber, true);
        } catch (error) {
            this.card.setSectorError(sectorNumber, (error as Error).message);
            throw error;
        }
    }

    /**
     * 특정 섹터 블록들 읽기 (단일 단계용)
     * 인증이 선행되어야 함
     */
    async readSectorBlocks(sectorNumber: number): Promise<string[]> {
        const blockNumber = sectorNumber * 4;
        const blocks: string[] = [];
        
        try {
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
            return blocks;
        } catch (error) {
            this.card.setSectorError(sectorNumber, (error as Error).message);
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
