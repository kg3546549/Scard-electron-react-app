/**
 * Crypto Utilities
 * 암호화 관련 유틸리티 함수
 *
 * Note: 실제 암호화 구현은 crypto 라이브러리가 필요합니다.
 * 현재는 기본 구조만 제공하며, 향후 crypto-js 등의 라이브러리 사용이 필요합니다.
 */

import { CryptoAlgorithm, CryptoConfig } from '../types';
import CryptoJS from 'crypto-js';
import { KISA_SEED_CBC } from '@kr-yeon/kisa-seed';

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

    switch (config.algorithm) {
        case CryptoAlgorithm.AES:
            return encryptAES(data, config.key, config.iv);
        case CryptoAlgorithm.DES:
            return encryptDES(data, config.key, config.iv);
        case CryptoAlgorithm.TRIPLE_DES:
            return encrypt3DES(data, config.key, config.iv);
        case CryptoAlgorithm.SEED:
            return encryptSEED(data, config.key, config.iv);
        default:
            throw new Error(`Encryption for ${config.algorithm} is not supported. Use AES.`);
    }
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

    switch (config.algorithm) {
        case CryptoAlgorithm.AES:
            return decryptAES(encryptedData, config.key, config.iv);
        case CryptoAlgorithm.DES:
            return decryptDES(encryptedData, config.key, config.iv);
        case CryptoAlgorithm.TRIPLE_DES:
            return decrypt3DES(encryptedData, config.key, config.iv);
        case CryptoAlgorithm.SEED:
            return decryptSEED(encryptedData, config.key, config.iv);
        default:
            throw new Error(`Decryption for ${config.algorithm} is not supported. Use AES.`);
    }
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
 * WebCrypto subtle 얻기
 */
function getSubtle(): SubtleCrypto {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
        return window.crypto.subtle;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).crypto?.subtle) {
        return (globalThis as any).crypto.subtle;
    }
    throw new Error('Web Crypto API is not available in this environment');
}

/**
 * AES-CBC 암호화 (hex in/out)
 */
async function encryptAES(dataHex: string, keyHex: string, ivHex?: string): Promise<string> {
    const dataBytes = hexToBytes(dataHex);
    const keyBytes = hexToBytes(keyHex);
    const ivBytes = ivHex ? hexToBytes(ivHex) : new Uint8Array(16);

    if (![16, 24, 32].includes(keyBytes.length)) {
        throw new Error('AES key must be 16/24/32 bytes');
    }
    if (ivBytes.length !== 16) {
        throw new Error('AES IV must be 16 bytes');
    }

    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
    const encrypted = await subtle.encrypt({ name: 'AES-CBC', iv: ivBytes }, cryptoKey, dataBytes);
    return bytesToHex(new Uint8Array(encrypted)).toUpperCase();
}

/**
 * AES-CBC 복호화 (hex in/out)
 */
async function decryptAES(encHex: string, keyHex: string, ivHex?: string): Promise<string> {
    const encBytes = hexToBytes(encHex);
    const keyBytes = hexToBytes(keyHex);
    const ivBytes = ivHex ? hexToBytes(ivHex) : new Uint8Array(16);

    if (![16, 24, 32].includes(keyBytes.length)) {
        throw new Error('AES key must be 16/24/32 bytes');
    }
    if (ivBytes.length !== 16) {
        throw new Error('AES IV must be 16 bytes');
    }

    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['decrypt']);
    const decrypted = await subtle.decrypt({ name: 'AES-CBC', iv: ivBytes }, cryptoKey, encBytes);
    return bytesToHex(new Uint8Array(decrypted)).toUpperCase();
}

/**
 * DES-CBC (crypto-js) hex in/out
 */
function encryptDES(dataHex: string, keyHex: string, ivHex?: string): string {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex || '0000000000000000');
    const cipher = CryptoJS.DES.encrypt(CryptoJS.enc.Hex.parse(dataHex), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return cipher.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function decryptDES(encHex: string, keyHex: string, ivHex?: string): string {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex || '0000000000000000');
    const plaintext = CryptoJS.DES.decrypt(
        { ciphertext: CryptoJS.enc.Hex.parse(encHex) } as any,
        key,
        { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return plaintext.toString(CryptoJS.enc.Hex).toUpperCase();
}

/**
 * 3DES-CBC (crypto-js) hex in/out
 */
function encrypt3DES(dataHex: string, keyHex: string, ivHex?: string): string {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex || '0000000000000000');
    const cipher = CryptoJS.TripleDES.encrypt(CryptoJS.enc.Hex.parse(dataHex), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return cipher.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function decrypt3DES(encHex: string, keyHex: string, ivHex?: string): string {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex || '0000000000000000');
    const plaintext = CryptoJS.TripleDES.decrypt(
        { ciphertext: CryptoJS.enc.Hex.parse(encHex) } as any,
        key,
        { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return plaintext.toString(CryptoJS.enc.Hex).toUpperCase();
}

/**
 * SEED-CBC (kisa-seed) hex in/out
 */
function encryptSEED(dataHex: string, keyHex: string, ivHex?: string): string {
    const keyBytes = hexToBytes(keyHex);
    const ivBytes = ivHex ? hexToBytes(ivHex) : new Uint8Array(16);

    if (keyBytes.length !== 16) {
        throw new Error('SEED key must be 16 bytes (32 hex chars)');
    }
    if (ivBytes.length !== 16) {
        throw new Error('SEED IV must be 16 bytes (32 hex chars)');
    }

    const dataBytes = hexToBytes(dataHex);
    const enc = KISA_SEED_CBC.SEED_CBC_Encrypt(keyBytes, ivBytes, dataBytes, 0, dataBytes.length);
    return bytesToHex(enc).toUpperCase();
}

function decryptSEED(encHex: string, keyHex: string, ivHex?: string): string {
    const keyBytes = hexToBytes(keyHex);
    const ivBytes = ivHex ? hexToBytes(ivHex) : new Uint8Array(16);

    if (keyBytes.length !== 16) {
        throw new Error('SEED key must be 16 bytes (32 hex chars)');
    }
    if (ivBytes.length !== 16) {
        throw new Error('SEED IV must be 16 bytes (32 hex chars)');
    }

    const encBytes = hexToBytes(encHex);
    const dec = KISA_SEED_CBC.SEED_CBC_Decrypt(keyBytes, ivBytes, encBytes, 0, encBytes.length);
    return bytesToHex(dec).toUpperCase();
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
