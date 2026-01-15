/**
 * Diagram Store
 * 다이어그램 상태 관리 - DiagramService와 연동
 */

import { create } from 'zustand';
import { DiagramService } from '../core/services';
import {
    DiagramData,
    DiagramNode,
    DiagramEdge,
    NodeExecutionResult,
    DiagramExecutionOptions,
    DiagramExecutionStatus,
} from '../types';

interface DiagramStore {
    // State
    currentDiagram: DiagramData | null;
    executionStatus: DiagramExecutionStatus;
    executionResults: NodeExecutionResult[];
    error: string | null;

    // Service instance
    service: DiagramService;

    // Actions
    createDiagram: (name: string, description?: string) => void;
    loadDiagram: (diagramData?: DiagramData) => Promise<void>;
    saveDiagram: (filePath?: string) => Promise<void>;
    loadDiagramFromFile: (filePath: string) => Promise<void>;
    addNode: (node: DiagramNode) => void;
    removeNode: (nodeId: string) => void;
    updateNode: (nodeId: string, updates: Partial<DiagramNode>) => void;
    addEdge: (edge: DiagramEdge) => void;
    removeEdge: (edgeId: string) => void;
    executeDiagram: (options: DiagramExecutionOptions) => Promise<void>;
    executeFlow: () => Promise<void>;
    pauseExecution: () => void;
    stopExecution: () => void;
    clearDiagram: () => void;
    resetExecution: () => void;
    resetNodesStatus: () => void;
    reset: () => void;
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
    // Initial State
    currentDiagram: null,
    executionStatus: DiagramExecutionStatus.IDLE,
    executionResults: [],
    error: null,

    // Service instance
    service: new DiagramService(),

    // Actions
    createDiagram: (name: string, description?: string) => {
        const { service } = get();
        const diagram = service.createDiagram(name, description);
        set({ currentDiagram: diagram, error: null });
    },

    loadDiagram: async (diagramData?: DiagramData) => {
        const { service } = get();
        try {
            if (diagramData) {
                service.loadDiagram(diagramData);
                set({ currentDiagram: diagramData, error: null });
            } else {
                // Open file dialog via Electron IPC
                if (!window.electron?.ipcRenderer) {
                    throw new Error('Electron IPC not available for loading diagram');
                }
                const result = await window.electron.ipcRenderer.invoke('dialog:openFile', {
                    filters: [{ name: 'Diagram Files', extensions: ['apdu'] }]
                });
                if (!result.canceled && result.filePaths.length > 0) {
                    const diagram = await service.loadDiagramFromFile(result.filePaths[0]);
                    set({ currentDiagram: diagram, error: null });
                }
            }
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    saveDiagram: async (filePath?: string) => {
        const { service } = get();
        try {
            if (filePath) {
                await service.saveDiagram(filePath);
            } else {
                // Open save dialog via Electron IPC
                if (!window.electron?.ipcRenderer) {
                    throw new Error('Electron IPC not available for saving diagram');
                }
                const result = await window.electron.ipcRenderer.invoke('dialog:saveFile', {
                    filters: [
                        { name: 'APDU Diagram', extensions: ['apdu'] },
                        { name: 'JSON Files', extensions: ['json'] }
                    ]
                });
                console.log('Save dialog result:', result);

                // Electron's showSaveDialog returns { canceled: boolean, filePath?: string }
                if (!result.canceled && result.filePath) {
                    console.log('Saving to:', result.filePath);
                    await service.saveDiagram(result.filePath);
                } else if (result.canceled) {
                    console.log('Save dialog was canceled');
                    return; // Don't throw error on cancel
                }
            }
            set({ error: null });
        } catch (error) {
            console.error('Save diagram error:', error);
            set({ error: (error as Error).message });
            throw error;
        }
    },

    loadDiagramFromFile: async (filePath: string) => {
        const { service } = get();
        try {
            const diagram = await service.loadDiagramFromFile(filePath);
            set({ currentDiagram: diagram, error: null });
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    addNode: (node: DiagramNode) => {
        const { service } = get();
        service.addNode(node);
        const currentDiagram = service.getCurrentDiagram();
        set({ currentDiagram, error: null });
    },

    removeNode: (nodeId: string) => {
        const { service } = get();
        service.removeNode(nodeId);
        const currentDiagram = service.getCurrentDiagram();
        set({ currentDiagram, error: null });
    },

    updateNode: (nodeId: string, updates: Partial<DiagramNode>) => {
        const { service } = get();
        service.updateNode(nodeId, updates);
        const currentDiagram = service.getCurrentDiagram();
        set({ currentDiagram, error: null });
    },

    addEdge: (edge: DiagramEdge) => {
        const { service } = get();
        service.addEdge(edge);
        const currentDiagram = service.getCurrentDiagram();
        set({ currentDiagram, error: null });
    },

    removeEdge: (edgeId: string) => {
        const { service } = get();
        service.removeEdge(edgeId);
        const currentDiagram = service.getCurrentDiagram();
        set({ currentDiagram, error: null });
    },

    executeDiagram: async (options: DiagramExecutionOptions) => {
        const { service, executionStatus } = get();

        // If paused, just resume
        if (executionStatus === DiagramExecutionStatus.PAUSED) {
            service.resumeExecution();
            set({ executionStatus: DiagramExecutionStatus.RUNNING });
            return;
        }

        set({ executionStatus: DiagramExecutionStatus.RUNNING, executionResults: [], error: null });

        try {
            const results = await service.executeDiagram(options, (liveResults) => {
                set({ executionResults: liveResults, executionStatus: DiagramExecutionStatus.RUNNING });
            });
            const finalStatus = service.getExecutionStatus();
            set({
                executionResults: results,
                executionStatus: finalStatus,
            });
        } catch (error) {
            set({
                executionStatus: DiagramExecutionStatus.ERROR,
                error: (error as Error).message,
            });
            throw error;
        }
    },

    executeFlow: async () => {
        const { executeDiagram } = get();
        await executeDiagram({ stopOnError: true, delay: 500 });
    },

    pauseExecution: () => {
        const { service } = get();
        service.pauseExecution();
        set({ executionStatus: DiagramExecutionStatus.PAUSED });
    },

    stopExecution: () => {
        const { service } = get();
        service.stopExecution();
        set({ executionStatus: DiagramExecutionStatus.IDLE });
    },

    clearDiagram: () => {
        const { service } = get();
        service.reset();
        const newDiagram = service.createDiagram('New Diagram', 'APDU Command Sequence');
        set({
            currentDiagram: newDiagram,
            executionStatus: DiagramExecutionStatus.IDLE,
            executionResults: [],
            error: null,
        });
    },

    resetExecution: () => {
        set({
            executionStatus: DiagramExecutionStatus.IDLE,
            executionResults: [],
            error: null,
        });
    },

    resetNodesStatus: () => {
        const { service } = get();
        service.resetNodesStatus();
        const currentDiagram = service.getCurrentDiagram();
        set({
            currentDiagram: currentDiagram ? { ...currentDiagram } : null,
            executionStatus: DiagramExecutionStatus.IDLE,
            executionResults: [],
            error: null,
        });
    },

    reset: () => {
        const { service } = get();
        service.reset();
        set({
            currentDiagram: null,
            executionStatus: DiagramExecutionStatus.IDLE,
            executionResults: [],
            error: null,
        });
    },
}));
