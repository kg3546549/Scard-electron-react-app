# Electron Main / IPC

## Main Process
File: `public/Main.js`

Responsibilities:
- Create BrowserWindow and load URL (dev: `public/index.html`, prod: `build/index.html`).
- Spawn driver process (`winscard-pcsc.exe`) and manage lifecycle.
- Forward IPC requests to driver and push responses back to renderer.
- Handle diagram file open/save dialogs.
- Provide driver process status + restart handlers.

Key functions:
- `spawnDriverProcess()`
  - Chooses driver path:
    - dev: `../winscard-driver/winscard-pcsc.exe`
    - prod: `process.resourcesPath/winscard-driver/winscard-pcsc.exe`
  - Pipes stdin/stdout and parses JSON lines.
- `sendDriverCommand(cmd, additionalFields, uuid)`
  - Writes JSON line to driver stdin and tracks timeout.
- `handleDriverResponse(response)`
  - Matches pending request by uuid (or cmd fallback).
- `safeSendToRenderer(channel, payload)`
  - Prevents send after window is destroyed.

IPC channels:
- Renderer -> Main
  - `requestChannel`: core driver commands
  - `dialog:openFile` / `dialog:saveFile`
  - `save-diagram` / `load-diagram`
  - `driver-process-status`
  - `driver-restart`
  - `driver-restart-if-stopped`
- Main -> Renderer
  - `channel`: driver responses
  - `driver-status`: driver process state

## Preload
File: `public/preload.js`

Exposes:
- `window.electron.ipcRenderer` with `send`, `invoke`, `on`, `off`.

Notes:
- `preload.js` is bundled in `public/` and included in packaging via `package.json`.

