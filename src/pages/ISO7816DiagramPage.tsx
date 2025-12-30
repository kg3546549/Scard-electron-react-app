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
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Box,
    Grid,
    GridItem,
    useToast,
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
};

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

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
    } = useDiagramStore();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Initialize diagram on mount if not exists
    useEffect(() => {
        if (!currentDiagram) {
            createDiagram('New Diagram', 'APDU Command Sequence');
        }
    }, []);

    const onConnect = useCallback(
        (params: Connection | Edge) => {
            setEdges((eds) => addReactFlowEdge(params, eds));
            // Also add to DiagramService
            const newEdge = params as any;
            if (newEdge.source && newEdge.target) {
                addEdge({
                    id: `edge-${Date.now()}`,
                    source: newEdge.source,
                    target: newEdge.target,
                    type: 'default',
                });
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

            setNodes((nds) => nds.concat(newNode));

            // Also add to DiagramService
            addNode(newNode as unknown as DiagramNode);
        },
        [reactFlowInstance, setNodes, addNode]
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
            if (currentDiagram) {
                setNodes(currentDiagram.nodes as Node[]);
                setEdges(currentDiagram.edges as Edge[]);
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

    const handleClear = () => {
        setNodes([]);
        setEdges([]);
        clearDiagram();
        toast({
            title: 'Diagram Cleared',
            status: 'info',
            duration: 2000,
        });
    };

    const handleNew = () => {
        handleClear();
    };

    return (
        <Box h="calc(100vh - 100px)">
            <DiagramToolbar
                onExecute={handleExecute}
                onPause={pauseExecution}
                onStop={stopExecution}
                onSave={handleSave}
                onLoad={handleLoad}
                onClear={handleClear}
                onNew={handleNew}
                isExecuting={executionStatus === 'RUNNING'}
                isPaused={executionStatus === 'PAUSED'}
            />

            <Grid
                templateColumns="250px 1fr"
                templateRows="1fr 250px"
                h="calc(100% - 60px)"
                mt={2}
                gap={2}
            >
                <GridItem rowSpan={2}>
                    <NodePalette onDragStart={onDragStart} />
                </GridItem>

                <GridItem>
                    <Grid templateColumns="1fr 300px" h="100%" gap={2}>
                        <GridItem>
                            <Box
                                ref={reactFlowWrapper}
                                h="100%"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                bg="gray.50"
                            >
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    onNodeClick={onNodeClick}
                                    onInit={setReactFlowInstance}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    nodeTypes={nodeTypes}
                                    fitView
                                >
                                    <Background />
                                    <Controls />
                                    <MiniMap />
                                </ReactFlow>
                            </Box>
                        </GridItem>

                        <GridItem>
                            <NodeEditor
                                node={selectedNode}
                                onUpdate={handleNodeUpdate}
                                onClose={() => setSelectedNode(null)}
                                allNodes={nodes as unknown as DiagramNode[]}
                            />
                        </GridItem>
                    </Grid>
                </GridItem>

                <GridItem>
                    <ExecutionResultPanel results={executionResults} />
                </GridItem>
            </Grid>
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
