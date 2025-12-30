/**
 * CryptoUtils Unit Tests
 * 암호화 유틸리티 단위 테스트
 */

import {
    hexToBytes,
    bytesToHex,
    validateKey,
    validateIV,
    validateCryptoConfig,
    xorData,
} from '../CryptoUtils';
import { CryptoAlgorithm } from '../../types';

describe('CryptoUtils', () => {
    describe('hexToBytes', () => {
        it('should convert hex string to bytes', () => {
            const hex = '00112233';
            const bytes = hexToBytes(hex);

            expect(bytes).toBeInstanceOf(Uint8Array);
            expect(bytes.length).toBe(4);
            expect(bytes[0]).toBe(0x00);
            expect(bytes[1]).toBe(0x11);
            expect(bytes[2]).toBe(0x22);
            expect(bytes[3]).toBe(0x33);
        });

        it('should handle hex with spaces', () => {
            const hex = '00 11 22 33';
            const bytes = hexToBytes(hex);

            expect(bytes.length).toBe(4);
            expect(bytes[0]).toBe(0x00);
        });

        it('should handle uppercase and lowercase', () => {
            const hexUpper = 'AABBCCDD';
            const hexLower = 'aabbccdd';

            const bytesUpper = hexToBytes(hexUpper);
            const bytesLower = hexToBytes(hexLower);

            expect(bytesUpper).toEqual(bytesLower);
        });
    });

    describe('bytesToHex', () => {
        it('should convert bytes to hex string', () => {
            const bytes = new Uint8Array([0x00, 0x11, 0x22, 0x33]);
            const hex = bytesToHex(bytes);

            expect(hex).toBe('00112233');
        });

        it('should produce uppercase hex', () => {
            const bytes = new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD]);
            const hex = bytesToHex(bytes);

            expect(hex).toBe('AABBCCDD');
        });

        it('should handle empty array', () => {
            const bytes = new Uint8Array([]);
            const hex = bytesToHex(bytes);

            expect(hex).toBe('');
        });
    });

    describe('validateKey', () => {
        it('should validate DES key (8 bytes)', () => {
            const validKey = '0123456789ABCDEF'; // 8 bytes
            expect(validateKey(CryptoAlgorithm.DES, validKey)).toBe(true);

            const invalidKey = '0123'; // 2 bytes
            expect(validateKey(CryptoAlgorithm.DES, invalidKey)).toBe(false);
        });

        it('should validate 3DES key (16 or 24 bytes)', () => {
            const validKey16 = '0123456789ABCDEF0123456789ABCDEF'; // 16 bytes
            const validKey24 = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'; // 24 bytes

            expect(validateKey(CryptoAlgorithm.TRIPLE_DES, validKey16)).toBe(true);
            expect(validateKey(CryptoAlgorithm.TRIPLE_DES, validKey24)).toBe(true);

            const invalidKey = '0123456789ABCDEF'; // 8 bytes
            expect(validateKey(CryptoAlgorithm.TRIPLE_DES, invalidKey)).toBe(false);
        });

        it('should validate AES key (16, 24, or 32 bytes)', () => {
            const validKey128 = '0123456789ABCDEF0123456789ABCDEF'; // 16 bytes (128 bits)
            const validKey192 = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'; // 24 bytes (192 bits)
            const validKey256 = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'; // 32 bytes (256 bits)

            expect(validateKey(CryptoAlgorithm.AES, validKey128)).toBe(true);
            expect(validateKey(CryptoAlgorithm.AES, validKey192)).toBe(true);
            expect(validateKey(CryptoAlgorithm.AES, validKey256)).toBe(true);

            const invalidKey = '0123456789ABCDEF'; // 8 bytes
            expect(validateKey(CryptoAlgorithm.AES, invalidKey)).toBe(false);
        });

        it('should validate SEED key (16 bytes)', () => {
            const validKey = '0123456789ABCDEF0123456789ABCDEF'; // 16 bytes
            expect(validateKey(CryptoAlgorithm.SEED, validKey)).toBe(true);

            const invalidKey = '0123456789ABCDEF'; // 8 bytes
            expect(validateKey(CryptoAlgorithm.SEED, invalidKey)).toBe(false);
        });

        it('should accept NONE algorithm with any key', () => {
            expect(validateKey(CryptoAlgorithm.NONE, '')).toBe(true);
            expect(validateKey(CryptoAlgorithm.NONE, 'anykey')).toBe(true);
        });

        it('should reject empty key for encryption algorithms', () => {
            expect(validateKey(CryptoAlgorithm.DES, '')).toBe(false);
            expect(validateKey(CryptoAlgorithm.AES, '')).toBe(false);
        });
    });

    describe('validateIV', () => {
        it('should validate DES/3DES IV (8 bytes)', () => {
            const validIV = '0123456789ABCDEF'; // 8 bytes
            expect(validateIV(CryptoAlgorithm.DES, validIV)).toBe(true);
            expect(validateIV(CryptoAlgorithm.TRIPLE_DES, validIV)).toBe(true);

            const invalidIV = '01234567'; // 4 bytes
            expect(validateIV(CryptoAlgorithm.DES, invalidIV)).toBe(false);
        });

        it('should validate AES/SEED IV (16 bytes)', () => {
            const validIV = '0123456789ABCDEF0123456789ABCDEF'; // 16 bytes
            expect(validateIV(CryptoAlgorithm.AES, validIV)).toBe(true);
            expect(validateIV(CryptoAlgorithm.SEED, validIV)).toBe(true);

            const invalidIV = '0123456789ABCDEF'; // 8 bytes
            expect(validateIV(CryptoAlgorithm.AES, invalidIV)).toBe(false);
        });

        it('should accept empty IV (optional)', () => {
            expect(validateIV(CryptoAlgorithm.DES, '')).toBe(true);
            expect(validateIV(CryptoAlgorithm.AES, '')).toBe(true);
        });
    });

    describe('validateCryptoConfig', () => {
        it('should validate correct config', () => {
            const config = {
                algorithm: CryptoAlgorithm.AES,
                key: '0123456789ABCDEF0123456789ABCDEF',
                iv: '0123456789ABCDEF0123456789ABCDEF',
            };

            const result = validateCryptoConfig(config);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should detect invalid key length', () => {
            const config = {
                algorithm: CryptoAlgorithm.AES,
                key: '0123', // Too short
            };

            const result = validateCryptoConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('Invalid key length');
        });

        it('should detect invalid IV length', () => {
            const config = {
                algorithm: CryptoAlgorithm.AES,
                key: '0123456789ABCDEF0123456789ABCDEF',
                iv: '0123', // Too short
            };

            const result = validateCryptoConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('Invalid IV length');
        });

        it('should validate NONE algorithm', () => {
            const config = {
                algorithm: CryptoAlgorithm.NONE,
                key: '',
            };

            const result = validateCryptoConfig(config);
            expect(result.valid).toBe(true);
        });
    });

    describe('xorData', () => {
        it('should perform XOR operation', () => {
            const data = 'FFFFFFFF';
            const key = '00000000';
            const result = xorData(data, key);

            expect(result).toBe('FFFFFFFF');
        });

        it('should handle repeating key', () => {
            const data = 'FFFFFFFF';
            const key = 'FF';
            const result = xorData(data, key);

            expect(result).toBe('00000000');
        });

        it('should be reversible', () => {
            const data = '0123456789ABCDEF';
            const key = 'FEDCBA9876543210';

            const encrypted = xorData(data, key);
            const decrypted = xorData(encrypted, key);

            expect(decrypted).toBe(data);
        });
    });
});
