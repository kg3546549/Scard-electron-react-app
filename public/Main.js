const {app, BrowserWindow, ipcMain, session, dialog} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const url = require('url');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs').promises;

//Electron Reload (disabled for now to avoid module loading issues)
// require('electron-reload')(__dirname, {
//     electron: require(`${__dirname}/../node_modules/electron`)
// });

let mainWindow;
let driverProcess = null;
let driverReady = false;
const pendingRequests = new Map(); // uuid -> {resolve, reject, timeout}
let lastDriverStatus = null;

// Command enum (matching driver protocol)
const Command = {
    Cmd_Err: 0,

    // Socket Commands (not used in stdio mode)
    Cmd_Socket_Execute: 10,
    Cmd_Socket_Connect: 11,
    Cmd_Socket_Disconnect: 12,

    // SCard Commands
    Cmd_SCard_Establish_Context: 101,
    Cmd_Scard_Release_Context: 1001,
    Cmd_SCard_Reader_List: 102,
    Cmd_SCard_Connect_Card: 103,
    Cmd_SCard_Disconnect_Card: 104,
    Cmd_SCard_Transmit: 105,
    Cmd_SCard_GetATR: 106,

    // Mifare Commands
    Cmd_MI_Get_UID: 201,
    Cmd_MI_Load_Key: 202,
    Cmd_MI_Authentication: 203,
    Cmd_MI_Read_Block: 204,
    Cmd_MI_Write_Block: 205,
    Cmd_MI_Decrement: 206,
    Cmd_MI_Increment: 207,
    Cmd_MI_Restore: 208,
    Cmd_MI_HALT: 209,
};

const Sender = {
    Request: 10,
    Response: 20,
};

const Result = {
    Success: 0,
    Fail: 99,
};

function createWindow() {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: 1300,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "../src/preload.js"),
        },
        autoHideMenuBar: true,
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../public/index.html'),
        protocol: 'file:',
        slashes: true
    });

    console.log(`START URL : ${startUrl}`);
    mainWindow.loadURL(startUrl);
    mainWindowState.manage(mainWindow);

    // 창 생성 이후 최근 드라이버 상태를 한 번 더 전달
    if (lastDriverStatus) {
        mainWindow.webContents.send('driver-status', lastDriverStatus);
    }
}

/**
 * Spawn winscard-pcsc.exe driver process
 */
