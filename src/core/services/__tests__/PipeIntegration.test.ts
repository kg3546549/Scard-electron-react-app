/**
 * Pipe Integration Tests
 * 암복호화 노드 파이프 기능 통합 테스트
 */

import { NodeExecutor } from '../NodeExecutor';
import { ISO7816Service } from '../ISO7816Service';
import { DiagramNodeType, CryptoAlgorithm } from '../../../types';

// Mock ISO7816Service
jest.mock('../ISO7816Service');

describe('Pipe Integration Tests', () => {
    let nodeExecutor: NodeExecutor;
    let mockISO7816Service: jest.Mocked<ISO7816Service>;

    beforeEach(() => {
        mockISO7816Service = new ISO7816Service() as jest.Mocked<ISO7816Service>;
        nodeExecutor = new NodeExecutor(mockISO7816Service);
    });

    describe('ENCRYPT_DATA Node', () => {
        it('should encrypt data from piped source node', async () => {
            // Source node (GET_CHALLENGE)
            const sourceNode = {
                id: 'source-1',
                type: DiagramNodeType.GET_CHALLENGE,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Get Challenge',
                    parameters: [],
                    executed: true,
                    response: {
                        data: '0123456789ABCDEF',
                        sw1: '90',
                        sw2: '00',
                        statusCode: '9000',
                        success: true,
                    },
                },
            };

            // Encrypt node
            const encryptNode = {
                id: 'encrypt-1',
                type: DiagramNodeType.ENCRYPT_DATA,
                position: { x: 200, y: 0 },
                data: {
                    label: 'Encrypt Data',
                    parameters: [],
                    executed: false,
                    cryptoConfig: {
                        algorithm: CryptoAlgorithm.AES,
                        key: '0123456789ABCDEF0123456789ABCDEF',
                        iv: '0123456789ABCDEF0123456789ABCDEF',
                    },
                    pipeConfig: {
                        sourceNodeId: 'source-1',
                        dataOffset: 0,
                        dataLength: -1, // All data
                    },
                },
            };

            const previousNodes = new Map();
            previousNodes.set('source-1', sourceNode);

            const response = await nodeExecutor.executeNode(encryptNode, previousNodes);

            expect(response.success).toBe(true);
            expect(response.statusCode).toBe('9000');
            expect(encryptNode.data.processedData).toBeDefined();
        });

        it('should extract data with offset from piped source', async () => {
            const sourceNode = {
                id: 'source-1',
                type: DiagramNodeType.GET_CHALLENGE,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Get Challenge',
                    parameters: [],
                    executed: true,
                    response: {
                        data: '0123456789ABCDEF',
                        sw1: '90',
                        sw2: '00',
                        statusCode: '9000',
                        success: true,
                    },
                },
            };

            const encryptNode = {
                id: 'encrypt-1',
                type: DiagramNodeType.ENCRYPT_DATA,
                position: { x: 200, y: 0 },
                data: {
                    label: 'Encrypt Data',
                    parameters: [],
                    executed: false,
                    cryptoConfig: {
                        algorithm: CryptoAlgorithm.AES,
                        key: '0123456789ABCDEF0123456789ABCDEF',
                        iv: '0123456789ABCDEF0123456789ABCDEF',
                    },
                    pipeConfig: {
                        sourceNodeId: 'source-1',
                        dataOffset: 2, // Skip first 2 bytes (4 hex chars)
                        dataLength: 4, // Take 4 bytes (8 hex chars)
                    },
                },
            };

            const previousNodes = new Map();
            previousNodes.set('source-1', sourceNode);

            const response = await nodeExecutor.executeNode(encryptNode, previousNodes);

            expect(response.success).toBe(true);
            // Should have encrypted '456789AB' (offset=2 bytes, length=4 bytes)
        });

        it('should throw error when source node is missing', async () => {
            const encryptNode = {
                id: 'encrypt-1',
                type: DiagramNodeType.ENCRYPT_DATA,
                position: { x: 200, y: 0 },
                data: {
                    label: 'Encrypt Data',
                    parameters: [],
                    executed: false,
                    cryptoConfig: {
                        algorithm: CryptoAlgorithm.AES,
                        key: '0123456789ABCDEF0123456789ABCDEF',
                    },
                    pipeConfig: {
                        sourceNodeId: 'non-existent',
                        dataOffset: 0,
                        dataLength: -1,
                    },
                },
            };

            const previousNodes = new Map();

            await expect(
                nodeExecutor.executeNode(encryptNode, previousNodes)
            ).rejects.toThrow();
        });

        it('should throw error when pipe config is missing', async () => {
            const encryptNode = {
                id: 'encrypt-1',
                type: DiagramNodeType.ENCRYPT_DATA,
                position: { x: 200, y: 0 },
                data: {
                    label: 'Encrypt Data',
                    parameters: [],
                    executed: false,
                    cryptoConfig: {
                        algorithm: CryptoAlgorithm.AES,
                        key: '0123456789ABCDEF0123456789ABCDEF',
                    },
                    // Missing pipeConfig
                },
            };

            const previousNodes = new Map();

            await expect(
                nodeExecutor.executeNode(encryptNode, previousNodes)
            ).rejects.toThrow();
        });
    });

    describe('DECRYPT_DATA Node', () => {
        it('should decrypt data from piped source node', async () => {
            const sourceNode = {
                id: 'encrypt-1',
                type: DiagramNodeType.ENCRYPT_DATA,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Encrypt Data',
                    parameters: [],
                    executed: true,
                    processedData: 'ENCRYPTED_HEX_DATA',
                },
            };

            const decryptNode = {
                id: 'decrypt-1',
                type: DiagramNodeType.DECRYPT_DATA,
                position: { x: 200, y: 0 },
                data: {
                    label: 'Decrypt Data',
                    parameters: [],
                    executed: false,
                    cryptoConfig: {
                        algorithm: CryptoAlgorithm.AES,
                        key: '0123456789ABCDEF0123456789ABCDEF',
                        iv: '0123456789ABCDEF0123456789ABCDEF',
                    },
                    pipeConfig: {
                        sourceNodeId: 'encrypt-1',
                        dataOffset: 0,
                        dataLength: -1,
                    },
                },
            };

            const previousNodes = new Map();
            previousNodes.set('encrypt-1', sourceNode);

            const response = await nodeExecutor.executeNode(decryptNode, previousNodes);

            expect(response.success).toBe(true);
            expect(response.statusCode).toBe('9000');
            expect(decryptNode.data.processedData).toBeDefined();
        });
    });

    describe('Pipe Chain', () => {
        it('should support multi-node pipe chain', async () => {
            // Node 1: GET_CHALLENGE
            const challengeNode = {
                id: 'node-1',
                type: DiagramNodeType.GET_CHALLENGE,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Get Challenge',
                    parameters: [],
                    executed: true,
                    response: {
                        data: '0123456789ABCDEF',
                        sw1: '90',
                        sw2: '00',
                        statusCode: '9000',
                        success: true,
                    },
                },
            };

            // Node 2: ENCRYPT_DATA (pipes from node-1)
            const encryptNode = {
                id: 'node-2',
                type: DiagramNodeType.ENCRYPT_DATA,
                position: { x: 200, y: 0 },
                data: {
                    label: 'Encrypt Challenge',
                    parameters: [],
                    executed: false,
                    cryptoConfig: {
                        algorithm: CryptoAlgorithm.AES,
                        key: '0123456789ABCDEF0123456789ABCDEF',
                    },
                    pipeConfig: {
                        sourceNodeId: 'node-1',
                        dataOffset: 0,
                        dataLength: -1,
                    },
                },
            };

            const previousNodes = new Map();
            previousNodes.set('node-1', challengeNode);

            // Execute encrypt node
            const encryptResponse = await nodeExecutor.executeNode(encryptNode, previousNodes);
            expect(encryptResponse.success).toBe(true);

            // Update map with executed encrypt node
            encryptNode.data.executed = true;
            previousNodes.set('node-2', encryptNode);

            // Node 3: EXTERNAL_AUTH (pipes encrypted data from node-2)
            mockISO7816Service.sendQuickCommand = jest.fn().mockResolvedValue({
                data: '',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            });

            const authNode = {
                id: 'node-3',
                type: DiagramNodeType.EXTERNAL_AUTH,
                position: { x: 400, y: 0 },
                data: {
                    label: 'Send Encrypted Data',
                    parameters: [
                        { name: 'Data', value: '', type: 'hex' as const },
                    ],
                    executed: false,
                    pipeConfig: {
                        sourceNodeId: 'node-2',
                        dataOffset: 0,
                        dataLength: -1,
                    },
                },
            };

            const authResponse = await nodeExecutor.executeNode(authNode, previousNodes);
            expect(authResponse.success).toBe(true);
        });
    });

    describe('Crypto Config Validation', () => {
        it('should validate crypto config for ENCRYPT_DATA', async () => {
            const sourceNode = {
                id: 'source-1',
                type: DiagramNodeType.GET_CHALLENGE,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Get Challenge',
                    parameters: [],
                    executed: true,
                    response: {
                        data: '0123456789ABCDEF',
                        sw1: '90',
                        sw2: '00',
                        statusCode: '9000',
                        success: true,
                    },
                },
            };

            const encryptNode = {
                id: 'encrypt-1',
                type: DiagramNodeType.ENCRYPT_DATA,
                position: { x: 200, y: 0 },
                data: {
                    label: 'Encrypt Data',
                    parameters: [],
                    executed: false,
                    cryptoConfig: {
                        algorithm: CryptoAlgorithm.AES,
                        key: 'INVALID', // Invalid key length
                    },
                    pipeConfig: {
                        sourceNodeId: 'source-1',
                        dataOffset: 0,
                        dataLength: -1,
                    },
                },
            };

            const previousNodes = new Map();
            previousNodes.set('source-1', sourceNode);

            await expect(
                nodeExecutor.executeNode(encryptNode, previousNodes)
            ).rejects.toThrow();
        });
    });
});
