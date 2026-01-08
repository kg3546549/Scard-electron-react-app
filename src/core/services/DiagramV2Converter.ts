import {
    DiagramData,
    DiagramEdge,
    DiagramNode,
    DiagramNodeType,
    NodeParameter,
    CryptoConfig,
    CryptoAlgorithm,
    PipeConfig,
    VariableSaveConfig,
} from '../../types';
import { DiagramDataV2, DiagramNodeV2, DataSourceV2 } from '../../types/diagram.v2.types';

const defaultNodeParams = (): NodeParameter[] => ([
    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
    { name: 'INS', value: '00', type: 'hex', description: 'Instruction byte' },
    { name: 'P1', value: '00', type: 'hex', description: 'Parameter 1' },
    { name: 'P2', value: '00', type: 'hex', description: 'Parameter 2' },
    { name: 'Data', value: '', type: 'hex', description: 'Command data' },
    { name: 'Le', value: '', type: 'hex', description: 'Expected response length' },
]);

const setParam = (params: NodeParameter[], name: string, value: string) => {
    const idx = params.findIndex(p => p.name === name);
    if (idx >= 0) params[idx] = { ...params[idx], value };
    else params.push({ name, value, type: 'hex', description: '' });
};

const dataSourceToPipe = (source: DataSourceV2): PipeConfig | undefined => {
    if (source.type !== 'pipe') return undefined;
    return {
        sourceNodeId: source.sourceNodeId,
        dataOffset: source.dataOffset,
        dataLength: source.dataLength,
    };
};

const applyDataSourceToParam = (
    node: DiagramNode,
    source: DataSourceV2 | undefined,
    role: 'data' | 'a' | 'b'
) => {
    if (!source) return;
    if (source.type === 'literal') {
        const paramName = role === 'data' ? 'Data' : role === 'a' ? 'AData' : 'BData';
        setParam(node.data.parameters, paramName, source.value);
        return;
    }
    if (source.type === 'variable') {
        if (!node.data.variableConfig) node.data.variableConfig = {};
        if (!node.data.variableConfig.use) node.data.variableConfig.use = {};
        if (role === 'data' || role === 'a') {
            node.data.variableConfig.use.dataVar = source.name;
        } else {
            node.data.variableConfig.use.keyVar = source.name;
        }
        return;
    }
    const pipe = dataSourceToPipe(source);
    if (pipe) {
        if (role === 'b') node.data.pipeConfigB = pipe;
        else node.data.pipeConfig = pipe;
    }
};

const applyKeyIvSource = (
    node: DiagramNode,
    source: DataSourceV2 | undefined,
    role: 'key' | 'iv'
) => {
    if (!source) return;
    if (source.type === 'literal') {
        if (!node.data.cryptoConfig) {
            node.data.cryptoConfig = { algorithm: CryptoAlgorithm.NONE, key: '', iv: '' };
        }
        if (role === 'key') node.data.cryptoConfig.key = source.value;
        if (role === 'iv') node.data.cryptoConfig.iv = source.value;
        return;
    }
    if (source.type === 'variable') {
        if (!node.data.variableConfig) node.data.variableConfig = {};
        if (!node.data.variableConfig.use) node.data.variableConfig.use = {};
        if (role === 'key') node.data.variableConfig.use.keyVar = source.name;
        if (role === 'iv') node.data.variableConfig.use.ivVar = source.name;
    }
};

const mapNode = (node: DiagramNodeV2): DiagramNode => {
    const base: DiagramNode = {
        id: node.id,
        type: DiagramNodeType.CUSTOM_APDU,
        position: node.position,
        data: {
            label: node.label,
            parameters: [],
            executed: false,
        },
    };

    if (node.kind === 'APDU') {
        base.type = DiagramNodeType.CUSTOM_APDU;
        base.data.parameters = defaultNodeParams();
        if (node.apdu) {
            setParam(base.data.parameters, 'CLA', node.apdu.cla);
            setParam(base.data.parameters, 'INS', node.apdu.ins);
            setParam(base.data.parameters, 'P1', node.apdu.p1);
            setParam(base.data.parameters, 'P2', node.apdu.p2);
            if (node.apdu.le !== undefined) setParam(base.data.parameters, 'Le', node.apdu.le);
        }
        applyDataSourceToParam(base, node.inputs?.data, 'data');
        if (node.outputs?.save) {
            base.data.variableConfig = base.data.variableConfig || {};
            base.data.variableConfig.save = node.outputs.save as VariableSaveConfig[];
        }
        return base;
    }

    if (node.kind === 'CRYPTO') {
        const mode = node.crypto?.mode || 'encrypt';
        base.type = mode === 'decrypt' ? DiagramNodeType.DECRYPT_DATA : DiagramNodeType.ENCRYPT_DATA;
        base.data.parameters = [];
        base.data.cryptoConfig = {
            algorithm: (node.crypto?.algorithm || 'NONE') as CryptoConfig['algorithm'],
            key: '',
            iv: '',
        };
        applyDataSourceToParam(base, node.inputs?.data, 'data');
        applyKeyIvSource(base, node.inputs?.key, 'key');
        applyKeyIvSource(base, node.inputs?.iv, 'iv');
        if (node.outputs?.save) {
            base.data.variableConfig = base.data.variableConfig || {};
            base.data.variableConfig.save = node.outputs.save as VariableSaveConfig[];
        }
        return base;
    }

    if (node.kind === 'CONCAT') {
        base.type = DiagramNodeType.CONCAT_DATA;
        base.data.parameters = [
            { name: 'AData', value: '', type: 'hex', description: 'Concat A' },
            { name: 'BData', value: '', type: 'hex', description: 'Concat B' },
        ];
        applyDataSourceToParam(base, node.inputs?.a, 'a');
        applyDataSourceToParam(base, node.inputs?.b, 'b');
        if (node.outputs?.save) {
            base.data.variableConfig = base.data.variableConfig || {};
            base.data.variableConfig.save = node.outputs.save as VariableSaveConfig[];
        }
        return base;
    }

    return base;
};

