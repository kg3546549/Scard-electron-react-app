/**
 * Custom APDU Node Component
 * React Flow용 커스텀 APDU 노드
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Text, Badge, VStack, HStack, Icon } from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { DiagramNodeType } from '../../types';

interface APDUNodeData {
    label: string;
    type: DiagramNodeType;
    executed: boolean;
    error?: string;
    response?: any;
}

export const APDUNode: React.FC<NodeProps<APDUNodeData>> = ({ data, selected }) => {
    const getStatusIcon = () => {
        if (data.error) {
            return <Icon as={FaTimesCircle} color="red.500" />;
        }
        if (data.executed) {
            return <Icon as={FaCheckCircle} color="green.500" />;
        }
        return <Icon as={FaClock} color="gray.400" />;
    };

    const getStatusColor = () => {
        if (data.error) return 'red';
        if (data.executed) return 'green';
        return 'gray';
    };

    return (
        <Box
            bg="white"
            border="2px solid"
            borderColor={selected ? 'blue.500' : 'gray.300'}
            borderRadius="md"
            p={3}
            minW="200px"
            boxShadow={selected ? 'lg' : 'md'}
            _hover={{ boxShadow: 'lg' }}
        >
            <Handle type="target" position={Position.Top} />

            <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                    <Badge colorScheme={getStatusColor()} fontSize="xs">
                        {data.type}
                    </Badge>
                    {getStatusIcon()}
                </HStack>

                <Text fontWeight="bold" fontSize="sm">
                    {data.label}
                </Text>

                {data.response && (
                    <Text fontSize="xs" color="gray.600" noOfLines={1}>
                        {(() => {
                            const resp: any = data.response;
                            if (typeof resp === 'string') return resp;
                            if (resp.statusCode) return resp.statusCode;
                            if (resp.sw1 !== undefined && resp.sw2 !== undefined) {
                                const sw1 = Number(resp.sw1).toString(16).padStart(2, '0');
                                const sw2 = Number(resp.sw2).toString(16).padStart(2, '0');
                                return `${sw1}${sw2}`.toUpperCase();
                            }
                            return '';
                        })()}
                    </Text>
                )}

                {data.error && (
                    <Text fontSize="xs" color="red.500" noOfLines={2}>
                        {data.error}
                    </Text>
                )}
            </VStack>

            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};
