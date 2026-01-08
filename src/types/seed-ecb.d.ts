declare module 'seed-ecb' {
    export function setKey(key: string, encoding?: string): void;
    export function encrypt(input: Uint8Array | Uint32Array): Uint8Array;
    export function decrypt(input: Uint8Array | Uint32Array): Uint8Array;
    export function encryptBase64(input: string, encoding?: string): string;
    export function decryptBase64(input: string, encoding?: string): string;
}
