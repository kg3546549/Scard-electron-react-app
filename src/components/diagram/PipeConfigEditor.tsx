/**
 * Pipe Config Editor Component
 * 파이프 설정 편집 컴포넌트 (암복호화 노드용)
 */

import React from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Text,
    Box,
    Button,
} from '@chakra-ui/react';
import { PipeConfig } from '../../types';

interface PipeConfigEditorProps {
    pipeConfig: PipeConfig | undefined;
    availableNodes: Array<{ id: string; label: string }>;
    onChange: (config: PipeConfig) => void;
}

export const PipeConfigEditor: React.FC<PipeConfigEditorProps> = ({
    pipeConfig,
    availableNodes,
    onChange,
}) => {
    const handleChange = (field: keyof PipeConfig, value: string | number) => {
        const newConfig: PipeConfig = {
            sourceNodeId: pipeConfig?.sourceNodeId || '',
            dataOffset: pipeConfig?.dataOffset || 0,
            dataLength: pipeConfig?.dataLength || -1,
            segments: pipeConfig?.segments,
            priority: pipeConfig?.priority || 'pipe',
            [field]: value,
        };
        onChange(newConfig);
    };

    const handleSegmentChange = (index: number, field: 'dataOffset' | 'dataLength', value: number) => {
        const segments = pipeConfig?.segments ? [...pipeConfig.segments] : [];
        segments[index] = {
            dataOffset: segments[index]?.dataOffset ?? 0,
            dataLength: segments[index]?.dataLength ?? -1,
            [field]: value,
        };
        const newConfig: PipeConfig = {
            sourceNodeId: pipeConfig?.sourceNodeId || '',
            dataOffset: segments[0]?.dataOffset ?? pipeConfig?.dataOffset ?? 0,
            dataLength: segments[0]?.dataLength ?? pipeConfig?.dataLength ?? -1,
            segments,
            priority: pipeConfig?.priority || 'pipe',
        };
        onChange(newConfig);
    };

    const addSegment = () => {
        const segments = pipeConfig?.segments ? [...pipeConfig.segments] : [];
        segments.push({ dataOffset: 0, dataLength: -1 });
        const newConfig: PipeConfig = {
            sourceNodeId: pipeConfig?.sourceNodeId || '',
            dataOffset: segments[0]?.dataOffset ?? 0,
            dataLength: segments[0]?.dataLength ?? -1,
            segments,
        };
        onChange(newConfig);
    };

    const removeSegment = (index: number) => {
        const segments = pipeConfig?.segments ? [...pipeConfig.segments] : [];
            segments.splice(index, 1);
            const newConfig: PipeConfig = {
                sourceNodeId: pipeConfig?.sourceNodeId || '',
                dataOffset: segments[0]?.dataOffset ?? 0,
                dataLength: segments[0]?.dataLength ?? -1,
                segments: segments.length > 0 ? segments : undefined,
                priority: pipeConfig?.priority || 'pipe',
            };
            onChange(newConfig);
        };

    const segments = pipeConfig?.segments || [{ dataOffset: pipeConfig?.dataOffset || 0, dataLength: pipeConfig?.dataLength ?? -1 }];

    return (
        <VStack spacing={3} align="stretch">
            <Box>
                <Text fontWeight="bold" fontSize="sm" mb={2}>
                    Pipe Configuration
                </Text>
                <Text fontSize="xs" color="gray.600" mb={3}>
                    암복호화할 데이터를 이전 노드에서 가져옵니다
                </Text>
            </Box>

            <FormControl>
                <FormLabel fontSize="sm">Source Node</FormLabel>
                <Select
                    size="sm"
                    value={pipeConfig?.sourceNodeId || ''}
                    onChange={(e) => handleChange('sourceNodeId', e.target.value)}
                    placeholder="Select source node"
                >
                    {availableNodes.map((node) => (
                        <option key={node.id} value={node.id}>
                            {node.label} ({node.id.slice(0, 8)})
                        </option>
                    ))}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel fontSize="sm">Source Priority</FormLabel>
                <Select
                    size="sm"
                    value={pipeConfig?.priority || 'pipe'}
                    onChange={(e) => handleChange('priority', e.target.value as any)}
                >
                    <option value="pipe">Pipe first</option>
                    <option value="variable">Variable first</option>
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                    pipe = slices from source node, variable = use bound variable before pipe
                </Text>
            </FormControl>

            {/* Multi-segment support */}
            <Box>
                <Text fontSize="xs" color="gray.600" mb={2}>
                    Add multiple segments to concatenate slices from the source.
                </Text>
                <VStack spacing={2} align="stretch">
                    {segments.map((seg, idx) => (
                        <Box key={idx} p={2} borderWidth="1px" borderRadius="md" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" mb={1}>
                                Segment {idx + 1}
                            </Text>
                            <FormControl>
                                <FormLabel fontSize="xs">Offset (bytes)</FormLabel>
                                <Input
                                    size="sm"
                                    type="number"
                                    value={seg.dataOffset}
                                    onChange={(e) => handleSegmentChange(idx, 'dataOffset', parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormControl mt={2}>
                                <FormLabel fontSize="xs">Length (bytes)</FormLabel>
                                <Input
                                    size="sm"
                                    type="number"
                                    value={seg.dataLength}
                                    onChange={(e) => handleSegmentChange(idx, 'dataLength', parseInt(e.target.value) || -1)}
                                />
                            </FormControl>
                            <Button size="xs" mt={2} colorScheme="red" variant="outline" onClick={() => removeSegment(idx)}>
                                Remove Segment
                            </Button>
                        </Box>
                    ))}
                    <Button size="xs" colorScheme="blue" variant="outline" onClick={addSegment}>
                        Add Segment
                    </Button>
                </VStack>
            </Box>
        </VStack>
    );
};
