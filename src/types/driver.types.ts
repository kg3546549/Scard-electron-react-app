/**
 * Driver Type Definitions
 * PCSC 드라이버 통신 프로토콜 타입 정의
 */

/**
 * 명령 코드 열거형
 */
export enum Command {
    // Error
    Cmd_Err = 0,

    // Socket Commands
    Cmd_Socket_Execute = 10,
    Cmd_Socket_Connect = 11,
    Cmd_Socket_Disconnect = 12,

    // SCard Commands
    Cmd_SCard_Establish_Context = 101,
    Cmd_Scard_Release_Context = 1001,
    Cmd_SCard_Reader_List = 102,
    Cmd_SCard_Connect_Card = 103,
    Cmd_SCard_Disconnect_Card = 104,
    Cmd_SCard_Transmit = 105,
    Cmd_SCard_GetATR = 106,

    // Mifare Commands
    Cmd_MI_Get_UID = 201,
    Cmd_MI_Load_Key = 202,
    Cmd_MI_Authentication = 203,
    Cmd_MI_Read_Block = 204,
    Cmd_MI_Write_Block = 205,
    Cmd_MI_Decrement = 206,
    Cmd_MI_Increment = 207,
    Cmd_MI_Restore = 208,
    Cmd_MI_HALT = 209,
}

/**
 * 송신자 타입
 */
export enum Sender {
    Request = 0,
    Response = 1,
}

/**
 * 결과 코드
 */
export enum Result {
    Success = 0,
    Socket_AlreadyConnected = 11,
    Socket_Connection_Failed = 12,
    Default_Fail = 99,
}

/**
 * 프로토콜 데이터 구조
 */
export interface ProtocolData {
    cmd: Command;
    sender: Sender;
    msgCnt: number;
    uuid: string;
    result: Result;
    dataLength: number;
    data: string[];
}

/**
 * 드라이버 연결 상태
 */
export enum DriverConnectionStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR',
}

/**
 * 드라이버 이벤트 타입
 */
export enum DriverEventType {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    DATA_RECEIVED = 'DATA_RECEIVED',
    ERROR = 'ERROR',
}

/**
 * 드라이버 이벤트
 */
export interface DriverEvent {
    type: DriverEventType;
    data?: ProtocolData;
    error?: Error;
    timestamp: Date;
}

/**
 * 드라이버 요청 옵션
 */
export interface DriverRequestOptions {
    timeout?: number; // 밀리초
    retries?: number;
}

/**
 * 드라이버 응답 핸들러
 */
export type DriverResponseHandler = (data: ProtocolData) => void;

/**
 * 드라이버 에러 핸들러
 */
export type DriverErrorHandler = (error: Error) => void;