function spawnDriverProcess() {
    const driverPath = path.join(__dirname, '../winscard-driver/winscard-pcsc.exe');

    console.log('[DRIVER] Spawning driver process:', driverPath);

    driverProcess = spawn(driverPath, [], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle stdout (driver responses)
    let buffer = '';
    driverProcess.stdout.on('data', (data) => {
        buffer += data.toString('utf-8');

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        lines.forEach(line => {
            line = line.trim();
            if (line) {
                try {
                    const response = JSON.parse(line);
                    console.log('[DRIVER] Response received:', response);
                    handleDriverResponse(response);
                } catch (err) {
                    console.error('[DRIVER] Failed to parse response:', line, err);
                }
            }
        });
    });

    // Handle stderr
    driverProcess.stderr.on('data', (data) => {
        console.error('[DRIVER] stderr:', data.toString());
    });

    // Handle process exit
    driverProcess.on('exit', (code) => {
        console.log(`[DRIVER] Process exited with code ${code}`);
        driverReady = false;

        // Notify renderer that driver stopped
        const statusPayload = {
            status: 'STOPPED',
            message: `Driver process exited with code ${code}`
        };
        lastDriverStatus = statusPayload;
        if (mainWindow) {
            mainWindow.webContents.send('driver-status', statusPayload);
        }

        // Reject all pending requests
        pendingRequests.forEach(({reject}) => {
            reject(new Error('Driver process exited'));
        });
        pendingRequests.clear();
    });

    // Handle process errors
    driverProcess.on('error', (err) => {
        console.error('[DRIVER] Process error:', err);
        driverReady = false;
    });

    driverReady = true;
    console.log('[DRIVER] Driver process spawned successfully');

    // Notify renderer that driver is ready
    setTimeout(() => {
        const statusPayload = {
            status: 'RUNNING',
            message: 'Driver process is running'
        };
        lastDriverStatus = statusPayload;
        if (mainWindow) {
            mainWindow.webContents.send('driver-status', statusPayload);
        }
    }, 100);
}

/**
 * Send command to driver via stdin
 */
function sendDriverCommand(cmd, additionalFields = {}, uuid = null) {
    return new Promise((resolve, reject) => {
        if (!driverProcess || !driverReady) {
            return reject(new Error('Driver process not ready'));
        }

        const requestUuid = uuid || generateUUID();
        const request = {
            cmd,
            msgCnt: 1,
            sender: Sender.Request,
            uuid: requestUuid,  // UUID를 요청에 포함
            ...additionalFields
        };

        // Set timeout
        const timeoutId = setTimeout(() => {
            pendingRequests.delete(requestUuid);
            reject(new Error(`Command timeout: ${cmd}`));
        }, 10000);

        // Store request
        pendingRequests.set(requestUuid, {
            resolve,
            reject,
            timeout: timeoutId,
            cmd
        });

        // Send to driver
        const requestLine = JSON.stringify(request) + '\n';
        console.log('[DRIVER] Sending command:', request);
        driverProcess.stdin.write(requestLine);
    });
}

/**
 * Handle driver response
 */
function handleDriverResponse(response) {
    let patchedResponse = { ...response };

    // Driver may omit uuid; try to match pending request by command
    if (!patchedResponse.uuid) {
        const pendingEntry = [...pendingRequests.entries()].find(
            ([, pending]) => pending.cmd === patchedResponse.cmd
        );
        if (pendingEntry) {
            patchedResponse.uuid = pendingEntry[0];
        }
    }

    // Handle UUID-tracked requests
    const pending = patchedResponse.uuid ? pendingRequests.get(patchedResponse.uuid) : undefined;
    if (pending) {
        clearTimeout(pending.timeout);
        pendingRequests.delete(patchedResponse.uuid);

        if (patchedResponse.result === Result.Success) {
            pending.resolve(patchedResponse);
        } else {
            const errorMsg = patchedResponse.data && patchedResponse.data[0] ? patchedResponse.data[0] : 'Command failed';
            pending.reject(new Error(errorMsg));
        }
    }

    // Also forward to renderer
    if (mainWindow) {
        mainWindow.webContents.send('channel', patchedResponse);
    }
}

/**
 * Generate UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// App lifecycle
app.on('ready', () => {
    spawnDriverProcess();
    setTimeout(createWindow, 500); // Give driver a moment to start
});

app.on('before-quit', () => {
    console.log('[DRIVER] Terminating driver process');
    if (driverProcess) {
        driverProcess.kill();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers for renderer process
ipcMain.on('requestChannel', async (event, requestData) => {
    // console.log('[IPC] Request received:', requestData);

    try {
        let response;

        switch(requestData.cmd) {
            case Command.Cmd_SCard_Establish_Context:
                response = await sendDriverCommand(Command.Cmd_SCard_Establish_Context, {}, requestData.uuid);
                break;

            case Command.Cmd_Scard_Release_Context:
                response = await sendDriverCommand(Command.Cmd_Scard_Release_Context, {}, requestData.uuid);
                break;

            case Command.Cmd_SCard_Reader_List:
                response = await sendDriverCommand(Command.Cmd_SCard_Reader_List, {}, requestData.uuid);
                break;

            case Command.Cmd_SCard_Connect_Card:
                response = await sendDriverCommand(Command.Cmd_SCard_Connect_Card, {
                    readerNum: requestData.readerNum || 0
                }, requestData.uuid);
                break;

            case Command.Cmd_SCard_Disconnect_Card:
                response = await sendDriverCommand(Command.Cmd_SCard_Disconnect_Card, {}, requestData.uuid);
                break;

            case Command.Cmd_SCard_GetATR:
                response = await sendDriverCommand(Command.Cmd_SCard_GetATR, {
                    readerNum: requestData.readerNum || 0
                }, requestData.uuid);
                break;

            case Command.Cmd_SCard_Transmit:
                if (!requestData.data || requestData.data.length === 0) {
                    throw new Error('APDU data is required for Transmit command');
                }
                response = await sendDriverCommand(Command.Cmd_SCard_Transmit, {
                    apdu: requestData.data[0]
                }, requestData.uuid);
                break;

            // Mifare Commands
            case Command.Cmd_MI_Get_UID:
                response = await sendDriverCommand(Command.Cmd_MI_Get_UID, {}, requestData.uuid);
                break;

            case Command.Cmd_MI_Load_Key:
                if (!requestData.data || requestData.data.length === 0) {
                    throw new Error('Key data is required for Load Key command');
                }
                response = await sendDriverCommand(Command.Cmd_MI_Load_Key, {
                    keyType: requestData.data[0] || 'A',
                    key: requestData.data[1] || 'FFFFFFFFFFFF'
                }, requestData.uuid);
                break;

            case Command.Cmd_MI_Authentication:
                if (!requestData.data || requestData.data.length < 2) {
                    throw new Error('Block number and key type are required for Authentication command');
                }
                response = await sendDriverCommand(Command.Cmd_MI_Authentication, {
                    blockNumber: requestData.data[0],
                    keyType: requestData.data[1]
                }, requestData.uuid);
                break;

            case Command.Cmd_MI_Read_Block:
                if (!requestData.data || requestData.data.length === 0) {
                    throw new Error('Block number is required for Read Block command');
                }
                response = await sendDriverCommand(Command.Cmd_MI_Read_Block, {
                    blockNumber: requestData.data[0]
                }, requestData.uuid);
                break;

            case Command.Cmd_MI_Write_Block:
                if (!requestData.data || requestData.data.length < 2) {
                    throw new Error('Block number and data are required for Write Block command');
                }
                response = await sendDriverCommand(Command.Cmd_MI_Write_Block, {
                    blockNumber: requestData.data[0],
                    data: requestData.data[1]
                }, requestData.uuid);
                break;

            case Command.Cmd_MI_Decrement:
                if (!requestData.data || requestData.data.length < 2) {
                    throw new Error('Block number and value are required for Decrement command');
                }
                response = await sendDriverCommand(Command.Cmd_MI_Decrement, {
                    blockNumber: requestData.data[0],
                    value: requestData.data[1]
                }, requestData.uuid);
                break;

            case Command.Cmd_MI_Increment:
                if (!requestData.data || requestData.data.length < 2) {
                    throw new Error('Block number and value are required for Increment command');
                }
                response = await sendDriverCommand(Command.Cmd_MI_Increment, {
                    blockNumber: requestData.data[0],
                    value: requestData.data[1]
                }, requestData.uuid);
                break;

            case Command.Cmd_MI_Restore:
                if (!requestData.data || requestData.data.length === 0) {
                    throw new Error('Block number is required for Restore command');
                }
                response = await sendDriverCommand(Command.Cmd_MI_Restore, {
                    blockNumber: requestData.data[0]
                }, requestData.uuid);
                break;

            case Command.Cmd_MI_HALT:
                response = await sendDriverCommand(Command.Cmd_MI_HALT, {}, requestData.uuid);
                break;

            default:
                throw new Error(`Unknown command: ${requestData.cmd}`);
        }

        // console.log('[IPC] Command succeeded:', response);

    } catch (error) {
        // console.error('[IPC] Command failed:', error);

        // Send error response to renderer
        const errorResponse = {
            cmd: requestData.cmd,
            sender: Sender.Response,
            msgCnt: requestData.msgCnt || 1,
            uuid: requestData.uuid,
            result: Result.Fail,
            dataLength: 1,
            data: [error.message]
        };

        mainWindow.webContents.send('channel', errorResponse);
    }
});

// Diagram file operations
ipcMain.handle('dialog:saveFile', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Diagram',
        defaultPath: 'diagram.apdu',
        filters: options?.filters || [
            { name: 'APDU Diagram', extensions: ['apdu'] },
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result;
});

ipcMain.handle('dialog:openFile', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Open Diagram',
        filters: options?.filters || [
            { name: 'APDU Diagram', extensions: ['apdu'] },
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    });
    return result;
});

ipcMain.handle('save-diagram', async (event, { filePath, jsonData }) => {
    try {
        console.log('[ELECTRON] save-diagram handler called');
        console.log('[ELECTRON] filePath:', filePath);

        if (!jsonData) {
            throw new Error('jsonData is undefined or null');
        }

        await fs.writeFile(filePath, jsonData, 'utf-8');
        console.log('[ELECTRON] File saved successfully');
        return { success: true };
    } catch (error) {
        console.error('[ELECTRON] Failed to save diagram:', error);
        throw error;
    }
});

ipcMain.handle('load-diagram', async (event, filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return data;
    } catch (error) {
        console.error('Failed to load diagram:', error);
        throw error;
    }
});
