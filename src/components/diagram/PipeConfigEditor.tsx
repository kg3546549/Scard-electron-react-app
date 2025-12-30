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
            [field]: value,
        };
        onChange(newConfig);
    };

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
                <FormLabel fontSize="sm">Data Offset (bytes)</FormLabel>
                <Input
                    size="sm"
                    type="number"
                    value={pipeConfig?.dataOffset || 0}
                    onChange={(e) => handleChange('dataOffset', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                    데이터 시작 위치 (0 = 처음부터)
                </Text>
            </FormControl>

            <FormControl>
                <FormLabel fontSize="sm">Data Length (bytes)</FormLabel>
                <Input
                    size="sm"
                    type="number"
                    value={pipeConfig?.dataLength || -1}
                    onChange={(e) => handleChange('dataLength', parseInt(e.target.value) || -1)}
                    placeholder="-1"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                    읽을 데이터 길이 (-1 = 전체)
                </Text>
            </FormControl>
        </VStack>
    );
};
