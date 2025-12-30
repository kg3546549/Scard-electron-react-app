/**
 * Base Card Class
 * 모든 카드 타입의 추상 기본 클래스
 */

import { CardInfo, CardType, CardReadingStatus } from '../../types';

export abstract class Card {
    protected _info: CardInfo | null = null;
    protected _status: CardReadingStatus = CardReadingStatus.IDLE;

    constructor() { }

    /**
     * 카드 정보 getter
     */
    get info(): CardInfo | null {
        return this._info;
    }

    /**
     * 카드 상태 getter
     */
    get status(): CardReadingStatus {
        return this._status;
    }

    /**
     * 카드 타입 getter
     */
    abstract get type(): CardType;

    /**
     * 카드 초기화
     */
    abstract initialize(info: CardInfo): void;

    /**
     * 카드 연결
     */
    abstract connect(): Promise<boolean>;

    /**
     * 카드 연결 해제
     */
    abstract disconnect(): Promise<boolean>;

    /**
     * 카드 정보 읽기
     */
    abstract readInfo(): Promise<CardInfo>;

    /**
     * 카드 초기화 상태 확인
     */
    isInitialized(): boolean {
        return this._info !== null;
    }

    /**
     * 상태 업데이트
     */
    protected updateStatus(status: CardReadingStatus): void {
        this._status = status;
    }

    /**
     * 카드 정보 업데이트
     */
    protected updateInfo(info: CardInfo): void {
        this._info = info;
    }

    /**
     * 카드 리셋
     */
    reset(): void {
        this._info = null;
        this._status = CardReadingStatus.IDLE;
    }
}
