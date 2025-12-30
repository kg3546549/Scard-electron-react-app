/**
 * Crypto Utilities
 * 암호화 관련 유틸리티 함수
 *
 * Note: 실제 암호화 구현은 crypto 라이브러리가 필요합니다.
 * 현재는 기본 구조만 제공하며, 향후 crypto-js 등의 라이브러리 사용이 필요합니다.
 */

import { CryptoAlgorithm, CryptoConfig } from '../types';

/**
 * Hex 문자열을 바이트 배열로 변환
 */
export function hexToBytes(hex: string): Uint8Array {
    const cleanHex = hex.replace(/\s/g, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
}

/**
 * 바이트 배열을 Hex 문자열로 변환
 */
export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

/**
 * 데이터 암호화
 *
 * @param data - 암호화할 데이터 (hex 문자열)
 * @param config - 암호화 설정
 * @returns 암호화된 데이터 (hex 문자열)
 */
export async function encryptData(data: string, config: CryptoConfig): Promise<string> {
    if (!data || config.algorithm === CryptoAlgorithm.NONE) {
        return data;
    }

    // TODO: 실제 암호화 구현
    // crypto-js 또는 Web Crypto API를 사용하여 구현 필요

    console.warn(`Encryption with ${config.algorithm} is not yet implemented`);
    console.log('Data:', data);
    console.log('Key:', config.key);
    console.log('IV:', config.iv);

    // 현재는 데이터를 그대로 반환 (placeholder)
    return data;
}

/**
 * 데이터 복호화
 *
 * @param encryptedData - 복호화할 데이터 (hex 문자열)
 * @param config - 암호화 설정
 * @returns 복호화된 데이터 (hex 문자열)
 */
export async function decryptData(encryptedData: string, config: CryptoConfig): Promise<string> {
    if (!encryptedData || config.algorithm === CryptoAlgorithm.NONE) {
        return encryptedData;
    }

    // TODO: 실제 복호화 구현
    // crypto-js 또는 Web Crypto API를 사용하여 구현 필요

    console.warn(`Decryption with ${config.algorithm} is not yet implemented`);
    console.log('Encrypted Data:', encryptedData);
    console.log('Key:', config.key);
    console.log('IV:', config.iv);

    // 현재는 데이터를 그대로 반환 (placeholder)
    return encryptedData;
}

/**
 * XOR 연산 (간단한 암호화/복호화 예제)
 */
export function xorData(data: string, key: string): string {
    const dataBytes = hexToBytes(data);
    const keyBytes = hexToBytes(key);

    const result = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
        result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return bytesToHex(result);
}

/**
 * 암호화 키 검증
 */
export function validateKey(algorithm: CryptoAlgorithm, key: string): boolean {
    // NONE 알고리즘은 키가 없어도 됨
    if (algorithm === CryptoAlgorithm.NONE) {
        return true;
    }

    if (!key) return false;

    const keyLength = key.length / 2; // hex 문자열이므로 2로 나눔

    switch (algorithm) {
        case CryptoAlgorithm.DES:
            return keyLength === 8; // 64 bits
        case CryptoAlgorithm.TRIPLE_DES:
            return keyLength === 16 || keyLength === 24; // 128 or 192 bits
        case CryptoAlgorithm.AES:
            return keyLength === 16 || keyLength === 24 || keyLength === 32; // 128, 192, or 256 bits
        case CryptoAlgorithm.SEED:
            return keyLength === 16; // 128 bits
        default:
            return false;
    }
}

/**
 * IV(Initialization Vector) 검증
 */
export function validateIV(algorithm: CryptoAlgorithm, iv: string): boolean {
    if (!iv) return true; // IV는 선택사항

    const ivLength = iv.length / 2;

    switch (algorithm) {
        case CryptoAlgorithm.NONE:
            return true;
        case CryptoAlgorithm.DES:
        case CryptoAlgorithm.TRIPLE_DES:
            return ivLength === 8; // 64 bits
        case CryptoAlgorithm.AES:
        case CryptoAlgorithm.SEED:
            return ivLength === 16; // 128 bits
        default:
            return false;
    }
}

/**
 * 암호화 설정 검증
 */
export function validateCryptoConfig(config: CryptoConfig): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!validateKey(config.algorithm, config.key)) {
        errors.push(`Invalid key length for ${config.algorithm}`);
    }

    if (config.iv && !validateIV(config.algorithm, config.iv)) {
        errors.push(`Invalid IV length for ${config.algorithm}`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
