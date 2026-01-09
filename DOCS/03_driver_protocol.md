# Driver Protocol

## Transport
- Driver is a separate exe (`winscard-pcsc.exe`) using stdin/stdout JSON lines.
- Main process (`public/Main.js`) forwards IPC requests to driver.

## Protocol Envelope
Used in `ProtocolData` and `PCSCService.sendCommand`.

Common fields:
- `cmd`: command code (number)
- `sender`: 10 (request) / 20 (response)
- `msgCnt`: sequence counter
- `uuid`: request/response correlation id
- `result`: 0 success / 99 fail
- `dataLength`: array length
- `data`: string array

## Command Mapping
Main process enum: `public/Main.js` -> `Command`.
Common commands:
- 101: SCard_Establish_Context
- 1001: SCard_Release_Context
- 102: SCard_Reader_List
- 103: SCard_Connect_Card
- 104: SCard_Disconnect_Card
- 105: SCard_Transmit (APDU)
- 106: SCard_GetATR

Mifare commands (if driver supports):
- 201: MI_Get_UID
- 202: MI_Load_Key
- 203: MI_Authentication
- 204: MI_Read_Block
- 205: MI_Write_Block
- 206..209: Decrement/Increment/Restore/Halt

## APDU via Transmit
- `Cmd_SCard_Transmit` is mapped in Main to `{ apdu: data[0] }`.
- Responses return `data[0]` as full APDU response string (data + SW1/SW2).

## Error Handling
- Non-zero `result` => Main sends error response to renderer.
- `PCSCService` wraps timeouts (default 5s) and exposes errors to stores.

