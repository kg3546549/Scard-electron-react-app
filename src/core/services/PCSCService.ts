/**
 * PCSC Service
 * PCSC 드라이버 통신 서비스 - Singleton 패턴
 * Main.js의 stdin/stdout 드라이버와 IPC로 통신
 */

import { v4 as uuidv4 } from 'uuid';
import {
    Command,
    Sender,
    Result,
    ProtocolData,
    DriverConnectionStatus,
    DriverEvent,
    DriverEventType,
    DriverResponseHandler,
} from '../../types';

/**
 * PCSC 서비스 클래스 (Singleton)
 */
export class PCSCService {
    private static instance: PCSCService | null = null;
    private connectionStatus: DriverConnectionStatus = DriverConnectionStatus.STOPPED;
    private pendingRequests: Map<string, DriverResponseHandler> = new Map();
    private eventListeners: Set<(event: DriverEvent) => void> = new Set();

    private constructor() {
        this.initializeIPCListener();
    }

    /**
     * Singleton 인스턴스 가져오기
     */
    static getInstance(): PCSCService {
        if (!PCSCService.instance) {
            PCSCService.instance = new PCSCService();
        }
        return PCSCService.instance;
    }

    /**
     * IPC 리스너 초기화
     */
    private initializeIPCListener(): void {
        if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
            // 명령 응답 리스너
            window.electron.ipcRenderer.on('channel', (_event: any, responseData: ProtocolData) => {
                this.handleResponse(responseData);
            });

            // 드라이버 상태 리스너
            window.electron.ipcRenderer.on('driver-status', (_event: any, statusData: { status: string; message: string }) => {
                this.handleDriverStatus(statusData);
            });
        }
    }

    /**
     * 드라이버 상태 처리
     */
    private handleDriverStatus(statusData: { status: string; message: string }): void {
        console.log('Driver Status:', statusData);

        let eventType: DriverEventType;
        switch (statusData.status) {
            case 'RUNNING':
                this.connectionStatus = DriverConnectionStatus.RUNNING;
                eventType = DriverEventType.DRIVER_STARTED;
                break;
            case 'STOPPED':
                this.connectionStatus = DriverConnectionStatus.STOPPED;
                eventType = DriverEventType.DRIVER_STOPPED;
                break;
            case 'ERROR':
                this.connectionStatus = DriverConnectionStatus.ERROR;
                eventType = DriverEventType.ERROR;
                break;
            default:
                return;
        }

        const event: DriverEvent = {
            type: eventType,
            timestamp: new Date(),
        };
        this.notifyListeners(event);
    }

    /**
     * 응답 처리
     */
    private handleResponse(responseData: ProtocolData): void {
        console.log('PCSC Response:', responseData);

        // UUID에 해당하는 핸들러 찾기
        const handler = this.pendingRequests.get(responseData.uuid);
        if (handler) {
            handler(responseData);
            this.pendingRequests.delete(responseData.uuid);
        }

        // 이벤트 리스너에게 알림
        const event: DriverEvent = {
            type: DriverEventType.DATA_RECEIVED,
            data: responseData,
            timestamp: new Date(),
        };
        this.notifyListeners(event);
    }

    /**
     * 이벤트 리스너 등록
     */
    addEventListener(listener: (event: DriverEvent) => void): void {
        this.eventListeners.add(listener);
    }

    /**
     * 이벤트 리스너 제거
     */
    removeEventListener(listener: (event: DriverEvent) => void): void {
        this.eventListeners.delete(listener);
    }

    /**
     * 모든 리스너에게 이벤트 알림
     */
    private notifyListeners(event: DriverEvent): void {
        this.eventListeners.forEach(listener => listener(event));
    }

    /**
     * 명령 전송
     */
    async sendCommand(
        command: Command,
        data: string[] = [],
        timeout: number = 5000
    ): Promise<ProtocolData> {
        return new Promise((resolve, reject) => {
            const uuid = uuidv4();

            const requestData: ProtocolData = {
                cmd: command,
                sender: Sender.Request,
                msgCnt: 0,
                uuid,
                result: Result.Default_Fail,
                dataLength: data.length,
                data,
            };

            // 타임아웃 설정
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(uuid);
                reject(new Error(`Command timeout: ${Command[command]}`));
            }, timeout);

            // 응답 핸들러 등록
            this.pendingRequests.set(uuid, (responseData: ProtocolData) => {
                clearTimeout(timeoutId);

                if (responseData.result === Result.Success) {
                    resolve(responseData);
                } else {
                    reject(new Error(`Command failed: ${Command[command]}, Result: ${responseData.result}`));
                }
            });

            // IPC로 명령 전송
            if (window.electron?.ipcRenderer) {
                console.log('Sending PCSC Command:', requestData);
                window.electron.ipcRenderer.send('requestChannel', requestData);
            } else {
                clearTimeout(timeoutId);
                this.pendingRequests.delete(uuid);
                reject(new Error('Electron IPC not available'));
            }
        });
    }

    /**
     * Context 설정
     * 드라이버가 자동으로 spawn되므로 별도의 연결 과정 불필요
     */
    async connect(): Promise<boolean> {
        try {
            this.connectionStatus = DriverConnectionStatus.STARTING;
            await this.sendCommand(Command.Cmd_SCard_Establish_Context);
            this.connectionStatus = DriverConnectionStatus.CONTEXT_READY;

            const event: DriverEvent = {
                type: DriverEventType.CONTEXT_ESTABLISHED,
                timestamp: new Date(),
            };
            this.notifyListeners(event);

            return true;
        } catch (error) {
            this.connectionStatus = DriverConnectionStatus.ERROR;
            const event: DriverEvent = {
                type: DriverEventType.ERROR,
                error: error as Error,
                timestamp: new Date(),
            };
            this.notifyListeners(event);
            throw error;
        }
    }

    /**
     * Context 해제
     */
    async disconnect(): Promise<boolean> {
        try {
            await this.sendCommand(Command.Cmd_Scard_Release_Context);
            this.connectionStatus = DriverConnectionStatus.RUNNING;

            const event: DriverEvent = {
                type: DriverEventType.CONTEXT_RELEASED,
                timestamp: new Date(),
            };
            this.notifyListeners(event);

            return true;
        } catch (error) {
            this.connectionStatus = DriverConnectionStatus.ERROR;
            throw error;
        }
    }

    /**
     * Context 설정 (별칭)
     */
    async establishContext(): Promise<void> {
        await this.sendCommand(Command.Cmd_SCard_Establish_Context);
    }

    /**
     * Context 해제 (별칭)
     */
    async releaseContext(): Promise<void> {
        await this.sendCommand(Command.Cmd_Scard_Release_Context);
    }

    /**
     * 리더 목록 조회
     */
    async getReaderList(): Promise<string[]> {
        const response = await this.sendCommand(Command.Cmd_SCard_Reader_List);
        return response.data;
    }

    /**
     * 카드 연결
     */
    async connectCard(): Promise<void> {
        await this.sendCommand(Command.Cmd_SCard_Connect_Card);
    }

    /**
     * 카드 연결 해제
     */
    async disconnectCard(): Promise<void> {
        await this.sendCommand(Command.Cmd_SCard_Disconnect_Card);
    }

    /**
     * ATR 조회
     */
    async getATR(): Promise<string> {
        const response = await this.sendCommand(Command.Cmd_SCard_GetATR);
        return response.data[0] || '';
    }

    /**
     * APDU 전송
     */
    async transmit(apduCommand: string): Promise<string> {
        const response = await this.sendCommand(Command.Cmd_SCard_Transmit, [apduCommand]);
        return response.data[0] || ''; // 응답 APDU
    }

    /**
     * Mifare UID 조회
     */
    async getMifareUID(): Promise<string> {
        const response = await this.sendCommand(Command.Cmd_SCard_Transmit, ['FFCA000000']);
        return response.data[0] || '';
    }

    /**
     * Mifare SAK 조회 (리더 지원 시)
     */
    async getMifareSAK(): Promise<string> {
        const response = await this.sendCommand(Command.Cmd_SCard_Transmit, ['FFCA020000']);
        return response.data[0] || '';
    }

    /**
     * Mifare ATS 조회 (리더 지원 시)
     */
    async getMifareATS(): Promise<string> {
        const response = await this.sendCommand(Command.Cmd_SCard_Transmit, ['FFCA010000']);
        return response.data[0] || '';
    }


    /**
     * Mifare 키 로드
     */
    async loadMifareKey(key: string): Promise<void> {
        const keyHex = key.toUpperCase();
        if (keyHex.length !== 12) {
            throw new Error('Mifare key must be 6 bytes (12 hex chars)');
        }
        // Load key into key slot 0: FF 82 00 00 06 <key>
        const apdu = `FF82000006${keyHex}`;
        await this.sendCommand(Command.Cmd_SCard_Transmit, [apdu]);
    }

    /**
     * Mifare 인증
     */
    async authenticateMifare(blockNumber: string, keyType: string): Promise<string> {
        const blockHex = this.toHexByte(blockNumber);
        const keyTypeByte = keyType === 'B' ? '61' : '60'; // default A(60), B(61)
        const keySlot = '00'; // use slot 0 where we loaded the key
        // FF 86 00 00 05 01 00 <block> <keyType> <keySlot>
        const apdu = `FF860000050100${blockHex}${keyTypeByte}${keySlot}`;
        const response = await this.sendCommand(Command.Cmd_SCard_Transmit, [apdu]);
        return response.data[0] || '';
    }

    /**
     * Mifare 블록 읽기
     */
    async readMifareBlock(blockNumber: string): Promise<string> {
        const blockHex = this.toHexByte(blockNumber);
        // FF B0 00 <block> 10
        const apdu = `FFB000${blockHex}10`;
        const response = await this.sendCommand(Command.Cmd_SCard_Transmit, [apdu]);
        return response.data[0] || '';
    }

    /**
     * Mifare 블록 쓰기
     */
    async writeMifareBlock(blockNumber: string, data: string): Promise<void> {
        const blockHex = this.toHexByte(blockNumber);
        const dataHex = data.toUpperCase();
        if (dataHex.length !== 32) {
            throw new Error('Mifare write data must be 16 bytes (32 hex chars)');
        }
        // FF A0 00 <block> 10 <data>
        const apdu = `FFA000${blockHex}10${dataHex}`;
        await this.sendCommand(Command.Cmd_SCard_Transmit, [apdu]);
    }

    /**
     * Mifare HALT
     */
    async haltMifare(): Promise<void> {
        // Not available over this driver; no-op
        return;
    }

    /**
     * 숫자/문자 블록 번호를 1바이트 hex로 변환
     */
    private toHexByte(value: string): string {
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (Number.isNaN(num) || num < 0 || num > 255) {
            throw new Error('Block number must be between 0 and 255');
        }
        return num.toString(16).padStart(2, '0').toUpperCase();
    }

    /**
     * 연결 상태 조회
     */
    getConnectionStatus(): DriverConnectionStatus {
        return this.connectionStatus;
    }

    /**
     * 연결 여부 확인
     */
    isConnected(): boolean {
        return this.connectionStatus === DriverConnectionStatus.CONTEXT_READY;
    }
}

// Singleton 인스턴스 export
export const pcscService = PCSCService.getInstance();
