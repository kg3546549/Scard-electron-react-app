/**
 * Diagram Type Definitions
 * 다이어그램 관련 TypeScript 타입 정의
 */

import { APDUCommand, APDUResponse } from './apdu.types';

/**
 * 다이어그램 노드 타입
 */
export enum DiagramNodeType {
    SELECT_AID = 'SELECT_AID',
    GET_CHALLENGE = 'GET_CHALLENGE',
    INTERNAL_AUTH = 'INTERNAL_AUTH',
    EXTERNAL_AUTH = 'EXTERNAL_AUTH',
    READ_RECORD = 'READ_RECORD',
    READ_BINARY = 'READ_BINARY',
    CUSTOM_APDU = 'CUSTOM_APDU',
    ENCRYPT_DATA = 'ENCRYPT_DATA',
    DECRYPT_DATA = 'DECRYPT_DATA',
    CONCAT_DATA = 'CONCAT_DATA',
}

/**
 * 암호화 알고리즘
 */
export enum CryptoAlgorithm {
    NONE = 'NONE',
    DES = 'DES',
    TRIPLE_DES = 'TRIPLE_DES',
    AES = 'AES',
    SEED = 'SEED',
}

/**
 * 암호화 설정
 */
export interface CryptoConfig {
    algorithm: CryptoAlgorithm;
    key: string; // hex 문자열
    iv?: string; // hex 문자열 (optional)
}

/**
 * 노드 파라미터
 */
export interface NodeParameter {
    name: string;
    value: string;
    type: 'hex' | 'string' | 'number';
    description?: string;
}

/**
 * 파이프 설정 (암복호화 노드용)
 */
export interface PipeConfig {
    sourceNodeId: string; // 이전 노드 ID
    dataOffset: number; // 데이터 시작 오프셋 (바이트)
    dataLength: number; // 읽을 데이터 길이 (-1 = 전체)
    segments?: Array<{
        dataOffset: number;
        dataLength: number;
    }>;
    priority?: 'pipe' | 'variable';
}

export interface VariableSaveConfig {
    name: string;
    source: 'response' | 'processedData';
    dataOffset: number;
    dataLength: number; // -1 = 전체
}

export interface VariableUseConfig {
    dataVar?: string;
    keyVar?: string;
    ivVar?: string;
}

/**
 * 다이어그램 노드
 */
export interface DiagramNode {
    id: string;
    type: DiagramNodeType;
    position: { x: number; y: number };
    data: {
        label: string;
        apduCommand?: APDUCommand;
        parameters: NodeParameter[];
        cryptoConfig?: CryptoConfig;
        pipeConfig?: PipeConfig;
        pipeConfigB?: PipeConfig; // CONCAT_DATA 보조 파이프
        variableConfig?: {
            save?: VariableSaveConfig[];
            use?: VariableUseConfig;
        };
        response?: APDUResponse;
        executed: boolean;
        error?: string;
        processedData?: string;
    };
}

/**
 * 노드 연결
 */
export interface DiagramEdge {
    id: string;
    source: string;
    target: string;
    type?: 'default' | 'success' | 'error';
}

/**
 * 다이어그램 데이터
 */
export interface DiagramData {
    id: string;
    name: string;
    description?: string;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 노드 실행 결과
 */
export interface NodeExecutionResult {
    nodeId: string;
    success: boolean;
    response?: APDUResponse;
    error?: string;
    executionTime: number;
    variablesSnapshot?: Record<string, string>;
    outputData?: string;
    nodeType?: DiagramNodeType;
    cryptoInput?: string;
    cryptoKey?: string;
    cryptoIv?: string;
    cryptoOutput?: string;
}

/**
 * 다이어그램 실행 옵션
 */
export interface DiagramExecutionOptions {
    stopOnError: boolean;
    delay?: number;
}

/**
 * 다이어그램 실행 상태
 */
export enum DiagramExecutionStatus {
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR',
}

/**
 * 노드 팔레트 아이템
 */
export interface NodePaletteItem {
    type: DiagramNodeType;
    label: string;
    description: string;
    icon?: string;
    defaultParameters: NodeParameter[];
}
