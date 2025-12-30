/**
 * NodeExecutor Unit Tests
 * NodeExecutor 단위 테스트
 */

import { NodeExecutor } from '../NodeExecutor';
import { ISO7816Service } from '../ISO7816Service';
import { DiagramNodeType, CryptoAlgorithm } from '../../../types';

// Mock ISO7816Service
jest.mock('../ISO7816Service');

describe('NodeExecutor', () => {
    let nodeExecutor: NodeExecutor;
    let mockISO7816Service: jest.Mocked<ISO7816Service>;

    beforeEach(() => {
        mockISO7816Service = new ISO7816Service() as jest.Mocked<ISO7816Service>;
        nodeExecutor = new NodeExecutor(mockISO7816Service);
    });

    describe('SELECT_AID Node', () => {
        it('should execute SELECT_AID with valid AID', async () => {
            const mockResponse = {
                data: '',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            };

            mockISO7816Service.selectAID = jest.fn().mockResolvedValue(mockResponse);

            const node = {
                id: 'node-1',
                type: DiagramNodeType.SELECT_AID,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Select AID',
                    parameters: [
                        { name: 'AID', value: 'A0000000031010', type: 'hex' as const },
                    ],
                    executed: false,
                },
            };

            const response = await nodeExecutor.executeNode(node);

            expect(mockISO7816Service.selectAID).toHaveBeenCalledWith('A0000000031010');
            expect(response.success).toBe(true);
            expect(response.statusCode).toBe('9000');
        });

        it('should throw error when AID parameter is missing', async () => {
            const node = {
                id: 'node-1',
                type: DiagramNodeType.SELECT_AID,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Select AID',
                    parameters: [],
                    executed: false,
                },
            };

            await expect(nodeExecutor.executeNode(node)).rejects.toThrow(
                'AID parameter is required'
            );
        });
    });

    describe('GET_CHALLENGE Node', () => {
        it('should execute GET_CHALLENGE with default length', async () => {
            const mockResponse = {
                data: '0123456789ABCDEF',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            };

            mockISO7816Service.getChallenge = jest.fn().mockResolvedValue(mockResponse);

            const node = {
                id: 'node-2',
                type: DiagramNodeType.GET_CHALLENGE,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Get Challenge',
                    parameters: [],
                    executed: false,
                },
            };

            const response = await nodeExecutor.executeNode(node);

            expect(mockISO7816Service.getChallenge).toHaveBeenCalledWith(8);
            expect(response.success).toBe(true);
        });

        it('should execute GET_CHALLENGE with custom length', async () => {
            const mockResponse = {
                data: '0123456789ABCDEF0123456789ABCDEF',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            };

            mockISO7816Service.getChallenge = jest.fn().mockResolvedValue(mockResponse);

            const node = {
                id: 'node-2',
                type: DiagramNodeType.GET_CHALLENGE,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Get Challenge',
                    parameters: [
                        { name: 'Length', value: '10', type: 'hex' as const },
                    ],
                    executed: false,
                },
            };

            const response = await nodeExecutor.executeNode(node);

            expect(mockISO7816Service.getChallenge).toHaveBeenCalledWith(16);
            expect(response.success).toBe(true);
        });
    });

    describe('CUSTOM_APDU Node', () => {
        it('should execute CUSTOM_APDU with all parameters', async () => {
            const mockResponse = {
                data: 'RESPONSE_DATA',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            };

            mockISO7816Service.sendQuickCommand = jest.fn().mockResolvedValue(mockResponse);

            const node = {
                id: 'node-3',
                type: DiagramNodeType.CUSTOM_APDU,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Custom APDU',
                    parameters: [
                        { name: 'CLA', value: '00', type: 'hex' as const },
                        { name: 'INS', value: 'A4', type: 'hex' as const },
                        { name: 'P1', value: '04', type: 'hex' as const },
                        { name: 'P2', value: '00', type: 'hex' as const },
                        { name: 'Data', value: 'A0000000031010', type: 'hex' as const },
                        { name: 'Le', value: '00', type: 'hex' as const },
                    ],
                    executed: false,
                },
            };

            const response = await nodeExecutor.executeNode(node);

            expect(mockISO7816Service.sendQuickCommand).toHaveBeenCalled();
            expect(response.success).toBe(true);
        });

        it('should throw error when required parameters are missing', async () => {
            const node = {
                id: 'node-3',
                type: DiagramNodeType.CUSTOM_APDU,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Custom APDU',
                    parameters: [
                        { name: 'CLA', value: '00', type: 'hex' as const },
                    ],
                    executed: false,
                },
            };

            await expect(nodeExecutor.executeNode(node)).rejects.toThrow(
                'CLA, INS, P1, P2 parameters are required'
            );
        });
    });

    describe('READ_RECORD Node', () => {
        it('should execute READ_RECORD with default values', async () => {
            const mockResponse = {
                data: 'RECORD_DATA',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            };

            mockISO7816Service.readRecord = jest.fn().mockResolvedValue(mockResponse);

            const node = {
                id: 'node-4',
                type: DiagramNodeType.READ_RECORD,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Read Record',
                    parameters: [],
                    executed: false,
                },
            };

            const response = await nodeExecutor.executeNode(node);

            expect(mockISO7816Service.readRecord).toHaveBeenCalledWith(1, 0);
            expect(response.success).toBe(true);
        });
    });

    describe('READ_BINARY Node', () => {
        it('should execute READ_BINARY with parameters', async () => {
            const mockResponse = {
                data: 'BINARY_DATA',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            };

            mockISO7816Service.readBinary = jest.fn().mockResolvedValue(mockResponse);

            const node = {
                id: 'node-5',
                type: DiagramNodeType.READ_BINARY,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Read Binary',
                    parameters: [
                        { name: 'Offset', value: '0010', type: 'hex' as const },
                        { name: 'Length', value: '20', type: 'hex' as const },
                    ],
                    executed: false,
                },
            };

            const response = await nodeExecutor.executeNode(node);

            expect(mockISO7816Service.readBinary).toHaveBeenCalledWith(16, 32);
            expect(response.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should throw error for unknown node type', async () => {
            const node = {
                id: 'node-unknown',
                type: 'UNKNOWN_TYPE' as any,
                position: { x: 0, y: 0 },
                data: {
                    label: 'Unknown',
                    parameters: [],
                    executed: false,
                },
            };

            await expect(nodeExecutor.executeNode(node)).rejects.toThrow(
                'Unknown node type'
            );
        });
    });
});
