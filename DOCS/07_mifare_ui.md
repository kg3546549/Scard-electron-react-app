# Mifare UI

## Page
File: `src/pages/MifareReadingPage.tsx`

Layout:
- Card Status: `CardInfoDisplay` + Detect Card button
- Scan Controls: Start Full Scan / Stop Scan
- Sector Data grid: `SectorCard` list
- Key Settings: `KeySelector`

Behavior:
- `handleDetectCard()` -> `useMifareStore.detectCard()`
- `handleStartScan()` -> `readAllSectors()`
  - Blocks scan if no sector selected or card type is not MIFARE_1K/4K.

## Store
File: `src/stores/useMifareStore.ts`

State:
- `cardInfo`, `sectorData`, `selectedSectors`, `keyConfig`, `status`, `error`

Actions:
- `detectCard()` -> service.detectCard()
- `readSectors()` -> service.readSectors(..., onSectorUpdate)
  - Updates `sectorData` per sector for realtime UI
- `readAllSectors()` -> selected sector list
- `selectAllSectors()` / `deselectAllSectors()`
- `setKeyConfig()` updates `MifareCard` model
- `clearData()` resets all sector data

## Components
- `CardInfoDisplay` shows ATR/UID/SAK/ATS values
- `SectorCard` displays 4 block strings and selection state
- `KeySelector` toggles key A/B and hex key value

