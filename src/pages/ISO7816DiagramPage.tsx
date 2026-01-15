/**
 * ISO7816 Diagram Page
 * ISO7816 APDU 다이어그램 페이지
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge as addReactFlowEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Box,
    Grid,
    GridItem,
    useToast,
    Flex,
} from '@chakra-ui/react';
import {
    APDUNode,
    NodePalette,
    DiagramToolbar,
    NodeEditor,
    ExecutionResultPanel,
} from '../components/diagram';
import { useDiagramStore } from '../stores';
import { DiagramNodeType, DiagramNode, DiagramEdge } from '../types';

const nodeTypes = {
    apduNode: APDUNode,
    SELECT_AID: APDUNode,
    GET_CHALLENGE: APDUNode,
    INTERNAL_AUTH: APDUNode,
    EXTERNAL_AUTH: APDUNode,
    READ_RECORD: APDUNode,
    READ_BINARY: APDUNode,
    CUSTOM_APDU: APDUNode,
    ENCRYPT_DATA: APDUNode,
    DECRYPT_DATA: APDUNode,
    CONCAT_DATA: APDUNode,
};
const edgeOptions = {
    style: { strokeWidth: 2 },
};

let nodeId = 0;
const getId = () => `node_${nodeId++}`;
const makeEdgeId = () => `edge_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
const syncNodeIdCounter = (nodes: Node[]) => {
    const maxId = nodes.reduce((max, n) => {
        const match = String(n.id).match(/node_(\d+)/);
        if (match && match[1]) {
            const num = parseInt(match[1], 10);
            return isNaN(num) ? max : Math.max(max, num);
        }
        return max;
    }, -1);
    nodeId = maxId + 1;
};

const normalizeFlowNode = (node: Node): Node => {
    const dataType = (node.data as any)?.type ?? node.type;
    return {
        ...node,
        type: 'apduNode',
        data: {
            ...node.data,
            type: dataType,
        },
    };
};

const DiagramPageContent: React.FC = () => {
    const toast = useToast();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);

    const {
        currentDiagram,
        executionStatus,
        executionResults,
        createDiagram,
        loadDiagram,
        saveDiagram,
        clearDiagram,
        executeFlow,
        pauseExecution,
        stopExecution,
        updateNode,
        addNode,
        addEdge,
        removeNode,
        removeEdge,
        resetExecution,
        resetNodesStatus,
    } = useDiagramStore();

    const [nodes, setNodes,] = useNodesState([]);
    const [edges, setEdges,] = useEdgesState([]);

    // Initialize diagram on mount if not exists
    useEffect(() => {
        if (!currentDiagram) {
            createDiagram('New Diagram', 'APDU Command Sequence');
        }
        return () => {
            nodeId = 0;
        };
    }, []);

    const onConnect = useCallback(
        (params: Connection | Edge) => {
            const edge: Edge = {
                id: makeEdgeId(),
                source: (params as any).source,
                target: (params as any).target,
                type: 'default',
                deletable: true,
            };
            setEdges((eds) => addReactFlowEdge(edge, eds));
            if (edge.source && edge.target) {
                addEdge(edge as unknown as DiagramEdge);
            }
        },
        [setEdges, addEdge]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow') as DiagramNodeType;

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode: Node = {
                id: getId(),
                type: 'apduNode',
                position,
                data: {
                    label: type.replace(/_/g, ' '),
                    type,
                    executed: false,
                    parameters: [],
                },
            };

            let updatedNodes: Node[] = [];
            setNodes((nds) => {
                updatedNodes = nds.concat(newNode);
                return updatedNodes;
            });

            // Also add to DiagramService
            addNode(newNode as unknown as DiagramNode);

            // Auto-connect from a tail node (no outgoing edges) to the new node
            setEdges((eds) => {
                // tail 후보: 아웃고잉이 없고 새 노드가 아닌 기존 노드
                const tails = updatedNodes.filter(
                    (n) => n.id !== newNode.id && !eds.some((e) => e.source === n.id)
                );
                const tailNode = tails.length > 0 ? tails[tails.length - 1] : null;
                if (tailNode) {
                    const edge: Edge = {
                        id: makeEdgeId(),
                        source: tailNode.id,
                        target: newNode.id,
                        type: 'default',
                        deletable: true,
                    };
                    addEdge(edge as unknown as DiagramEdge);
                    return addReactFlowEdge(edge, eds);
                }
                return eds;
            });
        },
        [reactFlowInstance, setNodes, addNode, addEdge]
    );

    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds));

            changes.forEach((change) => {
                if (change.type === 'remove' && 'id' in change && change.id) {
                    removeNode(change.id);
                }
                if (change.type === 'position' && 'id' in change && change.id && change.position) {
                    updateNode(change.id, { position: change.position });
                }
            });
        },
        [setNodes, removeNode, updateNode]
    );

    const handleEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));

            changes.forEach((change) => {
                if (change.type === 'remove' && 'id' in change && change.id) {
                    removeEdge(change.id);
                }
            });
        },
        [setEdges, removeEdge]
    );

    const onNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            setSelectedNode(node as unknown as DiagramNode);
        },
        []
    );

    const handleNodeUpdate = useCallback(
        (nodeId: string, updates: Partial<DiagramNode>) => {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === nodeId
                        ? { ...node, data: { ...node.data, ...updates.data } }
                        : node
                )
            );
            updateNode(nodeId, updates);

            // Update selected node
            if (selectedNode && selectedNode.id === nodeId) {
                setSelectedNode({ ...selectedNode, ...updates } as DiagramNode);
            }
        },
        [setNodes, updateNode, selectedNode]
    );

    const handleNodeDelete = useCallback(
        (nodeId: string) => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
            removeNode(nodeId);
            setSelectedNode(null);
        },
        [setNodes, setEdges, removeNode]
    );

    const onDragStart = (event: React.DragEvent, nodeType: DiagramNodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleExecute = async () => {
        try {
            await executeFlow();
            toast({
                title: 'Execution Started',
                status: 'info',
                duration: 2000,
            });
        } catch (error: any) {
            toast({
                title: 'Execution Failed',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleSave = async () => {
        try {
            // Sync current ReactFlow state to DiagramService before saving
            if (currentDiagram) {
                const updatedDiagram = {
                    ...currentDiagram,
                    nodes: nodes as unknown as DiagramNode[],
                    edges: edges as unknown as DiagramEdge[],
                    updatedAt: new Date(),
                };

                // Update the store with synced data
                const { service } = useDiagramStore.getState();
                service.loadDiagram(updatedDiagram);
            }

            await saveDiagram();
            toast({
                title: 'Diagram Saved',
                status: 'success',
                duration: 2000,
            });
        } catch (error: any) {
            toast({
                title: 'Save Failed',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleLoad = async () => {
        try {
            await loadDiagram();
            const { currentDiagram: latestDiagram } = useDiagramStore.getState();
            if (latestDiagram) {
                // reset execution states on load
                const loadedNodes = (latestDiagram.nodes as Node[]).map((n) =>
                    normalizeFlowNode({
                        ...n,
                        data: {
                            ...n.data,
                            executed: false,
                            error: undefined,
                            response: undefined,
                        },
                    })
                );
                syncNodeIdCounter(loadedNodes);
                setNodes(loadedNodes);
                setEdges((latestDiagram.edges as Edge[]).map((e) => ({ deletable: true, ...e })));
                resetExecution();
                toast({
                    title: 'Diagram Loaded',
                    status: 'success',
                    duration: 2000,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Load Failed',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    // Reflect execution results on node status (for status icons)
    useEffect(() => {
        if (!executionResults || executionResults.length === 0) return;
        setNodes((nds) =>
            nds.map((node) => {
                const result = executionResults.find((r) => r.nodeId === node.id);
                if (!result) return node;
                const statusCode =
                    (result.response as any)?.statusCode || (result.response as any)?._statusCode;
                const responseSuccess =
                    result.response?.success !== undefined
                        ? Boolean(result.response?.success)
                        : true;
                const isErrorStatus = !!statusCode && String(statusCode).toUpperCase() !== '9000';
                const hasError = result.success === false || !responseSuccess || isErrorStatus;
                return {
                    ...node,
                    data: {
                        ...node.data,
                        executed: !hasError,
                        error: hasError ? (result.error || `SW=${statusCode || ''}`) : undefined,
                        response: result.response,
                        processedData: result.outputData,
                    },
                };
            })
        );
    }, [executionResults, setNodes]);

    const handleClear = () => {
        setNodes([]);
        setEdges([]);
        clearDiagram();
        resetExecution();
        nodeId = 0;
        toast({
            title: 'Diagram Cleared',
            status: 'info',
            duration: 2000,
        });
    };

    const handleNew = () => {
        handleClear();
    };

    const handleReset = () => {
        resetNodesStatus();
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    executed: false,
                    error: undefined,
                    response: undefined,
                    processedData: undefined,
                    cryptoMeta: undefined,
                },
            }))
        );
        toast({
            title: 'Execution Status Reset',
            status: 'info',
            duration: 2000,
        });
    };

    return (
        <Box h="calc(100vh - 80px)" display="flex" flexDirection="column">
            <DiagramToolbar
                onExecute={handleExecute}
                onPause={pauseExecution}
                onStop={stopExecution}
                onSave={handleSave}
                onLoad={handleLoad}
                onClear={handleClear}
                onNew={handleNew}
                onReset={handleReset}
                isExecuting={executionStatus === 'RUNNING'}
                isPaused={executionStatus === 'PAUSED'}
            />

            <Flex flex="1" mt={2} gap={2} minH="0">
                <Box w="240px" h="100%" overflowY="auto">
                    <NodePalette onDragStart={onDragStart} />
                </Box>

                <Flex direction="column" flex="1" gap={2} minH="0">
                    <Flex flex="1" minH="0" gap={2}>
                        <Box
                            ref={reactFlowWrapper}
                            flex="1"
                            minH="300px"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            bg="gray.50"
                            overflow="hidden"
                        >
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={handleNodesChange}
                                onEdgesChange={handleEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={onNodeClick}
                                onInit={setReactFlowInstance}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                nodeTypes={nodeTypes}
                                fitView
                                defaultEdgeOptions={edgeOptions}
                            >
                                <Background />
                                <Controls />
                                <MiniMap />
                            </ReactFlow>
                        </Box>

                        <Box w="320px" minW="300px" maxW="360px" h="100%" overflowY="auto">
                            <NodeEditor
                                node={selectedNode}
                                onUpdate={handleNodeUpdate}
                                onDelete={handleNodeDelete}
                                onClose={() => setSelectedNode(null)}
                                allNodes={nodes as unknown as DiagramNode[]}
                            />
                        </Box>
                    </Flex>

                    <Box h="220px" minH="200px" overflowY="auto">
                        <ExecutionResultPanel
                            results={executionResults}
                            totalNodes={nodes.length}
                            getNodeLabel={(nodeId) => {
                                const found = nodes.find((n) => n.id === nodeId);
                                return (found as any)?.data?.label;
                            }}
                        />
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
};

export const ISO7816DiagramPage: React.FC = () => {
    return (
        <ReactFlowProvider>
            <DiagramPageContent />
        </ReactFlowProvider>
    );
};
