# Architecture Overview

## Purpose
This app is an Electron + React client for smartcard workflows. It includes:
- Driver process management (winscard-pcsc.exe)
- PC/SC command transport over IPC
- ISO7816 APDU sending
- Mifare sector reading
- APDU diagram execution (APDU/Crypto/Concat nodes)

## Runtime Layers
- Main process: `public/Main.js`
  - Spawns driver, bridges IPC, handles file dialogs.
- Preload bridge: `public/preload.js`
  - Exposes `window.electron.ipcRenderer` to renderer.
- Renderer (React): pages + stores + services
  - UI pages: `src/pages/*`
  - State: `src/stores/*`
  - Services: `src/core/services/*`
  - Models/types: `src/core/models`, `src/types`

## High-level Data Flow
1) UI action -> store action (zustand)
2) Store calls service (PCSC/ISO7816/Mifare/Diagram)
3) Service sends IPC via `window.electron.ipcRenderer` (requestChannel)
4) Main process forwards to driver (stdin)
5) Driver response -> Main -> renderer `channel`
6) Service resolves pending request -> store updates -> UI re-render

## Diagram Flow (APDU/Crypto/Concat)
- Diagram data lives in `DiagramService` (legacy + V2 schema).
- Execution uses `NodeExecutor` with previous node map and variable map.
- Execution results (with outputData + crypto details) update UI and progress bar.

## Key Entry Points
- App routes: `src/App.tsx`
- Main process: `public/Main.js`
- PCSC core: `src/core/services/PCSCService.ts`
- Diagram execution: `src/core/services/DiagramService.ts`, `src/core/services/NodeExecutor.ts`

