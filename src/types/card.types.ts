/**
 * Card Type Definitions
 * 카드 관련 TypeScript 타입 정의
 */

/**
 * 카드 타입 열거형
 */
export enum CardType {
    UNKNOWN = 'UNKNOWN',
    MIFARE_1K = 'MIFARE_1K',
    MIFARE_4K = 'MIFARE_4K',
    ISO7816 = 'ISO7816',
    DESFIRE = 'DESFIRE',
}

/**
 * 카드 기본 정보 인터페이스
 */
export interface CardInfo {
    type: CardType;
    atr: string;
    uid: string;
    sak?: string;
    ats?: string;
    historicalBytes?: string;
}

/**
 * Mifare 키 타입
 */
export enum MifareKeyType {
    KEY_A = 'A',
    KEY_B = 'B',
}

/**
 * Mifare 섹터 데이터
 */
export interface MifareSector {
    sectorNumber: number;
    blocks: string[]; // 4개의 블록 데이터 (16바이트 hex 문자열)
    isAuthenticated: boolean;
}

/**
 * Mifare 키 설정
 */
export interface MifareKeyConfig {
    keyType: MifareKeyType;
    keyValue: string; // 12자리 hex 문자열 (6바이트)
}

/**
 * 카드 리딩 상태
 */
export enum CardReadingStatus {
    IDLE = 'IDLE',
    CONNECTING = 'CONNECTING',
    GETTING_UID = 'GETTING_UID',
    DETECTING = 'DETECTING',
    READING = 'READING',
    WRITING = 'WRITING',
    AUTHENTICATING = 'AUTHENTICATING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

/**
 * 카드 리딩 결과
 */
export interface CardReadingResult {
    status: CardReadingStatus;
    message?: string;
    error?: Error;
}
