/**
 * APDU Response Class
 * APDU 응답 클래스 - 응답 데이터 파싱 및 검증
 */

import { APDUResponse as IAPDUResponse } from '../../types';

export class APDUResponse {
    private _data: string;
    private _sw1: string;
    private _sw2: string;
    private _statusCode: string;
    private _success: boolean;

    constructor(responseHex: string) {
        const cleaned = responseHex.replace(/\s/g, '').toUpperCase();

        if (cleaned.length < 4) {
            throw new Error('APDU response must be at least 2 bytes (4 hex characters)');
        }

        // 마지막 2바이트가 상태 워드
        this._sw1 = cleaned.substring(cleaned.length - 4, cleaned.length - 2);
        this._sw2 = cleaned.substring(cleaned.length - 2);
        this._statusCode = this._sw1 + this._sw2;
        this._data = cleaned.substring(0, cleaned.length - 4);
        this._success = this._statusCode === '9000';
    }

    /**
     * Getters
     */
    get data(): string { return this._data; }
    get sw1(): string { return this._sw1; }
    get sw2(): string { return this._sw2; }
    get statusCode(): string { return this._statusCode; }
    get success(): boolean { return this._success; }

    /**
     * 응답 객체로 반환
     */
    toObject(): IAPDUResponse {
        return {
            data: this._data,
            sw1: this._sw1,
            sw2: this._sw2,
            statusCode: this._statusCode,
            success: this._success,
        };
    }

    /**
     * 전체 응답을 hex 문자열로 반환
     */
    toHexString(): string {
        return this._data + this._statusCode;
    }

    /**
     * 공백으로 구분된 hex 문자열로 반환
     */
    toFormattedString(): string {
        const hex = this.toHexString();
        return hex.match(/.{1,2}/g)?.join(' ') || '';
    }

    /**
     * 상태 코드 설명 반환
     */
    getStatusDescription(): string {
        const statusDescriptions: { [key: string]: string } = {
            '9000': 'Success',
            '6100': 'More data available',
            '6281': 'Part of returned data may be corrupted',
            '6282': 'End of file reached before reading Le bytes',
            '6283': 'Selected file invalidated',
            '6284': 'FCI not formatted',
            '6300': 'Authentication failed',
            '6381': 'File filled up by last write',
            '6400': 'Execution error',
            '6500': 'Memory failure',
            '6581': 'Memory failure',
            '6700': 'Wrong length',
            '6800': 'Functions in CLA not supported',
            '6881': 'Logical channel not supported',
            '6882': 'Secure messaging not supported',
            '6900': 'Command not allowed',
            '6981': 'Command incompatible with file structure',
            '6982': 'Security status not satisfied',
            '6983': 'Authentication method blocked',
            '6984': 'Referenced data invalidated',
            '6985': 'Conditions of use not satisfied',
            '6986': 'Command not allowed (no current EF)',
            '6987': 'Expected SM data objects missing',
            '6988': 'SM data objects incorrect',
            '6A00': 'Wrong parameters P1-P2',
            '6A80': 'Incorrect parameters in data field',
            '6A81': 'Function not supported',
            '6A82': 'File not found',
            '6A83': 'Record not found',
            '6A84': 'Not enough memory space',
            '6A85': 'Lc inconsistent with TLV structure',
            '6A86': 'Incorrect parameters P1-P2',
            '6A87': 'Lc inconsistent with P1-P2',
            '6A88': 'Referenced data not found',
            '6B00': 'Wrong parameters P1-P2',
            '6C00': 'Wrong Le field',
            '6D00': 'Instruction code not supported or invalid',
            '6E00': 'Class not supported',
            '6F00': 'No precise diagnosis',
        };

        return statusDescriptions[this._statusCode] || 'Unknown status';
    }

    /**
     * 에러 여부 확인
     */
    isError(): boolean {
        return !this._success;
    }

    /**
     * 경고 여부 확인 (6XXX)
     */
    isWarning(): boolean {
        return this._sw1 === '6' && this._sw2 !== '00';
    }
}
