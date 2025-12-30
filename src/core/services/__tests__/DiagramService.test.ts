import { DiagramService } from '../DiagramService';
import {
    DiagramExecutionStatus,
    DiagramNodeType,
    DiagramNode,
} from '../../../types';

describe('DiagramService', () => {
    test('connects card before executing nodes', async () => {
        const callOrder: string[] = [];

        const mockIso = {
            connectCard: jest.fn(async () => {
                callOrder.push('connect');
            }),
        };

        const mockNodeExecutor = {
            executeNode: jest.fn(async (_node: DiagramNode) => {
                callOrder.push('execute');
                return {
                    data: '',
                    sw1: '90',
                    sw2: '00',
                    statusCode: '9000',
                    success: true,
                };
            }),
        };

        const service = new DiagramService(mockIso as any, mockNodeExecutor as any);
        service.createDiagram('Test Diagram');

        service.addNode({
            id: 'node-1',
            type: DiagramNodeType.CUSTOM_APDU,
            position: { x: 0, y: 0 },
            data: {
                label: 'Test Node',
                parameters: [],
                executed: false,
            },
        });

        const results = await service.executeDiagram({ stopOnError: true, delay: 0 });

        expect(mockIso.connectCard).toHaveBeenCalledTimes(1);
        expect(mockNodeExecutor.executeNode).toHaveBeenCalledTimes(1);
        expect(callOrder[0]).toBe('connect');
        expect(callOrder[1]).toBe('execute');
        expect(results).toHaveLength(1);
        expect(service.getExecutionStatus()).toBe(DiagramExecutionStatus.COMPLETED);
    });
});
