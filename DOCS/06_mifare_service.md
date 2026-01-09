# Mifare Service

File: `src/core/services/MifareService.ts`

## Role
Reads Mifare Classic sectors/blocks and updates `MifareCard` model.

## detectCard()
Flow:
- Ensure PCSC connected
- `establishContext` -> `getReaderList` -> `connectCard`
- `getATR()`
- `getMifareUID()`
- Optional `getMifareSAK()` / `getMifareATS()`

Card type logic:
- Prefer SAK (0x08=1K, 0x18=4K, 0x20=Desfire, 0x00=ISO7816)
- If SAK missing and ATS exists -> ISO7816
- If still unknown and UID exists -> fallback MIFARE_1K

## readSectors(sectors, keyConfig, onSectorUpdate?)
- `loadMifareKey()` once
- For each sector:
  - Authenticate block 0 of sector
  - Read 4 blocks, strip SW, store block data
  - Update sector status in card model
  - Call `onSectorUpdate(sectorNumber, card)` for realtime UI
- Failures mark sector error but do NOT stop scan.

## readBlock / writeBlock
- Auth + single block read/write + card model update.

## Utility
- `extractStatusWord()` / `stripStatusWord()` parse APDU responses.
- `delay(ms)` for inter-command pacing.

