/**
 * Diagram Service
 * 다이어그램 서비스 - 다이어그램 저장/로드, 노드 실행 관리
 */

import { v4 as uuidv4 } from 'uuid';
import {
    DiagramData,
    DiagramNode,
    DiagramEdge,
    NodeExecutionResult,
    DiagramExecutionOptions,
    DiagramExecutionStatus,
} from '../../types';
import { convertDiagramV2ToLegacy, convertDiagramLegacyToV2 } from './DiagramV2Converter';
import { ISO7816Service } from './ISO7816Service';
import { NodeExecutor } from './NodeExecutor';

export class DiagramService {
    private currentDiagram: DiagramData | null = null;
    private executionStatus: DiagramExecutionStatus = DiagramExecutionStatus.IDLE;
    private iso7816Service: ISO7816Service;
    private nodeExecutor: NodeExecutor;

    constructor(
        iso7816Service: ISO7816Service = new ISO7816Service(),
        nodeExecutor?: NodeExecutor
    ) {
        this.iso7816Service = iso7816Service;
        this.nodeExecutor = nodeExecutor ?? new NodeExecutor(this.iso7816Service);
    }

    /**
     * 새 다이어그램 생성
     */
    createDiagram(name: string, description?: string): DiagramData {
        this.currentDiagram = {
            id: uuidv4(),
            name,
            description,
            nodes: [],
            edges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return this.currentDiagram;
    }

    /**
     * 다이어그램 로드
     */
    loadDiagram(diagramData: DiagramData): void {
        this.currentDiagram = {
            ...diagramData,
            createdAt: new Date(diagramData.createdAt),
            updatedAt: new Date(diagramData.updatedAt),
        };
    }

    /**
     * 다이어그램 저장 (JSON)
     */
    async saveDiagram(filePath: string): Promise<void> {
        if (!this.currentDiagram) {
            throw new Error('No diagram to save');
        }

        console.log('Saving diagram:', this.currentDiagram);
        console.log('Nodes count:', this.currentDiagram.nodes?.length);
        console.log('Edges count:', this.currentDiagram.edges?.length);

        const jsonData = JSON.stringify(convertDiagramLegacyToV2(this.currentDiagram), null, 2);
        console.log('JSON data length:', jsonData.length);
        console.log('JSON data preview:', jsonData.substring(0, 200));

        // Electron의 파일 시스템 API를 사용하여 저장
        if (window.electron?.ipcRenderer) {
            console.log('Calling IPC with filePath:', filePath, 'jsonData length:', jsonData.length);
            await window.electron.ipcRenderer.invoke('save-diagram', { filePath, jsonData });
        } else {
            // 브라우저 환경에서는 다운로드
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentDiagram.name}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * 다이어그램 불러오기 (JSON)
     */
    async loadDiagramFromFile(filePath: string): Promise<DiagramData> {
        let jsonData: string;

        // Electron의 파일 시스템 API를 사용하여 로드
        if (window.electron?.ipcRenderer) {
            jsonData = await window.electron.ipcRenderer.invoke('load-diagram', filePath);
        } else {
            throw new Error('File loading not supported in browser environment');
        }

        const parsed = JSON.parse(jsonData);
        const diagramData: DiagramData =
            parsed && parsed.schemaVersion === 2
                ? convertDiagramV2ToLegacy(parsed)
                : (parsed as DiagramData);
        this.loadDiagram(diagramData);
        return diagramData;
    }

    /**
     * 노드 추가
     */
    addNode(node: DiagramNode): void {
        if (!this.currentDiagram) {
            throw new Error('No active diagram');
        }
        this.currentDiagram.nodes.push(node);
        this.currentDiagram.updatedAt = new Date();
    }

    /**
     * 노드 제거
     */
    removeNode(nodeId: string): void {
        if (!this.currentDiagram) {
            throw new Error('No active diagram');
        }
        this.currentDiagram.nodes = this.currentDiagram.nodes.filter(n => n.id !== nodeId);
        // 관련 엣지도 제거
        this.currentDiagram.edges = this.currentDiagram.edges.filter(
            e => e.source !== nodeId && e.target !== nodeId
        );
        this.currentDiagram.updatedAt = new Date();
    }

    /**
     * 노드 업데이트
     */
    updateNode(nodeId: string, updates: Partial<DiagramNode>): void {
        if (!this.currentDiagram) {
            throw new Error('No active diagram');
        }
        const nodeIndex = this.currentDiagram.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) {
            throw new Error(`Node not found: ${nodeId}`);
        }
        this.currentDiagram.nodes[nodeIndex] = {
            ...this.currentDiagram.nodes[nodeIndex],
            ...updates,
        };
        this.currentDiagram.updatedAt = new Date();
    }

    /**
     * 엣지 추가
     */
    addEdge(edge: DiagramEdge): void {
        if (!this.currentDiagram) {
            throw new Error('No active diagram');
        }
        this.currentDiagram.edges.push(edge);
        this.currentDiagram.updatedAt = new Date();
    }

    /**
     * 엣지 제거
     */
    removeEdge(edgeId: string): void {
        if (!this.currentDiagram) {
            throw new Error('No active diagram');
        }
        this.currentDiagram.edges = this.currentDiagram.edges.filter(e => e.id !== edgeId);
        this.currentDiagram.updatedAt = new Date();
    }

    /**
     * 다이어그램 실행
     */
    async executeDiagram(
        options: DiagramExecutionOptions,
        onNodeResult?: (results: NodeExecutionResult[]) => void
    ): Promise<NodeExecutionResult[]> {
        if (!this.currentDiagram) {
            throw new Error('No active diagram');
        }

        this.executionStatus = DiagramExecutionStatus.RUNNING;
        const results: NodeExecutionResult[] = [];
        const previousNodes = new Map<string, DiagramNode>();
        const variables = new Map<string, string>();

        try {
            // 카드 연결을 한 번 보장해 APDU 실행 실패를 방지
            try {
                await this.iso7816Service.connectCard();
            } catch (error) {
                this.executionStatus = DiagramExecutionStatus.ERROR;
                throw new Error(`Failed to connect card before execution: ${(error as Error).message}`);
            }

            // 실행 순서 결정 (토폴로지 정렬)
            const executionOrder = this.getExecutionOrder();

            for (const nodeId of executionOrder) {
                const node = this.currentDiagram.nodes.find(n => n.id === nodeId);
                if (!node) continue;

                // Crypto 노드에서 pipeConfig가 비어 있고, 그래프 상 이전 노드가 있으면 자동으로 첫 번째 입력 엣지를 소스로 설정
                const nodeType = (node.data as any)?.type || node.type;
                if (
                    (nodeType === 'ENCRYPT_DATA' || nodeType === 'DECRYPT_DATA') &&
                    !node.data.pipeConfig
                ) {
                    const incoming = this.currentDiagram.edges.filter((e) => e.target === nodeId);
                    if (incoming.length > 0) {
                        node.data.pipeConfig = {
                            sourceNodeId: incoming[0].source,
                            dataOffset: 0,
                            dataLength: -1,
                        };
                    }
                }

                const startTime = Date.now();

                try {
                    // 노드 실행 (이전 노드 맵 전달)
                    const response = await this.nodeExecutor.executeNode(node, previousNodes, variables);
                    // APDU 명령 원본 저장 (NodeExecutor에서 처리된 파라미터 기반)
                    if ((node.data as any)?.lastCommandHex) {
                        (response as any).command = (node.data as any).lastCommandHex;
                    }

                    const responseSuccess =
                        (response as any)?.success !== undefined
                            ? Boolean((response as any).success)
                            : true;
                    const statusCode = (response as any)?.statusCode;
                    const isStatusOk = statusCode ? statusCode === '9000' : true;
                    const finalSuccess = responseSuccess && isStatusOk;
                    const errorMsg = finalSuccess ? undefined : `SW=${statusCode || 'UNKNOWN'}`;

                    // 노드 데이터 업데이트
                    node.data.response = response;
                    node.data.executed = finalSuccess;
                    node.data.error = errorMsg;

                    const result: NodeExecutionResult = {
                        nodeId,
                        success: finalSuccess,
                        error: errorMsg,
                        response,
                        executionTime: Date.now() - startTime,
                        variablesSnapshot: Object.fromEntries(variables),
                        outputData:
                            nodeType === 'ENCRYPT_DATA' || nodeType === 'DECRYPT_DATA' || nodeType === 'CONCAT_DATA'
                                ? (node.data.processedData || (node.data as any).cryptoMeta?.output || response?.data)
                                : response?.data,
                        nodeType: nodeType as any,
                        cryptoInput: (node.data as any).cryptoMeta?.input,
                        cryptoKey: (node.data as any).cryptoMeta?.key,
                        cryptoIv: (node.data as any).cryptoMeta?.iv,
                        cryptoOutput: (node.data as any).cryptoMeta?.output,
                    };

                    results.push(result);
                    if (onNodeResult) onNodeResult([...results]);

                    // 실행된 노드를 맵에 저장 (암복호화 파이프용)
                    previousNodes.set(nodeId, node);

                    // 지연 시간 적용
                    if (options.delay) {
                        await this.delay(options.delay);
                    }
                } catch (error) {
                    // 노드 에러 상태 업데이트
                    node.data.error = (error as Error).message;
                    node.data.executed = false;

                    const result: NodeExecutionResult = {
                        nodeId,
                        success: false,
                        error: (error as Error).message,
                        executionTime: Date.now() - startTime,
                        variablesSnapshot: Object.fromEntries(variables),
                        outputData: undefined,
                        nodeType: nodeType as any,
                    };

                    results.push(result);
                    if (onNodeResult) onNodeResult([...results]);

                    // 에러 시 중단 옵션
                    if (options.stopOnError) {
                        this.executionStatus = DiagramExecutionStatus.ERROR;
                        break;
                    }
                }
            }

            this.executionStatus = DiagramExecutionStatus.COMPLETED;
        } catch (error) {
            this.executionStatus = DiagramExecutionStatus.ERROR;
            throw error;
        }

        return results;
    }

    /**
     * 실행 순서 결정 (토폴로지 정렬)
     */
    private getExecutionOrder(): string[] {
        if (!this.currentDiagram) {
            return [];
        }

        const nodes = this.currentDiagram.nodes;
        const edges = this.currentDiagram.edges;
        const visited = new Set<string>();
        const order: string[] = [];

        // 진입 차수 계산
        const inDegree = new Map<string, number>();
        nodes.forEach(node => inDegree.set(node.id, 0));
        edges.forEach(edge => {
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        });

        // 진입 차수가 0인 노드부터 시작
        const queue: string[] = [];
        inDegree.forEach((degree, nodeId) => {
            if (degree === 0) {
                queue.push(nodeId);
            }
        });

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            order.push(nodeId);
            visited.add(nodeId);

            // 연결된 노드의 진입 차수 감소
            edges
                .filter(e => e.source === nodeId)
                .forEach(edge => {
                    const newDegree = (inDegree.get(edge.target) || 0) - 1;
                    inDegree.set(edge.target, newDegree);
                    if (newDegree === 0) {
                        queue.push(edge.target);
                    }
                });
        }

        return order;
    }

    /**
     * 현재 다이어그램 가져오기
     */
    getCurrentDiagram(): DiagramData | null {
        return this.currentDiagram;
    }

    /**
     * 실행 상태 가져오기
     */
    getExecutionStatus(): DiagramExecutionStatus {
        return this.executionStatus;
    }

    /**
     * 다이어그램 초기화
     */
    reset(): void {
        this.currentDiagram = null;
        this.executionStatus = DiagramExecutionStatus.IDLE;
    }

    /**
     * 지연 유틸리티
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
