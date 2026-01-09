# ISO7816 Service

File: `src/core/services/ISO7816Service.ts`

## Role
High-level ISO7816 APDU service that:
- Connects to card
- Sends APDU commands
- Parses responses and stores transaction logs

## Connect Flow
`connectCard()`
1) `pcscService.connect()` (if needed)
2) `establishContext()`
3) `getReaderList()`
4) `connectCard()`
5) `getATR()`
6) optional UID read via `getMifareUID()`

## APDU Send
`transmitAPDU(apduCommand | string)`
- Converts `APDUCommand` -> hex
- Calls `pcscService.transmit()`
- Parses via `APDUResponse`
- Appends to card transaction history

Quick helpers:
- `sendQuickCommand(hex)`
- `selectAID(aid)`
- `getChallenge(length)`
- `readBinary(offset, length)`
- `readRecord(recordNumber, sfi)`

## Model Integration
- Uses `ISO7816Card` to store card info and transactions.

