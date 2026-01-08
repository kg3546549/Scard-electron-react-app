/**
 * Diagram V2 Types (Redesigned schema)
 */

export type NodeKindV2 = 'APDU' | 'CRYPTO' | 'CONCAT';

export type DataSourceV2 =
    | { type: 'literal'; value: string }
    | { type: 'variable'; name: string }
    | {
          type: 'pipe';
          sourceNodeId: string;
          sourceField: 'response' | 'processedData';
          dataOffset: number;
          dataLength: number;
      };

export interface VariableSaveConfigV2 {
    name: string;
    source: 'response' | 'processedData';
    dataOffset: number;
    dataLength: number;
}

export interface DiagramNodeV2 {
    id: string;
    kind: NodeKindV2;
    position: { x: number; y: number };
    label: string;
    inputs?: {
        data?: DataSourceV2;
        key?: DataSourceV2;
        iv?: DataSourceV2;
        a?: DataSourceV2;
        b?: DataSourceV2;
    };
    apdu?: {
        cla: string;
        ins: string;
        p1: string;
        p2: string;
        le?: string;
    };
    crypto?: {
        algorithm: 'NONE' | 'DES' | 'TRIPLE_DES' | 'AES' | 'SEED';
        mode: 'encrypt' | 'decrypt';
    };
    outputs?: {
        save?: VariableSaveConfigV2[];
    };
}

export interface DiagramEdgeV2 {
    id: string;
    source: string;
    target: string;
    type?: 'default' | 'success' | 'error';
}

export interface DiagramDataV2 {
    schemaVersion: 2;
    id: string;
    name: string;
    description?: string;
    nodes: DiagramNodeV2[];
    edges: DiagramEdgeV2[];
    createdAt: string;
    updatedAt: string;
}
