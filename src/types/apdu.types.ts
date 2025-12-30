/**
 * APDU Type Definitions
 * APDU 관련 TypeScript 타입 정의
 */

/**
 * APDU 명령 구조
 */
export interface APDUCommand {
    cla: string; // Class byte (1바이트 hex)
    ins: string; // Instruction byte (1바이트 hex)
    p1: string;  // Parameter 1 (1바이트 hex)
    p2: string;  // Parameter 2 (1바이트 hex)
    lc?: string; // Length of command data (1바이트 hex, optional)
    data?: string; // Command data (hex 문자열, optional)
    le?: string; // Expected response length (1바이트 hex, optional)
}

/**
 * APDU 응답 구조
 */
export interface APDUResponse {
    data: string; // 응답 데이터 (hex 문자열)
    sw1: string;  // Status word 1 (1바이트 hex)
    sw2: string;  // Status word 2 (1바이트 hex)
    statusCode: string; // SW1 + SW2 (2바이트 hex)
    success: boolean; // 9000이면 true
}

/**
 * APDU 트랜잭션 로그
 */
export interface APDUTransaction {
    id: string;
    timestamp: Date;
    command: string; // 전체 APDU 명령 (hex 문자열)
    response: string; // 전체 APDU 응답 (hex 문자열)
    parsedCommand?: APDUCommand;
    parsedResponse?: APDUResponse;
}

/**
 * 빠른 APDU 명령 템플릿
 */
export interface QuickAPDUCommand {
    name: string;
    description: string;
    template: string; // APDU 템플릿 (예: "00A40400")
    category: APDUCommandCategory;
}

/**
 * APDU 명령 카테고리
 */
export enum APDUCommandCategory {
    FILE_SELECTION = 'FILE_SELECTION',
    AUTHENTICATION = 'AUTHENTICATION',
    READ = 'READ',
    WRITE = 'WRITE',
    SECURITY = 'SECURITY',
    CUSTOM = 'CUSTOM',
}

/**
 * ISO7816 표준 명령어
 */
export const ISO7816Commands = {
    SELECT_FILE: { cla: '00', ins: 'A4' },
    READ_BINARY: { cla: '00', ins: 'B0' },
    READ_RECORD: { cla: '00', ins: 'B2' },
    GET_CHALLENGE: { cla: '00', ins: '84' },
    EXTERNAL_AUTH: { cla: '00', ins: '82' },
    INTERNAL_AUTH: { cla: '00', ins: '88' },
    GET_RESPONSE: { cla: '00', ins: 'C0' },
} as const;
