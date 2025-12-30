/**
 * Diagram Integration Test
 * 다이어그램 모듈 통합 테스트 - 임포트 및 타입 검증
 */

import { DiagramService, NodeExecutor } from '../core/services';
import { DiagramNodeType, CryptoAlgorithm } from '../types';

describe('Diagram Module Integration', () => {
    it('should import DiagramService correctly', () => {
        expect(DiagramService).toBeDefined();
        const service = new DiagramService();
        expect(service).toBeInstanceOf(DiagramService);
    });

    it('should create a new diagram', () => {
        const service = new DiagramService();
        const diagram = service.createDiagram('Test Diagram', 'Test Description');

        expect(diagram).toBeDefined();
        expect(diagram.name).toBe('Test Diagram');
        expect(diagram.description).toBe('Test Description');
        expect(diagram.nodes).toEqual([]);
        expect(diagram.edges).toEqual([]);
    });

    it('should add nodes to diagram', () => {
        const service = new DiagramService();
        service.createDiagram('Test Diagram');

        const node = {
            id: 'node-1',
            type: DiagramNodeType.SELECT_AID,
            position: { x: 100, y: 100 },
            data: {
                label: 'Select AID',
                parameters: [
                    { name: 'AID', value: 'A0000000031010', type: 'hex' as const },
                ],
                executed: false,
            },
        };

        service.addNode(node);
        const currentDiagram = service.getCurrentDiagram();

        expect(currentDiagram?.nodes.length).toBe(1);
        expect(currentDiagram?.nodes[0].id).toBe('node-1');
    });

    it('should validate crypto config', () => {
        const { validateCryptoConfig } = require('../Utils/CryptoUtils');

        const validConfig = {
            algorithm: CryptoAlgorithm.AES,
            key: '00112233445566778899AABBCCDDEEFF', // 16 bytes = 128 bits
        };

        const result = validateCryptoConfig(validConfig);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it('should detect invalid crypto config', () => {
        const { validateCryptoConfig } = require('../Utils/CryptoUtils');

        const invalidConfig = {
            algorithm: CryptoAlgorithm.AES,
            key: '0011', // Too short
        };

        const result = validateCryptoConfig(invalidConfig);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should export all diagram types correctly', () => {
        expect(DiagramNodeType.SELECT_AID).toBe('SELECT_AID');
        expect(DiagramNodeType.GET_CHALLENGE).toBe('GET_CHALLENGE');
        expect(DiagramNodeType.INTERNAL_AUTH).toBe('INTERNAL_AUTH');
        expect(DiagramNodeType.EXTERNAL_AUTH).toBe('EXTERNAL_AUTH');
        expect(DiagramNodeType.READ_RECORD).toBe('READ_RECORD');
        expect(DiagramNodeType.READ_BINARY).toBe('READ_BINARY');
        expect(DiagramNodeType.CUSTOM_APDU).toBe('CUSTOM_APDU');
    });

    it('should export all crypto algorithms correctly', () => {
        expect(CryptoAlgorithm.NONE).toBe('NONE');
        expect(CryptoAlgorithm.DES).toBe('DES');
        expect(CryptoAlgorithm.TRIPLE_DES).toBe('TRIPLE_DES');
        expect(CryptoAlgorithm.AES).toBe('AES');
        expect(CryptoAlgorithm.SEED).toBe('SEED');
    });
});
