/**
 * PCSC Service
 * PCSC 드라이버 통신 서비스 - Singleton 패턴
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
    private connectionStatus: DriverConnectionStatus = DriverConnectionStatus.DISCONNECTED;
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
            window.electron.ipcRenderer.on('channel', (_event: any, responseData: ProtocolData) => {
                this.handleResponse(responseData);
            });
        }
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
     * 소켓 연결
     */
    async connect(): Promise<boolean> {
        try {
            this.connectionStatus = DriverConnectionStatus.CONNECTING;
            await this.sendCommand(Command.Cmd_Socket_Connect);
            this.connectionStatus = DriverConnectionStatus.CONNECTED;

            const event: DriverEvent = {
                type: DriverEventType.CONNECTED,
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
     * 소켓 연결 해제
     */
    async disconnect(): Promise<boolean> {
        try {
            await this.sendCommand(Command.Cmd_Socket_Disconnect);
            this.connectionStatus = DriverConnectionStatus.DISCONNECTED;

            const event: DriverEvent = {
                type: DriverEventType.DISCONNECTED,
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
     * Context 설정
     */
    async establishContext(): Promise<void> {
        await this.sendCommand(Command.Cmd_SCard_Establish_Context);
    }

    /**
     * Context 해제
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
        return response.data[1] || ''; // data[0]은 요청, data[1]은 응답
    }

    /**
     * Mifare UID 조회
     */
    async getMifareUID(): Promise<string> {
        const response = await this.sendCommand(Command.Cmd_MI_Get_UID);
        return response.data[0] || '';
    }

    /**
     * Mifare 키 로드
     */
    async loadMifareKey(key: string): Promise<void> {
        await this.sendCommand(Command.Cmd_MI_Load_Key, [key]);
    }

    /**
     * Mifare 인증
     */
    async authenticateMifare(blockNumber: string, keyType: string): Promise<void> {
        await this.sendCommand(Command.Cmd_MI_Authentication, [blockNumber, keyType]);
    }

    /**
     * Mifare 블록 읽기
     */
    async readMifareBlock(blockNumber: string): Promise<string> {
        const response = await this.sendCommand(Command.Cmd_MI_Read_Block, [blockNumber]);
        return response.data[1] || ''; // data[0]은 블록 번호, data[1]은 데이터
    }

    /**
     * Mifare 블록 쓰기
     */
    async writeMifareBlock(blockNumber: string, data: string): Promise<void> {
        await this.sendCommand(Command.Cmd_MI_Write_Block, [blockNumber, data]);
    }

    /**
     * Mifare HALT
     */
    async haltMifare(): Promise<void> {
        await this.sendCommand(Command.Cmd_MI_HALT);
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
        return this.connectionStatus === DriverConnectionStatus.CONNECTED;
    }
}

// Singleton 인스턴스 export
export const pcscService = PCSCService.getInstance();
