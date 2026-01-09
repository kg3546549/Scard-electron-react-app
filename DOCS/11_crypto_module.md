# Crypto Module

File: `src/Utils/CryptoUtils.ts`

## Responsibilities
- Hex <-> byte conversions
- Algorithm-specific encrypt/decrypt
- Key/IV validation

## Algorithms
- AES-CBC: WebCrypto (`window.crypto.subtle`)
- DES / 3DES: `crypto-js`
- SEED: `seed-ecb` (ECB mode)

## Key/IV Validation
- `validateKey(algorithm, key)`
- `validateIV(algorithm, iv)`
- `validateCryptoConfig(config)` returns `{ valid, errors[] }`

## Runtime Notes
- Adds Buffer polyfill for browser builds:
  - `globalThis.Buffer = Buffer` if missing

## Usage in Diagram
- `NodeExecutor` calls `encryptData`/`decryptData`.
- Crypto meta (input/key/iv/output) is stored on node for UI.

