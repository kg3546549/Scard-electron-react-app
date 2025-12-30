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
        switch (node.type) {
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

        // Check if data should come from pipe (for auth nodes)
        let data = '';
        if (node.data.pipeConfig && previousNodes) {
            data = this.extractPipeData(node, previousNodes);
        } else {
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
    private extractPipeData(node: DiagramNode, previousNodes?: Map<string, DiagramNode>): string {
        if (!node.data.pipeConfig || !previousNodes) {
            throw new Error('Pipe config or previous nodes not available');
        }

        const sourceNode = previousNodes.get(node.data.pipeConfig.sourceNodeId);
        if (!sourceNode) {
            throw new Error(`Source node not found: ${node.data.pipeConfig.sourceNodeId}`);
        }

        // 소스 데이터 가져오기 (processedData 우선, 없으면 response.data)
        let sourceData = sourceNode.data.processedData || sourceNode.data.response?.data || '';

        if (!sourceData) {
            throw new Error(`No data available from source node: ${node.data.pipeConfig.sourceNodeId}`);
        }

        // 오프셋과 길이 적용
        const offset = node.data.pipeConfig.dataOffset * 2; // hex 문자열이므로 *2
        let length = node.data.pipeConfig.dataLength;

        if (length === -1) {
            // 전체 데이터
            sourceData = sourceData.substring(offset);
        } else {
            // 지정된 길이만큼
            length = length * 2; // hex 문자열이므로 *2
            sourceData = sourceData.substring(offset, offset + length);
        }

        return sourceData;
    }

    /**
     * ENCRYPT_DATA 실행
     */
    private async executeEncryptData(
        node: DiagramNode,
        previousNodes?: Map<string, DiagramNode>
    ): Promise<APDUResponse> {
        // 파이프에서 데이터 추출
        const sourceData = this.extractPipeData(node, previousNodes);

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
        // 파이프에서 데이터 추출
        const sourceData = this.extractPipeData(node, previousNodes);

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
}
