/**
 * Custom APDU Node Component
 * React Flow용 커스텀 APDU 노드
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Text, Badge, VStack, HStack, Icon, Divider, Code } from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { DiagramNodeType } from '../../types';

interface APDUNodeData {
    label: string;
    type: DiagramNodeType;
    executed: boolean;
    error?: string;
    response?: any;
    processedData?: string;
}

export const APDUNode: React.FC<NodeProps<APDUNodeData>> = ({ data, selected }) => {
    const status = data.error
        ? { label: 'Error', color: 'red' }
        : data.executed
            ? { label: 'Success', color: 'green' }
            : { label: 'Pending', color: 'gray' };

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

    const responseStatus = (() => {
        const resp: any = data.response;
        if (!resp) return '';
        if (resp.statusCode) return String(resp.statusCode).toUpperCase();
        if (resp._statusCode) return String(resp._statusCode).toUpperCase();
        if (resp.sw1 !== undefined && resp.sw2 !== undefined) {
            const sw1 = Number(resp.sw1).toString(16).padStart(2, '0');
            const sw2 = Number(resp.sw2).toString(16).padStart(2, '0');
            return `${sw1}${sw2}`.toUpperCase();
        }
        if (resp._sw1 !== undefined && resp._sw2 !== undefined) {
            return `${resp._sw1}${resp._sw2}`.toUpperCase();
        }
        return '';
    })();

    const responseData = (() => {
        const resp: any = data.response;
        if (data.processedData) return data.processedData;
        if (!resp) return '';
        if (typeof resp === 'string') return resp;
        if (Array.isArray(resp.data)) return resp.data.join(' ');
        if (resp.data) return String(resp.data);
        if (resp._data) return String(resp._data);
        return '';
    })();

    return (
        <Box position="relative">
            <Handle type="target" position={Position.Top} />
            <HStack
                bg="white"
                border="1px solid"
                borderColor={selected ? 'blue.400' : 'gray.200'}
                borderRadius="lg"
                p={3}
                minW="220px"
                boxShadow={selected ? 'lg' : 'sm'}
                _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
                align="stretch"
                spacing={3}
            >
                <Box
                    w="6px"
                    borderRadius="full"
                    bg={`${getStatusColor()}.400`}
                    flexShrink={0}
                />
                <VStack align="stretch" spacing={2} w="100%">
                    <HStack justify="space-between">
                        <Badge colorScheme={getStatusColor()} fontSize="xs">
                            {data.type}
                        </Badge>
                        {getStatusIcon()}
                    </HStack>

                    <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                        {data.label}
                    </Text>

                    <HStack spacing={2}>
                        <Badge colorScheme={status.color} variant="solid" fontSize="xs">
                            {status.label}
                        </Badge>
                        {responseStatus && (
                            <Badge colorScheme="purple" variant="outline" fontSize="xs">
                                SW {responseStatus}
                            </Badge>
                        )}
                    </HStack>

                    <Divider />

                    <Box>
                        <Text fontSize="xs" color="gray.600">
                            Data
                        </Text>
                        <Code
                            fontSize="xs"
                            display="block"
                            p={1}
                            bg="gray.50"
                            whiteSpace="pre-wrap"
                            wordBreak="break-all"
                            noOfLines={2}
                        >
                            {responseData || '-'}
                        </Code>
                    </Box>

                    {data.error && (
                        <Text fontSize="xs" color="red.500" noOfLines={2}>
                            {data.error}
                        </Text>
                    )}
                </VStack>
            </HStack>
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};
