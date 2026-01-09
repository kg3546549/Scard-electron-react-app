# Packaging & Deployment

## Build Scripts
File: `package.json`

- `yarn build:react` -> React build
- `yarn build:electron` -> electron-builder with `build/Main.js` main
- `yarn build:exe` -> Win x64 build
- `yarn build:installer` -> NSIS installer

## Electron Builder Config
`package.json` -> `build`:
- `directories.output`: `dist`
- `files`: `build/**/*`, `public/Main.js`, `public/preload.js`, `node_modules/**/*`
- `extraResources`: `winscard-driver/**/*` (bundles driver exe)
- `win.target`: `nsis`, `portable`

## Runtime Paths
File: `public/Main.js`
- Preload path: `public/preload.js`
- App entry:
  - dev: `public/index.html`
  - packaged: `build/index.html`
- Driver path:
  - dev: `../winscard-driver/winscard-pcsc.exe`
  - packaged: `process.resourcesPath/winscard-driver/winscard-pcsc.exe`

## Router
File: `src/App.tsx`
- Uses `HashRouter` for `file://` packaged URLs.

## Common Packaging Issues
- `preload.js` missing -> ensure `public/preload.js` included in `files` list.
- driver exe locked -> close running app before rebuild.