export const convertDiagramV2ToLegacy = (diagram: DiagramDataV2): DiagramData => {
    const nodes = diagram.nodes.map(mapNode);
    const edges: DiagramEdge[] = diagram.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
    }));

    return {
        id: diagram.id,
        name: diagram.name,
        description: diagram.description,
        nodes,
        edges,
        createdAt: new Date(diagram.createdAt),
        updatedAt: new Date(diagram.updatedAt),
    };
};

const getParamValue = (node: DiagramNode, name: string): string => {
    return node.data.parameters?.find((p) => p.name === name)?.value || '';
};

const mapSourceFromLegacy = (
    node: DiagramNode,
    role: 'data' | 'a' | 'b' | 'key' | 'iv'
): DataSourceV2 | undefined => {
    const use = node.data.variableConfig?.use;
    if (role === 'data' || role === 'a') {
        if (use?.dataVar) return { type: 'variable', name: use.dataVar };
        if (node.data.pipeConfig) {
            return {
                type: 'pipe',
                sourceNodeId: node.data.pipeConfig.sourceNodeId,
                sourceField: 'processedData',
                dataOffset: node.data.pipeConfig.dataOffset,
                dataLength: node.data.pipeConfig.dataLength,
            };
        }
        const name = role === 'data' ? 'Data' : 'AData';
        const val = getParamValue(node, name);
        return val ? { type: 'literal', value: val } : undefined;
    }
    if (role === 'b') {
        if (use?.keyVar) return { type: 'variable', name: use.keyVar };
        if (node.data.pipeConfigB) {
            return {
                type: 'pipe',
                sourceNodeId: node.data.pipeConfigB.sourceNodeId,
                sourceField: 'processedData',
                dataOffset: node.data.pipeConfigB.dataOffset,
                dataLength: node.data.pipeConfigB.dataLength,
            };
        }
        const val = getParamValue(node, 'BData');
        return val ? { type: 'literal', value: val } : undefined;
    }
    if (role === 'key') {
        if (use?.keyVar) return { type: 'variable', name: use.keyVar };
        const val = node.data.cryptoConfig?.key || '';
        return val ? { type: 'literal', value: val } : undefined;
    }
    if (role === 'iv') {
        if (use?.ivVar) return { type: 'variable', name: use.ivVar };
        const val = node.data.cryptoConfig?.iv || '';
        return val ? { type: 'literal', value: val } : undefined;
    }
    return undefined;
};

const mapLegacyNodeToV2 = (node: DiagramNode): DiagramNodeV2 => {
    const nodeType = (node.data as any)?.type || node.type;
    if (nodeType === DiagramNodeType.ENCRYPT_DATA || nodeType === DiagramNodeType.DECRYPT_DATA) {
        return {
            id: node.id,
            kind: 'CRYPTO',
            label: node.data.label,
            position: node.position,
            crypto: {
                algorithm: (node.data.cryptoConfig?.algorithm || 'NONE') as any,
                mode: nodeType === DiagramNodeType.DECRYPT_DATA ? 'decrypt' : 'encrypt',
            },
            inputs: {
                data: mapSourceFromLegacy(node, 'data'),
                key: mapSourceFromLegacy(node, 'key'),
                iv: mapSourceFromLegacy(node, 'iv'),
            },
            outputs: {
                save: node.data.variableConfig?.save || [],
            },
        };
    }

    if (nodeType === DiagramNodeType.CONCAT_DATA) {
        return {
            id: node.id,
            kind: 'CONCAT',
            label: node.data.label,
            position: node.position,
            inputs: {
                a: mapSourceFromLegacy(node, 'a'),
                b: mapSourceFromLegacy(node, 'b'),
            },
            outputs: {
                save: node.data.variableConfig?.save || [],
            },
        };
    }

    // default APDU
    return {
        id: node.id,
        kind: 'APDU',
        label: node.data.label,
        position: node.position,
        apdu: {
            cla: getParamValue(node, 'CLA') || '00',
            ins: getParamValue(node, 'INS') || '00',
            p1: getParamValue(node, 'P1') || '00',
            p2: getParamValue(node, 'P2') || '00',
            le: getParamValue(node, 'Le') || '',
        },
        inputs: {
            data: mapSourceFromLegacy(node, 'data'),
        },
        outputs: {
            save: node.data.variableConfig?.save || [],
        },
    };
};

export const convertDiagramLegacyToV2 = (diagram: DiagramData): DiagramDataV2 => {
    return {
        schemaVersion: 2,
        id: diagram.id,
        name: diagram.name,
        description: diagram.description,
        nodes: diagram.nodes.map(mapLegacyNodeToV2),
        edges: diagram.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type,
        })),
        createdAt: new Date(diagram.createdAt).toISOString(),
        updatedAt: new Date(diagram.updatedAt).toISOString(),
    };
};
