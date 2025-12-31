/**
 * Node Executor
 * 다이어그램 노드 실행 엔진 - 노드 타입별 APDU 실행
 */

import { DiagramNode, DiagramNodeType, NodeParameter, APDUResponse } from '../../types';
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
    async executeNode(node: DiagramNode, previousNodes?: Map<string, DiagramNode>): Promise<APDUResponse> {
        const nodeType = (node as any)?.data?.type || node.type;

        switch (nodeType) {
            case DiagramNodeType.ENCRYPT_DATA:
                return this.executeEncryptData(node, previousNodes);
            case DiagramNodeType.DECRYPT_DATA:
                return this.executeDecryptData(node, previousNodes);
            // All APDU nodes are now handled as CUSTOM_APDU with preset values
            case DiagramNodeType.SELECT_AID:
            case DiagramNodeType.GET_CHALLENGE:
            case DiagramNodeType.INTERNAL_AUTH:
            case DiagramNodeType.EXTERNAL_AUTH:
            case DiagramNodeType.READ_RECORD:
            case DiagramNodeType.READ_BINARY:
            case DiagramNodeType.CUSTOM_APDU:
                return this.executeAPDUCommand(node, previousNodes);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    /**
     * 통합 APDU 명령 실행
     * 모든 APDU 노드는 CLA, INS, P1, P2, Data, Le 파라미터를 가지며
     * 노드 타입은 단지 기본값(preset)만 다름
     */
    private async executeAPDUCommand(node: DiagramNode, previousNodes?: Map<string, DiagramNode>): Promise<APDUResponse> {
        const claParam = this.getParameter(node, 'CLA');
        const insParam = this.getParameter(node, 'INS');
        const p1Param = this.getParameter(node, 'P1');
        const p2Param = this.getParameter(node, 'P2');
        const leParam = this.getParameter(node, 'Le');

        if (!claParam || !insParam || !p1Param || !p2Param) {
            throw new Error('CLA, INS, P1, P2 parameters are required');
        }

        // 파이프 데이터 우선 사용 (pipeConfig가 없으면 직전 실행 노드 데이터 사용)
        let data = '';
        const pipeConfig = this.resolvePipeConfig(node, previousNodes, {
            allowDefault: true,
            preferCryptoSource: true, // APDU 노드는 암복호화 노드 출력만 기본 파이프 소스로 삼는다
        });
        if (pipeConfig && previousNodes) {
            data = this.extractPipeDataFromConfig(pipeConfig, previousNodes);
        }
        if (!data) {
            const dataParam = this.getParameter(node, 'Data');
            data = dataParam?.value || '';
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

        return this.iso7816Service.sendQuickCommand(commandHex);
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
     * 암호화 처리
     */
    private async applyCrypto(data: string, node: DiagramNode): Promise<string> {
        if (!node.data.cryptoConfig) {
            return data;
        }

        // 암호화 설정 검증
        const validation = validateCryptoConfig(node.data.cryptoConfig);
        if (!validation.valid) {
            throw new Error(`Invalid crypto config: ${validation.errors.join(', ')}`);
        }

        // 데이터 암호화
        return encryptData(data, node.data.cryptoConfig);
    }

    /**
     * 복호화 처리
     */
    private async applyDecrypto(data: string, node: DiagramNode): Promise<string> {
        if (!node.data.cryptoConfig) {
            return data;
        }

        // 암호화 설정 검증
        const validation = validateCryptoConfig(node.data.cryptoConfig);
        if (!validation.valid) {
            throw new Error(`Invalid crypto config: ${validation.errors.join(', ')}`);
        }

        // 데이터 복호화
        return decryptData(data, node.data.cryptoConfig);
    }

    /**
     * 파이프에서 데이터 추출
     */
    private extractPipeDataFromConfig(
        pipeConfig: { sourceNodeId: string; dataOffset: number; dataLength: number; segments?: { dataOffset: number; dataLength: number }[] },
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
     * ENCRYPT_DATA 실행
     */
    private async executeEncryptData(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>
    ): Promise<APDUResponse> {
        // 파이프에서 데이터 추출 (pipeConfig 없으면 직전 노드 전체 데이터)
        const pipeConfig = this.resolvePipeConfig(node, previousNodes, { allowDefault: true });
        if (!pipeConfig) {
            throw new Error('No source node for encryption pipe');
        }
        const sourceData = this.extractPipeDataFromConfig(pipeConfig, previousNodes);

        if (!node.data.cryptoConfig) {
            throw new Error('Crypto config is required for ENCRYPT_DATA node');
        }

        // 암호화 수행
        const encryptedData = await this.applyCrypto(sourceData, node);

        // 암호화된 데이터 저장
        node.data.processedData = encryptedData;

        // 가상 응답 생성 (암복호화 노드는 카드와 통신하지 않음)
        return {
            data: encryptedData,
            sw1: '90',
            sw2: '00',
            statusCode: '9000',
            success: true,
        };
    }

    /**
     * DECRYPT_DATA 실행
     */
    private async executeDecryptData(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>
    ): Promise<APDUResponse> {
        // 파이프에서 데이터 추출 (pipeConfig 없으면 직전 노드 전체 데이터)
        const pipeConfig = this.resolvePipeConfig(node, previousNodes, { allowDefault: true });
        if (!pipeConfig) {
            throw new Error('No source node for decryption pipe');
        }
        const sourceData = this.extractPipeDataFromConfig(pipeConfig, previousNodes);

        if (!node.data.cryptoConfig) {
            throw new Error('Crypto config is required for DECRYPT_DATA node');
        }

        // 복호화 수행
        const decryptedData = await this.applyDecrypto(sourceData, node);

        // 복호화된 데이터 저장
        node.data.processedData = decryptedData;

        // 가상 응답 생성
        return {
            data: decryptedData,
            sw1: '90',
            sw2: '00',
            statusCode: '9000',
            success: true,
        };
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
}
