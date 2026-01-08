import { NodeExecutor } from '../NodeExecutor';
import { DiagramNode, DiagramNodeType, APDUResponse } from '../../../types';
import { encryptData } from '../../../Utils/CryptoUtils';

describe('NodeExecutor - variables and pipe', () => {
    const apduParams = [
        { name: 'CLA', value: '00', type: 'hex' as const },
        { name: 'INS', value: 'A4', type: 'hex' as const },
        { name: 'P1', value: '04', type: 'hex' as const },
        { name: 'P2', value: '00', type: 'hex' as const },
        { name: 'Data', value: '', type: 'hex' as const },
        { name: 'Le', value: '00', type: 'hex' as const },
    ];

    test('saves response slice into variable', async () => {
        const mockIso = {
            sendQuickCommand: jest.fn(async () => ({
                data: 'A1A2A3A4A5A6A7A89000',
                sw1: '90',
                sw2: '00',
                statusCode: '9000',
                success: true,
            } as unknown as APDUResponse)),
        } as any;

        const executor = new NodeExecutor(mockIso);
        const variables = new Map<string, string>();

        const node: DiagramNode = {
            id: 'node-1',
            type: DiagramNodeType.CUSTOM_APDU,
            position: { x: 0, y: 0 },
            data: {
                label: 'Select',
                parameters: apduParams,
                executed: false,
                variableConfig: {
                    save: [
                        { name: 'sess', source: 'response', dataOffset: 0, dataLength: 8 },
                    ],
                },
            },
        };

        await executor.executeNode(node, new Map(), variables);

        expect(mockIso.sendQuickCommand).toHaveBeenCalledTimes(1);
        expect(variables.get('sess')).toBe('A1A2A3A4A5A6A7A8');
    });

    test('uses variable for crypto data/key/iv and saves processedData', async () => {
        const mockIso = {
            sendQuickCommand: jest.fn(),
        } as any;
        const executor = new NodeExecutor(mockIso);
        const variables = new Map<string, string>();

        variables.set('inputData', '0011223344556677');
        variables.set('desKey', '133457799BBCDFF1'); // 8 bytes
        variables.set('desIv', '0000000000000000');  // 8 bytes IV for DES

        const node: DiagramNode = {
            id: 'node-crypto',
            type: DiagramNodeType.ENCRYPT_DATA,
            position: { x: 0, y: 0 },
            data: {
                label: 'Encrypt',
                parameters: [],
                executed: false,
                cryptoConfig: {
                    algorithm: 'DES' as any,
                    key: 'FFFFFFFFFFFFFFFF',
                    iv: '0000000000000000',
                },
                variableConfig: {
                    use: {
                        dataVar: 'inputData',
                        keyVar: 'desKey',
                        ivVar: 'desIv',
                    },
                    save: [
                        { name: 'encData', source: 'processedData', dataOffset: 0, dataLength: -1 },
                    ],
                },
            },
        };

        const expected = await encryptData(variables.get('inputData')!, {
            algorithm: 'DES' as any,
            key: variables.get('desKey')!,
            iv: variables.get('desIv')!,
        });

        const resp = await executor.executeNode(node, new Map(), variables);

        expect(resp.data).toBe(expected);
        expect(variables.get('encData')).toBe(expected);
    });
});
