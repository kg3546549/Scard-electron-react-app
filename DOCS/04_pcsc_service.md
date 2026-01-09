# PCSC Service

File: `src/core/services/PCSCService.ts`

## Role
Renderer-side IPC client that sends driver commands and tracks responses.

## Core Mechanics
- `initializeIPCListener()`
  - Listens to `channel` for driver responses.
  - Listens to `driver-status` for process state updates.
- `pendingRequests` map holds uuid -> handler with timeout.
- `sendCommand(cmd, data?, timeout?)`
  - Builds `ProtocolData` with uuid.
  - Sends via `window.electron.ipcRenderer.send('requestChannel', requestData)`.
  - Resolves on `result === Success`, rejects otherwise.

## Connection API
- `connect()`: establish context (driver auto-spawned in Main).
- `disconnect()`: release context.
- `establishContext()` / `releaseContext()` (aliases).

## Reader/Card API
- `getReaderList()`
- `connectCard()` / `disconnectCard()`
- `getATR()`

## APDU API
- `transmit(apduHex)` sends `Cmd_SCard_Transmit`.
- `getMifareUID()` uses `FFCA000000`.
- `getMifareSAK()` uses `FFCA020000` (reader-dependent).
- `getMifareATS()` uses `FFCA010000` (reader-dependent).

## Mifare Classic Helpers
- `loadMifareKey(key)` -> `FF82000006{KEY}`
- `authenticateMifare(block, keyType)` -> `FF860000050100{block}{60/61}00`
- `readMifareBlock(block)` -> `FFB000{block}10`
- `writeMifareBlock(block, data)` -> `FFA000{block}10{data}`

## Event Dispatch
`DriverEventType` is emitted for status updates and data received to `useDriverStore`.

