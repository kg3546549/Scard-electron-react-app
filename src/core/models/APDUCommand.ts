/**
 * APDU Command Class
 * APDU 명령 클래스 - CLA, INS, P1, P2, LC, Data, LE 관리
 */

import { APDUCommand as IAPDUCommand } from '../../types';

export class APDUCommand {
    private _cla: string;
    private _ins: string;
    private _p1: string;
    private _p2: string;
    private _lc?: string;
    private _data?: string;
    private _le?: string;

    constructor(command: IAPDUCommand) {
        this._cla = this.validateHexByte(command.cla, 'CLA');
        this._ins = this.validateHexByte(command.ins, 'INS');
        this._p1 = this.validateHexByte(command.p1, 'P1');
        this._p2 = this.validateHexByte(command.p2, 'P2');

        if (command.lc) {
            this._lc = this.validateHexByte(command.lc, 'LC');
        }
        if (command.data) {
            this._data = this.validateHexString(command.data, 'Data');
        }
        if (command.le) {
            this._le = this.validateHexByte(command.le, 'LE');
        }
    }

    /**
     * Hex 바이트 검증 (2자리)
     */
    private validateHexByte(value: string, fieldName: string): string {
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        if (!/^[0-9A-F]{2}$/.test(cleaned)) {
            throw new Error(`${fieldName} must be a 2-digit hex value`);
        }
        return cleaned;
    }

    /**
     * Hex 문자열 검증 (짝수 길이)
     */
    private validateHexString(value: string, fieldName: string): string {
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        if (!/^[0-9A-F]*$/.test(cleaned)) {
            throw new Error(`${fieldName} must contain only hex characters`);
        }
        if (cleaned.length % 2 !== 0) {
            throw new Error(`${fieldName} must have even length`);
        }
        return cleaned;
    }

    /**
     * 전체 APDU 명령을 hex 문자열로 반환
     */
    toHexString(): string {
        let command = `${this._cla}${this._ins}${this._p1}${this._p2}`;

        if (this._lc) {
            command += this._lc;
        }
        if (this._data) {
            command += this._data;
        }
        if (this._le) {
            command += this._le;
        }

        return command;
    }

    /**
     * 공백으로 구분된 hex 문자열로 반환
     */
    toFormattedString(): string {
        const hex = this.toHexString();
        return hex.match(/.{1,2}/g)?.join(' ') || '';
    }

    /**
     * APDU 명령 객체로 반환
     */
    toObject(): IAPDUCommand {
        return {
            cla: this._cla,
            ins: this._ins,
            p1: this._p1,
            p2: this._p2,
            lc: this._lc,
            data: this._data,
            le: this._le,
        };
    }

    /**
     * Getters
     */
    get cla(): string { return this._cla; }
    get ins(): string { return this._ins; }
    get p1(): string { return this._p1; }
    get p2(): string { return this._p2; }
    get lc(): string | undefined { return this._lc; }
    get data(): string | undefined { return this._data; }
    get le(): string | undefined { return this._le; }

    /**
     * Hex 문자열로부터 APDU 명령 생성
     */
    static fromHexString(hexString: string): APDUCommand {
        const cleaned = hexString.replace(/\s/g, '').toUpperCase();

        if (cleaned.length < 8) {
            throw new Error('APDU command must be at least 4 bytes (8 hex characters)');
        }

        const cla = cleaned.substring(0, 2);
        const ins = cleaned.substring(2, 4);
        const p1 = cleaned.substring(4, 6);
        const p2 = cleaned.substring(6, 8);

        let lc: string | undefined;
        let data: string | undefined;
        let le: string | undefined;

        if (cleaned.length > 8) {
            const remaining = cleaned.substring(8);

            // Case 1: 명령만 있는 경우 (4바이트)
            // Case 2: 명령 + LE (5바이트)
            // Case 3: 명령 + LC + Data (5+ 바이트)
            // Case 4: 명령 + LC + Data + LE (6+ 바이트)

            if (remaining.length === 2) {
                // Case 2: LE만 있음
                le = remaining;
            } else if (remaining.length >= 4) {
                // LC가 있음
                lc = remaining.substring(0, 2);
                const lcValue = parseInt(lc, 16);
                const expectedDataLength = lcValue * 2;

                if (remaining.length >= 2 + expectedDataLength) {
                    data = remaining.substring(2, 2 + expectedDataLength);

                    if (remaining.length > 2 + expectedDataLength) {
                        le = remaining.substring(2 + expectedDataLength, 2 + expectedDataLength + 2);
                    }
                }
            }
        }

        return new APDUCommand({ cla, ins, p1, p2, lc, data, le });
    }
}
