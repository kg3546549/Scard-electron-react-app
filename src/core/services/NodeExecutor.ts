/**
 * Node Executor
 * 다이어그램 노드 실행 엔진 - 노드 타입별 APDU 실행 + 파이프/변수 처리
 */

import { DiagramNode, DiagramNodeType, NodeParameter, APDUResponse, PipeConfig, CryptoConfig } from '../../types';
import { ISO7816Service } from './ISO7816Service';
import { encryptData, decryptData, validateCryptoConfig } from '../../Utils/CryptoUtils';

export class NodeExecutor {
    private iso7816Service: ISO7816Service;

    constructor(iso7816Service: ISO7816Service) {
        this.iso7816Service = iso7816Service;
    }

    /**
     * 노드 실행
     */
    async executeNode(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>,
        variables?: Map<string, string>
    ): Promise<APDUResponse> {
        const nodeType = (node as any)?.data?.type || node.type;

        switch (nodeType) {
            case DiagramNodeType.ENCRYPT_DATA:
                return this.executeEncryptData(node, previousNodes, variables);
            case DiagramNodeType.DECRYPT_DATA:
                return this.executeDecryptData(node, previousNodes, variables);
            case DiagramNodeType.CONCAT_DATA:
                return this.executeConcatData(node, previousNodes, variables);
            // All APDU nodes are now handled as CUSTOM_APDU with preset values
            case DiagramNodeType.SELECT_AID:
            case DiagramNodeType.GET_CHALLENGE:
            case DiagramNodeType.INTERNAL_AUTH:
            case DiagramNodeType.EXTERNAL_AUTH:
            case DiagramNodeType.READ_RECORD:
            case DiagramNodeType.READ_BINARY:
            case DiagramNodeType.CUSTOM_APDU:
                return this.executeAPDUCommand(node, previousNodes, variables);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    /**
     * 통합 APDU 명령 실행
     * 모든 APDU 노드는 CLA, INS, P1, P2, Data, Le 파라미터를 가지며
     * 노드 타입은 단지 기본값(preset)만 다름
     */
    private async executeAPDUCommand(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>,
        variables?: Map<string, string>
    ): Promise<APDUResponse> {
        const nodeType = (node as any)?.data?.type || node.type;
        const claParam = this.getParameter(node, 'CLA');
        const insParam = this.getParameter(node, 'INS');
        const p1Param = this.getParameter(node, 'P1');
        const p2Param = this.getParameter(node, 'P2');
        const leParam = this.getParameter(node, 'Le');

        if (!claParam || !insParam || !p1Param || !p2Param) {
            throw new Error('CLA, INS, P1, P2 parameters are required');
        }

        // 변수/파이프/수동 데이터 순서
        let data = '';
        const varUse = node.data.variableConfig?.use;
        const priority = node.data.pipeConfig?.priority || 'pipe';

        if (varUse?.dataVar && variables?.has(varUse.dataVar)) {
            data = variables.get(varUse.dataVar) || '';
        }

        const pipeConfig = node.data.pipeConfig;
        if (!data && pipeConfig && previousNodes && priority === 'pipe') {
            data = this.extractPipeDataFromConfig(pipeConfig, previousNodes);
        }
        if (!data) {
            const dataParam = this.getParameter(node, 'Data');
            data = dataParam?.value || '';
        }

        if (nodeType === DiagramNodeType.SELECT_AID && !data) {
            throw new Error('AID parameter is required');
        }

        const commandHex = this.buildAPDUCommand(
            claParam.value,
            insParam.value,
            p1Param.value,
            p2Param.value,
            data,
            leParam?.value
        );

        // 실행된 APDU를 노드에 기록해 결과 패널에 표시
        (node.data as any).lastCommandHex = commandHex;

        const response = await this.iso7816Service.sendQuickCommand(commandHex);

        // 변수 저장
        this.saveVariables(node, response, variables);

        return response;
    }

    /**
     * 파라미터 가져오기
     */
    private getParameter(node: DiagramNode, name: string): NodeParameter | undefined {
        return node.data.parameters.find(p => p.name === name);
    }

    /**
     * APDU 명령 빌드
     */
    private buildAPDUCommand(
        cla: string,
        ins: string,
        p1: string,
        p2: string,
        data?: string,
        le?: string
    ): string {
        let command = cla + ins + p1 + p2;

        if (data && data.length > 0) {
            const lc = (data.length / 2).toString(16).padStart(2, '0').toUpperCase();
            command += lc + data;
        }

        if (le) {
            command += le;
        }

        return command;
    }

    /**
     * ENCRYPT_DATA 실행
     */
    private async executeEncryptData(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>,
        variables?: Map<string, string>
    ): Promise<APDUResponse> {
        // 데이터 소스: 변수 > 파이프
        let sourceData = '';
        const varUse = node.data.variableConfig?.use;
        if (varUse?.dataVar && variables?.has(varUse.dataVar)) {
            sourceData = variables.get(varUse.dataVar) || '';
        }
        if (!sourceData) {
            const pipeConfig = this.resolvePipeConfig(node, previousNodes, { allowDefault: true });
            if (!pipeConfig) {
                throw new Error('No source node for encryption pipe');
            }
            sourceData = this.extractPipeDataFromConfig(pipeConfig, previousNodes);
        }
        if (!sourceData) {
            const dataParam = this.getParameter(node, 'Data');
            sourceData = dataParam?.value || '';
        }

        if (!node.data.cryptoConfig) {
            throw new Error('Crypto config is required for ENCRYPT_DATA node');
        }

        const cryptoConfig = this.applyVariableToCryptoConfig(node.data.cryptoConfig, varUse, variables);
        const validation = validateCryptoConfig(cryptoConfig);
        if (!validation.valid) {
            throw new Error(`Invalid crypto config: ${validation.errors.join(', ')}`);
        }

        (node.data as any).cryptoMeta = {
            input: sourceData,
            key: cryptoConfig.key,
            iv: cryptoConfig.iv || '',
            output: '',
        };

        const encryptedData = await encryptData(sourceData, cryptoConfig);

        node.data.processedData = encryptedData;
        (node.data as any).cryptoMeta.output = encryptedData;

        const result: APDUResponse = {
            data: encryptedData,
            sw1: '90',
            sw2: '00',
            statusCode: '9000',
            success: true,
        };

        this.saveVariables(node, result, variables);
        return result;
    }

    /**
     * CONCAT_DATA 실행: A + B 데이터 연결
     * A: 변수(use.dataVar) -> pipeConfig -> 파라미터 AData
     * B: 변수(use.keyVar) -> pipeConfigB -> 파라미터 BData
     */
    private async executeConcatData(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>,
        variables?: Map<string, string>
    ): Promise<APDUResponse> {
        const varUse = node.data.variableConfig?.use;

        // A 소스
        let aData = '';
        if (varUse?.dataVar && variables?.has(varUse.dataVar)) {
            aData = variables.get(varUse.dataVar) || '';
        }
        if (!aData) {
            const pipeA = this.resolvePipeConfig(node, previousNodes, { allowDefault: false });
            if (pipeA && previousNodes) {
                aData = this.extractPipeDataFromConfig(pipeA, previousNodes);
            }
        }
        if (!aData) {
            aData = this.getParameter(node, 'AData')?.value || '';
        }

        // B 소스
        let bData = '';
        if (varUse?.keyVar && variables?.has(varUse.keyVar)) {
            bData = variables.get(varUse.keyVar) || '';
        }
        if (!bData && (node.data as any).pipeConfigB && previousNodes) {
            bData = this.extractPipeDataFromConfig((node.data as any).pipeConfigB, previousNodes);
        }
        if (!bData) {
            bData = this.getParameter(node, 'BData')?.value || '';
        }

        const combined = `${aData}${bData}`;
        node.data.processedData = combined;

        const result: APDUResponse = {
            data: combined,
            sw1: '90',
            sw2: '00',
            statusCode: '9000',
            success: true,
        };

        this.saveVariables(node, result, variables);
        return result;
    }

    /**
     * DECRYPT_DATA 실행
     */
    private async executeDecryptData(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>,
        variables?: Map<string, string>
    ): Promise<APDUResponse> {
        // 데이터 소스: 변수 > 파이프
        let sourceData = '';
        const varUse = node.data.variableConfig?.use;
        if (varUse?.dataVar && variables?.has(varUse.dataVar)) {
            sourceData = variables.get(varUse.dataVar) || '';
        }
        if (!sourceData) {
            const pipeConfig = this.resolvePipeConfig(node, previousNodes, { allowDefault: true });
            if (!pipeConfig) {
                throw new Error('No source node for decryption pipe');
            }
            sourceData = this.extractPipeDataFromConfig(pipeConfig, previousNodes);
        }
        if (!sourceData) {
            const dataParam = this.getParameter(node, 'Data');
            sourceData = dataParam?.value || '';
        }

        if (!node.data.cryptoConfig) {
            throw new Error('Crypto config is required for DECRYPT_DATA node');
        }

        const cryptoConfig = this.applyVariableToCryptoConfig(node.data.cryptoConfig, varUse, variables);
        const validation = validateCryptoConfig(cryptoConfig);
        if (!validation.valid) {
            throw new Error(`Invalid crypto config: ${validation.errors.join(', ')}`);
        }

        (node.data as any).cryptoMeta = {
            input: sourceData,
            key: cryptoConfig.key,
            iv: cryptoConfig.iv || '',
            output: '',
        };

        const decryptedData = await decryptData(sourceData, cryptoConfig);

        node.data.processedData = decryptedData;
        (node.data as any).cryptoMeta.output = decryptedData;

        const result: APDUResponse = {
            data: decryptedData,
            sw1: '90',
            sw2: '00',
            statusCode: '9000',
            success: true,
        };

        this.saveVariables(node, result, variables);
        return result;
    }

    /**
     * 파이프에서 데이터 추출
     */
    private extractPipeDataFromConfig(
        pipeConfig: PipeConfig & { segments?: { dataOffset: number; dataLength: number }[] },
        previousNodes?: Map<string, DiagramNode>
    ): string {
        if (!previousNodes) {
            throw new Error('Previous nodes not available for pipe');
        }

        const sourceNode = previousNodes.get(pipeConfig.sourceNodeId);
        if (!sourceNode) {
            throw new Error(`Source node not found: ${pipeConfig.sourceNodeId}`);
        }

        // 소스 데이터 가져오기 (processedData 우선, 없으면 response.data)
        let sourceData = sourceNode.data.processedData || sourceNode.data.response?.data || '';

        if (!sourceData) {
            throw new Error(`No data available from source node: ${pipeConfig.sourceNodeId}`);
        }

        const segments = pipeConfig.segments && pipeConfig.segments.length > 0
            ? pipeConfig.segments
            : [{ dataOffset: pipeConfig.dataOffset, dataLength: pipeConfig.dataLength }];

        const merged = segments.map((seg) => {
            const offset = seg.dataOffset * 2; // hex 문자열이므로 *2
            let length = seg.dataLength;
            if (length === -1) {
                return sourceData.substring(offset);
            }
            length = length * 2; // hex 문자열이므로 *2
            return sourceData.substring(offset, offset + length);
        }).join('');

        return merged;
    }

    /**
     * 파이프 설정 해석: 명시적 설정이 있으면 사용, 없으면 직전 실행 노드 전체 데이터 사용
     */
    private resolvePipeConfig(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>,
        options?: { allowDefault?: boolean; preferCryptoSource?: boolean }
    ): { sourceNodeId: string; dataOffset: number; dataLength: number } | null {
        if (node.data.pipeConfig) {
            return node.data.pipeConfig;
        }

        if (!options?.allowDefault || !previousNodes || previousNodes.size === 0) {
            return null;
        }

        const values = Array.from(previousNodes.values());

        // 선호: 마지막으로 실행된 Crypto 노드
        if (options?.preferCryptoSource) {
            for (let i = values.length - 1; i >= 0; i--) {
                const n = values[i];
                const t = (n.data as any)?.type || n.type;
                if (t === DiagramNodeType.ENCRYPT_DATA || t === DiagramNodeType.DECRYPT_DATA) {
                    return {
                        sourceNodeId: n.id,
                        dataOffset: 0,
                        dataLength: -1,
                    };
                }
            }
            // 암복호화 소스가 없으면 파이프하지 않음
            return null;
        }

        // 기본: 마지막 실행 노드
        const last = values[values.length - 1];
        return {
            sourceNodeId: last.id,
            dataOffset: 0,
            dataLength: -1,
        };
    }

    /**
     * 변수 저장
     */
    private saveVariables(node: DiagramNode, response: any, variables?: Map<string, string>): void {
        if (!variables || !node.data.variableConfig?.save) return;

        node.data.variableConfig.save.forEach((cfg) => {
            const sourceType = cfg.source;
            let sourceData = '';
            if (sourceType === 'response') {
                sourceData = response?.data || '';
            } else {
                sourceData = node.data.processedData || '';
            }
            if (!sourceData) return;

            const offset = (cfg.dataOffset || 0) * 2;
            const length = cfg.dataLength === -1 ? -1 : (cfg.dataLength || 0) * 2;
            let slice = '';
            if (length === -1) {
                slice = sourceData.substring(offset);
            } else {
                slice = sourceData.substring(offset, offset + length);
            }
            variables.set(cfg.name, slice);
        });
    }

    /**
     * 변수로 CryptoConfig 치환
     */
    private applyVariableToCryptoConfig(
        config: CryptoConfig,
        varUse: any,
        variables?: Map<string, string>
    ): CryptoConfig {
        if (!variables || !varUse) return config;
        const newCfg: CryptoConfig = { ...config };
        if (varUse.keyVar && variables.has(varUse.keyVar)) {
            newCfg.key = variables.get(varUse.keyVar) || newCfg.key;
        }
        if (varUse.ivVar && variables.has(varUse.ivVar)) {
            newCfg.iv = variables.get(varUse.ivVar) || newCfg.iv;
        }
        return newCfg;
    }
}
