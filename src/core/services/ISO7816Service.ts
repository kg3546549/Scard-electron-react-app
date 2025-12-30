/**
 * ISO7816 Service
 * ISO7816 카드 서비스 - APDU 전송, 응답 파싱, 트랜잭션 로그 관리
 */

import { v4 as uuidv4 } from 'uuid';
import { pcscService } from './PCSCService';
import { ISO7816Card, APDUCommand, APDUResponse } from '../models';
import { CardInfo, CardType, APDUTransaction } from '../../types';

export class ISO7816Service {
    private card: ISO7816Card;

    constructor() {
        this.card = new ISO7816Card();
    }

    /**
     * 카드 연결 및 정보 읽기
     */
    async connectCard(): Promise<CardInfo> {
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

            // UID 조회 (ISO7816 카드도 UID가 있을 수 있음)
            let uid = '';
            try {
                uid = await pcscService.getMifareUID();
            } catch {
                // UID가 없는 카드일 수 있음
                uid = 'N/A';
            }

            const cardInfo: CardInfo = {
                type: CardType.ISO7816,
                atr,
                uid,
            };

            this.card.initialize(cardInfo);
            return cardInfo;
        } catch (error) {
            console.error('Failed to connect card:', error);
            throw error;
        }
    }

    /**
     * APDU 명령 전송
     */
    async transmitAPDU(apduCommand: APDUCommand | string): Promise<APDUResponse> {
        try {
            // APDUCommand 객체를 hex 문자열로 변환
            const commandHex = typeof apduCommand === 'string'
                ? apduCommand
                : apduCommand.toHexString();

            // PCSC를 통해 전송
            const responseHex = await pcscService.transmit(commandHex);

            // 응답 파싱
            const response = new APDUResponse(responseHex);

            // 트랜잭션 로그 추가
            const transaction: APDUTransaction = {
                id: uuidv4(),
                timestamp: new Date(),
                command: commandHex,
                response: responseHex,
                parsedCommand: typeof apduCommand === 'string'
                    ? APDUCommand.fromHexString(apduCommand).toObject()
                    : apduCommand.toObject(),
                parsedResponse: response.toObject(),
            };

            this.card.addTransaction(transaction);

            return response;
        } catch (error) {
            console.error('Failed to transmit APDU:', error);
            throw error;
        }
    }

    /**
     * 빠른 명령어 전송 (hex 문자열)
     */
    async sendQuickCommand(commandHex: string): Promise<APDUResponse> {
        const command = APDUCommand.fromHexString(commandHex);
        return this.transmitAPDU(command);
    }

    /**
     * SELECT AID 명령
     */
    async selectAID(aid: string): Promise<APDUResponse> {
        const aidLength = (aid.length / 2).toString(16).padStart(2, '0').toUpperCase();
        const command = new APDUCommand({
            cla: '00',
            ins: 'A4',
            p1: '04',
            p2: '00',
            lc: aidLength,
            data: aid,
        });
        return this.transmitAPDU(command);
    }

    /**
     * GET CHALLENGE 명령
     */
    async getChallenge(length: number = 8): Promise<APDUResponse> {
        const le = length.toString(16).padStart(2, '0').toUpperCase();
        const command = new APDUCommand({
            cla: '00',
            ins: '84',
            p1: '00',
            p2: '00',
            le,
        });
        return this.transmitAPDU(command);
    }

    /**
     * READ BINARY 명령
     */
    async readBinary(offset: number, length: number): Promise<APDUResponse> {
        const p1 = ((offset >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
        const p2 = (offset & 0xFF).toString(16).padStart(2, '0').toUpperCase();
        const le = length.toString(16).padStart(2, '0').toUpperCase();

        const command = new APDUCommand({
            cla: '00',
            ins: 'B0',
            p1,
            p2,
            le,
        });
        return this.transmitAPDU(command);
    }

    /**
     * READ RECORD 명령
     */
    async readRecord(recordNumber: number, sfi: number = 0): Promise<APDUResponse> {
        const p1 = recordNumber.toString(16).padStart(2, '0').toUpperCase();
        const p2 = ((sfi << 3) | 0x04).toString(16).padStart(2, '0').toUpperCase();

        const command = new APDUCommand({
            cla: '00',
            ins: 'B2',
            p1,
            p2,
            le: '00',
        });
        return this.transmitAPDU(command);
    }

    /**
     * 트랜잭션 로그 가져오기
     */
    getTransactionHistory(): APDUTransaction[] {
        return this.card.transactionHistory;
    }

    /**
     * 트랜잭션 로그 초기화
     */
    clearTransactionHistory(): void {
        this.card.clearTransactions();
    }

    /**
     * 카드 모델 가져오기
     */
    getCard(): ISO7816Card {
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
