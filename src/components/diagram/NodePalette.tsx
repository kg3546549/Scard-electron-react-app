/**
 * Node Palette Component
 * 드래그 가능한 노드 팔레트
 */

import React from 'react';
import { VStack, Box, Text, Card, CardBody, Heading } from '@chakra-ui/react';
import { DiagramNodeType } from '../../types';

interface NodePaletteProps {
    onDragStart: (event: React.DragEvent, nodeType: DiagramNodeType) => void;
}

const nodeTypes = [
    { type: DiagramNodeType.SELECT_AID, label: 'Select AID', description: 'Select Application', color: 'blue' },
    { type: DiagramNodeType.GET_CHALLENGE, label: 'Get Challenge', description: 'Get Random Challenge', color: 'blue' },
    { type: DiagramNodeType.INTERNAL_AUTH, label: 'Internal Auth', description: 'Internal Authentication', color: 'blue' },
    { type: DiagramNodeType.EXTERNAL_AUTH, label: 'External Auth', description: 'External Authentication', color: 'blue' },
    { type: DiagramNodeType.READ_RECORD, label: 'Read Record', description: 'Read Record Data', color: 'blue' },
    { type: DiagramNodeType.READ_BINARY, label: 'Read Binary', description: 'Read Binary Data', color: 'blue' },
    { type: DiagramNodeType.CUSTOM_APDU, label: 'Custom APDU', description: 'Custom Command', color: 'blue' },
    { type: DiagramNodeType.ENCRYPT_DATA, label: 'Encrypt Data', description: 'Encrypt piped data', color: 'purple' },
    { type: DiagramNodeType.DECRYPT_DATA, label: 'Decrypt Data', description: 'Decrypt piped data', color: 'purple' },
    { type: DiagramNodeType.CONCAT_DATA, label: 'Concat Data', description: 'A+B data combine', color: 'orange' },
];

export const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart }) => {
    return (
        <Card h="100%">
            <CardBody>
                <Heading size="sm" mb={4}>
                    Node Palette
                </Heading>
                <VStack spacing={2} align="stretch">
                    {nodeTypes.map((node) => (
                        <Box
                            key={node.type}
                            p={3}
                            bg={`${node.color}.50`}
                            border="2px solid"
                            borderColor={`${node.color}.200`}
                            borderRadius="md"
                            cursor="grab"
                            _hover={{ bg: `${node.color}.100`, borderColor: `${node.color}.300` }}
                            _active={{ cursor: 'grabbing' }}
                            draggable
                            onDragStart={(e) => onDragStart(e, node.type)}
                        >
                            <Text fontWeight="bold" fontSize="sm">
                                {node.label}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                {node.description}
                            </Text>
                        </Box>
                    ))}
                </VStack>
            </CardBody>
        </Card>
    );
};
