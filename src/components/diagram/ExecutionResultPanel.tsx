/**
 * Execution Result Panel Component
 * 다이어그램 실행 결과 표시 패널
 */

import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    Badge,
    Divider,
    Table,
    Tbody,
    Tr,
    Td,
    Code,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';
import { NodeExecutionResult } from '../../types';
import { APDUCommand } from '../../types/apdu.types';

interface ExecutionResultPanelProps {
    results: NodeExecutionResult[];
    getNodeLabel?: (nodeId: string) => string | undefined;
}

export const ExecutionResultPanel: React.FC<ExecutionResultPanelProps> = ({ results, getNodeLabel }) => {
    if (results.length === 0) {
        return (
            <Card h="100%">
                <CardBody>
                    <Text color="gray.500">No execution results yet</Text>
                </CardBody>
            </Card>
        );
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    return (
        <Card h="100%" overflowY="auto">
            <CardHeader>
                <VStack align="stretch" spacing={2}>
                    <Heading size="sm">Execution Results</Heading>
                    <HStack spacing={2}>
                        <Badge colorScheme="green">Success: {successCount}</Badge>
                        <Badge colorScheme="red">Error: {errorCount}</Badge>
                        <Badge colorScheme="blue">Total: {results.length}</Badge>
                        <Badge colorScheme="purple">Time: {totalTime}ms</Badge>
                    </HStack>
                </VStack>
            </CardHeader>

            <CardBody>
                <Accordion allowMultiple>
                    {results.map((result, index) => (
                        <AccordionItem key={result.nodeId}>
                            <AccordionButton>
                                <HStack flex="1" justify="space-between">
                                    <HStack>
                                        <Badge colorScheme={result.success ? 'green' : 'red'}>
                                            {index + 1}
                                        </Badge>
                                        <Text fontSize="sm" fontWeight="bold">
                                            {getNodeLabel?.(result.nodeId) || `Node ${result.nodeId.slice(0, 8)}`}
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <Badge fontSize="xs">{result.executionTime}ms</Badge>
                                        {result.success && result.response && (
                                            <Badge colorScheme="green" fontSize="xs">
                                                {result.response.sw1}
                                                {result.response.sw2}
                                            </Badge>
                                        )}
                                    </HStack>
                                </HStack>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack align="stretch" spacing={3}>
                                    {/* Success/Error */}
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" mb={1}>
                                            Status
                                        </Text>
                                        <Badge colorScheme={result.success ? 'green' : 'red'}>
                                            {result.success ? 'Success' : 'Error'}
                                        </Badge>
                                    </Box>

                                    {/* Error Message */}
                                    {result.error && (
                                        <Box>
                                            <Text fontSize="xs" fontWeight="bold" mb={1}>
                                                Error
                                            </Text>
                                            <Code
                                                p={2}
                                                colorScheme="red"
                                                fontSize="xs"
                                                w="100%"
                                                display="block"
                                            >
                                                {result.error}
                                            </Code>
                                        </Box>
                                    )}

                                    {/* Response */}
                                    {result.response && (
                                        <>
                                            <Divider />
                                            <Box>
                                                <Text fontSize="xs" fontWeight="bold" mb={2}>
                                                    Response
                                                </Text>
                                                <Table size="sm" variant="simple">
                                                    <Tbody>
                                                        <Tr>
                                                            <Td fontSize="xs" fontWeight="bold" w="80px">
                                                                SW1-SW2
                                                            </Td>
                                                            <Td fontSize="xs">
                                                                <Code>
                                                                    {result.response.sw1} {result.response.sw2}
                                                                </Code>
                                                            </Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td fontSize="xs" fontWeight="bold">
                                                                Status
                                                            </Td>
                                                            <Td fontSize="xs">
                                                                <Code>
                                                                    {result.response.statusCode}
                                                                </Code>
                                                            </Td>
                                                        </Tr>
                                                        {(result.response as any)?.command && (
                                                            <Tr>
                                                                <Td fontSize="xs" fontWeight="bold">
                                                                    Command
                                                                </Td>
                                                                <Td fontSize="xs">
                                                                    <Code
                                                                        display="block"
                                                                        whiteSpace="pre-wrap"
                                                                        wordBreak="break-all"
                                                                    >
                                                                        {Array.isArray((result.response as any).command)
                                                                            ? (result.response as any).command.join(' ')
                                                                            : (result.response as any).command}
                                                                    </Code>
                                                                </Td>
                                                            </Tr>
                                                        )}
                                                        {result.response.data && (
                                                            <Tr>
                                                                <Td fontSize="xs" fontWeight="bold">
                                                                    Data
                                                                </Td>
                                                                <Td fontSize="xs">
                                                                    <Code
                                                                        display="block"
                                                                        whiteSpace="pre-wrap"
                                                                        wordBreak="break-all"
                                                                    >
                                                                        {result.response.data}
                                                                    </Code>
                                                                </Td>
                                                            </Tr>
                                                        )}
                                                    </Tbody>
                                                </Table>
                                            </Box>
                                        </>
                                    )}

                                    {/* Execution Time */}
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" mb={1}>
                                            Execution Time
                                        </Text>
                                        <Text fontSize="xs">{result.executionTime} ms</Text>
                                    </Box>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardBody>
        </Card>
    );
};
