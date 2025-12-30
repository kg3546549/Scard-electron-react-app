/**
 * ISO7816 Card Class
 * ISO7816 카드 모델 - APDU 통신 관리
 */

import { Card } from './Card';
import { CardInfo, CardType, CardReadingStatus, APDUTransaction } from '../../types';

export class ISO7816Card extends Card {
    private transactions: APDUTransaction[] = [];
    private maxTransactions: number = 100; // 최대 트랜잭션 로그 수

    constructor() {
        super();
    }

    /**
     * 카드 타입
     */
    get type(): CardType {
        return CardType.ISO7816;
    }

    /**
     * 트랜잭션 로그 getter
     */
    get transactionHistory(): APDUTransaction[] {
        return [...this.transactions];
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
     * 트랜잭션 추가
     */
    addTransaction(transaction: APDUTransaction): void {
        this.transactions.push(transaction);

        // 최대 개수 초과 시 오래된 트랜잭션 제거
        if (this.transactions.length > this.maxTransactions) {
            this.transactions.shift();
        }
    }

    /**
     * 트랜잭션 로그 초기화
     */
    clearTransactions(): void {
        this.transactions = [];
    }

    /**
     * 특정 트랜잭션 가져오기
     */
    getTransaction(id: string): APDUTransaction | null {
        return this.transactions.find(t => t.id === id) || null;
    }

    /**
     * 최근 트랜잭션 가져오기
     */
    getRecentTransactions(count: number): APDUTransaction[] {
        return this.transactions.slice(-count);
    }

    /**
     * 카드 리셋 (오버라이드)
     */
    override reset(): void {
        super.reset();
        this.transactions = [];
    }
}
