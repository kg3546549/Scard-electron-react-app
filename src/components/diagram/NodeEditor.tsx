/**
 * Node Editor Component
 * 노드 파라미터 편집 패널
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    IconButton,
    Divider,
    Grid,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import { DiagramNode, DiagramNodeType, NodeParameter, CryptoAlgorithm, PipeConfig } from '../../types';
import { PipeConfigEditor } from './PipeConfigEditor';

interface NodeEditorProps {
    node: DiagramNode | null;
    onUpdate: (nodeId: string, updates: Partial<DiagramNode>) => void;
    onDelete: (nodeId: string) => void;
    onClose: () => void;
    allNodes?: DiagramNode[];
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onUpdate, onDelete, onClose, allNodes = [] }) => {
    const [label, setLabel] = useState('');
    const [parameters, setParameters] = useState<NodeParameter[]>([]);
    const [cryptoAlgorithm, setCryptoAlgorithm] = useState<CryptoAlgorithm>(CryptoAlgorithm.NONE);
    const [cryptoKey, setCryptoKey] = useState('');
    const [cryptoIv, setCryptoIv] = useState('');
    const [pipeConfig, setPipeConfig] = useState<PipeConfig | undefined>(undefined);

    useEffect(() => {
        if (node) {
            setLabel(node.data.label);
            const params = node.data.parameters || [];
            const effectiveType = (node.data as any)?.type || node.type;
            // APDU 노드인데 파라미터가 없으면 기본값 로드
            if (params.length === 0 && effectiveType) {
                setParameters(getDefaultParametersForType(effectiveType));
            } else {
                setParameters(params);
            }
            setCryptoAlgorithm(node.data.cryptoConfig?.algorithm || CryptoAlgorithm.NONE);
            setCryptoKey(node.data.cryptoConfig?.key || '');
            setCryptoIv(node.data.cryptoConfig?.iv || '');
            setPipeConfig(node.data.pipeConfig);
        }
    }, [node]);

    if (!node) {
        return (
            <Card h="100%">
                <CardBody>
                    <Text color="gray.500">Select a node to edit</Text>
                </CardBody>
            </Card>
        );
    }

    const handleSave = () => {
        const effectiveType = (node.data as any)?.type || node.type;
        const isCrypto = effectiveType === DiagramNodeType.ENCRYPT_DATA || effectiveType === DiagramNodeType.DECRYPT_DATA;
        const updates: Partial<DiagramNode> = {
            data: {
                ...node.data,
                label,
                parameters: isCrypto ? [] : parameters,
                cryptoConfig: isCrypto && cryptoAlgorithm !== CryptoAlgorithm.NONE ? {
                    algorithm: cryptoAlgorithm,
                    key: cryptoKey,
                    iv: cryptoIv,
                } : undefined,
                pipeConfig: isCrypto ? pipeConfig : node.data.pipeConfig,
            },
        };
        onUpdate(node.id, updates);
    };

    const addParameter = () => {
        setParameters([
            ...parameters,
            { name: '', value: '', type: 'hex', description: '' },
        ]);
    };

    const removeParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const updateParameter = (index: number, field: keyof NodeParameter, value: string) => {
        const updated = [...parameters];
        updated[index] = { ...updated[index], [field]: value };
        setParameters(updated);
    };

    const getDefaultParametersForType = (type: DiagramNodeType): NodeParameter[] => {
        switch (type) {
            case DiagramNodeType.SELECT_AID:
                return [
                    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
                    { name: 'INS', value: 'A4', type: 'hex', description: 'Instruction (SELECT)' },
                    { name: 'P1', value: '04', type: 'hex', description: 'Select by DF name' },
                    { name: 'P2', value: '00', type: 'hex', description: 'First or only occurrence' },
                    { name: 'Data', value: '', type: 'hex', description: 'AID (Application ID)' },
                    { name: 'Le', value: '00', type: 'hex', description: 'Expected response length' },
                ];
            case DiagramNodeType.GET_CHALLENGE:
                return [
                    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
                    { name: 'INS', value: '84', type: 'hex', description: 'Instruction (GET CHALLENGE)' },
                    { name: 'P1', value: '00', type: 'hex', description: 'Parameter 1' },
                    { name: 'P2', value: '00', type: 'hex', description: 'Parameter 2' },
                    { name: 'Data', value: '', type: 'hex', description: 'Command data (empty)' },
                    { name: 'Le', value: '08', type: 'hex', description: 'Challenge length' },
                ];
            case DiagramNodeType.INTERNAL_AUTH:
                return [
                    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
                    { name: 'INS', value: '88', type: 'hex', description: 'Instruction (INTERNAL AUTH)' },
                    { name: 'P1', value: '00', type: 'hex', description: 'Parameter 1' },
                    { name: 'P2', value: '00', type: 'hex', description: 'Parameter 2' },
                    { name: 'Data', value: '', type: 'hex', description: 'Authentication data' },
                    { name: 'Le', value: '00', type: 'hex', description: 'Expected response length' },
                ];
            case DiagramNodeType.EXTERNAL_AUTH:
                return [
                    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
                    { name: 'INS', value: '82', type: 'hex', description: 'Instruction (EXTERNAL AUTH)' },
                    { name: 'P1', value: '00', type: 'hex', description: 'Parameter 1' },
                    { name: 'P2', value: '00', type: 'hex', description: 'Parameter 2' },
                    { name: 'Data', value: '', type: 'hex', description: 'Authentication data' },
                    { name: 'Le', value: '00', type: 'hex', description: 'Expected response length' },
                ];
            case DiagramNodeType.READ_RECORD:
                return [
                    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
                    { name: 'INS', value: 'B2', type: 'hex', description: 'Instruction (READ RECORD)' },
                    { name: 'P1', value: '01', type: 'hex', description: 'Record number' },
                    { name: 'P2', value: '04', type: 'hex', description: 'SFI (Short File Identifier)' },
                    { name: 'Data', value: '', type: 'hex', description: 'Command data (empty)' },
                    { name: 'Le', value: '00', type: 'hex', description: 'Expected response length' },
                ];
            case DiagramNodeType.READ_BINARY:
                return [
                    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
                    { name: 'INS', value: 'B0', type: 'hex', description: 'Instruction (READ BINARY)' },
                    { name: 'P1', value: '00', type: 'hex', description: 'Offset high byte' },
                    { name: 'P2', value: '00', type: 'hex', description: 'Offset low byte' },
                    { name: 'Data', value: '', type: 'hex', description: 'Command data (empty)' },
                    { name: 'Le', value: '00', type: 'hex', description: 'Length to read' },
                ];
            case DiagramNodeType.CUSTOM_APDU:
                return [
                    { name: 'CLA', value: '00', type: 'hex', description: 'Class byte' },
                    { name: 'INS', value: '00', type: 'hex', description: 'Instruction byte' },
                    { name: 'P1', value: '00', type: 'hex', description: 'Parameter 1' },
                    { name: 'P2', value: '00', type: 'hex', description: 'Parameter 2' },
                    { name: 'Data', value: '', type: 'hex', description: 'Command data' },
                    { name: 'Le', value: '00', type: 'hex', description: 'Expected response length' },
                ];
            case DiagramNodeType.ENCRYPT_DATA:
            case DiagramNodeType.DECRYPT_DATA:
                return [];
            default:
                return [];
        }
    };

    // Get available nodes for pipe configuration (nodes that appear before this node)
    const getAvailableNodesForPipe = (): Array<{ id: string; label: string }> => {
        if (!node) return [];

        return allNodes
            .filter(n => n.id !== node.id) // Exclude current node
            .map(n => ({
                id: n.id,
                label: n.data.label || (n.data as any).type || n.type,
            }));
    };

    const effectiveType = (node?.data as any)?.type || node?.type;
    const isCryptoNode = effectiveType === DiagramNodeType.ENCRYPT_DATA || effectiveType === DiagramNodeType.DECRYPT_DATA;
    const isAPDUNode = !isCryptoNode;

    const loadDefaultParameters = () => {
        setParameters(getDefaultParametersForType(node.type));
    };

    // Get specific parameter value
    const getParamValue = (name: string): string => {
        return parameters.find(p => p.name === name)?.value || '';
    };

    // Update specific parameter value
    const setParamValue = (name: string, value: string) => {
        const index = parameters.findIndex(p => p.name === name);
        if (index >= 0) {
            updateParameter(index, 'value', value);
        } else {
            // 파라미터 없으면 새로 추가
            const newParam: NodeParameter = { name, value, type: 'hex', description: '' };
            setParameters([...parameters, newParam]);
        }
    };

    return (
        <Card h="100%" overflowY="auto">
            <CardHeader>
                <HStack justify="space-between">
                    <Heading size="sm">Node Editor</Heading>
                    <HStack>
                        <Button size="sm" leftIcon={<FaTrash />} colorScheme="red" variant="outline" onClick={() => onDelete(node.id)}>
                            Delete
                        </Button>
                        <Button size="sm" leftIcon={<FaSave />} colorScheme="blue" onClick={handleSave}>
                            Save
                        </Button>
                    </HStack>
                </HStack>
            </CardHeader>

            <CardBody>
                <VStack spacing={4} align="stretch">
                    {/* Label */}
                    <FormControl>
                        <FormLabel fontSize="sm">Label</FormLabel>
                        <Input
                            size="sm"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Node label"
                        />
                    </FormControl>

                    {/* Node Type */}
                    <FormControl>
                        <FormLabel fontSize="sm">Type</FormLabel>
                        <Input size="sm" value={node.type} isReadOnly />
                    </FormControl>

                    <Divider />

                    {/* APDU Command Configuration - Only for APDU nodes */}
                    {isAPDUNode && (
                        <Box>
                            <HStack justify="space-between" mb={3}>
                                <Text fontWeight="bold" fontSize="md">APDU Command</Text>
                                <Button
                                    size="xs"
                                    onClick={loadDefaultParameters}
                                    variant="outline"
                                    colorScheme="blue"
                                >
                                    Load Preset
                                </Button>
                            </HStack>

                            <VStack spacing={3} align="stretch">
                                {/* CLA, INS, P1, P2 in 2x2 grid */}
                                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">CLA (Class)</FormLabel>
                                        <Input
                                            size="sm"
                                            value={getParamValue('CLA')}
                                            onChange={(e) => setParamValue('CLA', e.target.value.toUpperCase())}
                                            placeholder="00"
                                            fontFamily="monospace"
                                            maxLength={2}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">INS (Instruction)</FormLabel>
                                        <Input
                                            size="sm"
                                            value={getParamValue('INS')}
                                            onChange={(e) => setParamValue('INS', e.target.value.toUpperCase())}
                                            placeholder="A4"
                                            fontFamily="monospace"
                                            maxLength={2}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">P1 (Parameter 1)</FormLabel>
                                        <Input
                                            size="sm"
                                            value={getParamValue('P1')}
                                            onChange={(e) => setParamValue('P1', e.target.value.toUpperCase())}
                                            placeholder="00"
                                            fontFamily="monospace"
                                            maxLength={2}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">P2 (Parameter 2)</FormLabel>
                                        <Input
                                            size="sm"
                                            value={getParamValue('P2')}
                                            onChange={(e) => setParamValue('P2', e.target.value.toUpperCase())}
                                            placeholder="00"
                                            fontFamily="monospace"
                                            maxLength={2}
                                        />
                                    </FormControl>
                                </Grid>

                                {/* Data field with pipe support */}
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="bold">
                                        Data (Command Data)
                                        {pipeConfig?.sourceNodeId && (
                                            <Text as="span" color="purple.500" ml={2} fontSize="xs">
                                                ← Piped from previous node
                                            </Text>
                                        )}
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        value={getParamValue('Data')}
                                        onChange={(e) => setParamValue('Data', e.target.value.toUpperCase())}
                                        placeholder={pipeConfig?.sourceNodeId ? "Data will be filled from piped node" : "Enter hex data..."}
                                        fontFamily="monospace"
                                        isDisabled={!!pipeConfig?.sourceNodeId}
                                        bg={pipeConfig?.sourceNodeId ? "purple.50" : "white"}
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        {pipeConfig?.sourceNodeId
                                            ? "Data field is automatically filled from the piped source node"
                                            : "Hex string (e.g., A0000000031010) or use Pipe Configuration below"}
                                    </Text>
                                </FormControl>

                                {/* Le field */}
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="bold">Le (Expected Response Length)</FormLabel>
                                    <Input
                                        size="sm"
                                        value={getParamValue('Le')}
                                        onChange={(e) => setParamValue('Le', e.target.value.toUpperCase())}
                                        placeholder="00"
                                        fontFamily="monospace"
                                        maxLength={2}
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        00 = maximum available
                                    </Text>
                                </FormControl>

                                {/* Preview of full APDU command */}
                                <Box p={3} bg="gray.50" borderRadius="md" borderWidth="1px">
                                    <Text fontSize="xs" fontWeight="bold" mb={1}>Command Preview:</Text>
                                    <Text fontSize="sm" fontFamily="monospace" color="blue.600">
                                        {getParamValue('CLA')} {getParamValue('INS')} {getParamValue('P1')} {getParamValue('P2')} {getParamValue('Data') ? `[${getParamValue('Data').length / 2}] ${getParamValue('Data')}` : ''} {getParamValue('Le')}
                                    </Text>
                                </Box>
                            </VStack>
                        </Box>
                    )}

                    {/* Pipe Configuration for APDU nodes (optional) */}
                    {isAPDUNode && (
                        <>
                            <Divider />
                            <Accordion allowToggle>
                                <AccordionItem>
                                    <AccordionButton>
                                        <Box flex="1" textAlign="left">
                                            <Text fontWeight="bold" fontSize="sm">
                                                Pipe Configuration (Optional)
                                            </Text>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel>
                                        <Text fontSize="xs" color="gray.600" mb={3}>
                                            Use this to automatically fill the Data field from a previous node's output
                                        </Text>
                                        <PipeConfigEditor
                                            pipeConfig={pipeConfig}
                                            availableNodes={getAvailableNodesForPipe()}
                                            onChange={setPipeConfig}
                                        />
                                    </AccordionPanel>
                                </AccordionItem>
                            </Accordion>
                        </>
                    )}

                    {/* Advanced Parameters - Collapsed by default */}
                    {isAPDUNode && (
                        <Accordion allowToggle>
                            <AccordionItem>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left">
                                        <Text fontWeight="bold" fontSize="sm">Advanced Parameters</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <VStack spacing={2} align="stretch">
                                        <HStack justify="space-between">
                                            <IconButton
                                                aria-label="Add parameter"
                                                icon={<FaPlus />}
                                                size="xs"
                                                onClick={addParameter}
                                                colorScheme="green"
                                            />
                                        </HStack>
                            {parameters.map((param, index) => (
                                <Card key={index} size="sm" variant="outline">
                                    <CardBody>
                                        <VStack spacing={2} align="stretch">
                                            <HStack>
                                                <FormControl flex={1}>
                                                    <FormLabel fontSize="xs">Name</FormLabel>
                                                    <Input
                                                        size="xs"
                                                        value={param.name}
                                                        onChange={(e) =>
                                                            updateParameter(index, 'name', e.target.value)
                                                        }
                                                        placeholder="Parameter name"
                                                    />
                                                </FormControl>
                                                <FormControl flex={1}>
                                                    <FormLabel fontSize="xs">Type</FormLabel>
                                                    <Select
                                                        size="xs"
                                                        value={param.type}
                                                        onChange={(e) =>
                                                            updateParameter(index, 'type', e.target.value)
                                                        }
                                                    >
                                                        <option value="hex">Hex</option>
                                                        <option value="string">String</option>
                                                        <option value="number">Number</option>
                                                    </Select>
                                                </FormControl>
                                                <IconButton
                                                    aria-label="Remove parameter"
                                                    icon={<FaTrash />}
                                                    size="xs"
                                                    colorScheme="red"
                                                    onClick={() => removeParameter(index)}
                                                    mt={5}
                                                />
                                            </HStack>
                                            <FormControl>
                                                <FormLabel fontSize="xs">Value</FormLabel>
                                                <Input
                                                    size="xs"
                                                    value={param.value}
                                                    onChange={(e) =>
                                                        updateParameter(index, 'value', e.target.value)
                                                    }
                                                    placeholder="Parameter value"
                                                    fontFamily="monospace"
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel fontSize="xs">Description</FormLabel>
                                                <Input
                                                    size="xs"
                                                    value={param.description || ''}
                                                    onChange={(e) =>
                                                        updateParameter(index, 'description', e.target.value)
                                                    }
                                                    placeholder="Parameter description"
                                                />
                                            </FormControl>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    )}

                    <Divider />

                    {/* Crypto Node Configuration - Only for ENCRYPT/DECRYPT nodes */}
                    {isCryptoNode && (
                        <Box>
                            <Text fontWeight="bold" fontSize="md" mb={3}>
                                {node.type === DiagramNodeType.ENCRYPT_DATA ? 'Encryption' : 'Decryption'} Configuration
                            </Text>

                            <VStack spacing={4} align="stretch">
                                {/* Input Data Source */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" mb={2}>Input Data Source</Text>
                                    <PipeConfigEditor
                                        pipeConfig={pipeConfig}
                                        availableNodes={getAvailableNodesForPipe()}
                                        onChange={setPipeConfig}
                                    />
                                </Box>

                                <Divider />

                                {/* Crypto Settings */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" mb={2}>Crypto Settings</Text>
                                    <VStack spacing={3} align="stretch">
                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold">Algorithm</FormLabel>
                                            <Select
                                                size="sm"
                                                value={cryptoAlgorithm}
                                                onChange={(e) =>
                                                    setCryptoAlgorithm(e.target.value as CryptoAlgorithm)
                                                }
                                            >
                                                <option value={CryptoAlgorithm.DES}>DES</option>
                                                <option value={CryptoAlgorithm.TRIPLE_DES}>3DES</option>
                                                <option value={CryptoAlgorithm.AES}>AES</option>
                                                <option value={CryptoAlgorithm.SEED}>SEED</option>
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold">Key (Hex)</FormLabel>
                                            <Input
                                                size="sm"
                                                value={cryptoKey}
                                                onChange={(e) => setCryptoKey(e.target.value.toUpperCase())}
                                                placeholder="Enter encryption key in hex..."
                                                fontFamily="monospace"
                                            />
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                Hex string (e.g., 0123456789ABCDEF...)
                                            </Text>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold">IV (Hex) - Optional</FormLabel>
                                            <Input
                                                size="sm"
                                                value={cryptoIv}
                                                onChange={(e) => setCryptoIv(e.target.value.toUpperCase())}
                                                placeholder="Enter IV in hex (optional)..."
                                                fontFamily="monospace"
                                            />
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                Initialization Vector (for CBC mode)
                                            </Text>
                                        </FormControl>
                                    </VStack>
                                </Box>

                                <Divider />

                                {/* Output Preview */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" mb={2}>Output Data</Text>
                                    <Box p={3} bg="gray.50" borderRadius="md" borderWidth="1px">
                                        <Text fontSize="xs" color="gray.600" mb={1}>
                                            {node.type === DiagramNodeType.ENCRYPT_DATA ? 'Encrypted' : 'Decrypted'} result will be available after execution
                                        </Text>
                                        {node.data.processedData && (
                                            <>
                                                <Text fontSize="xs" fontWeight="bold" mt={2} mb={1}>Result:</Text>
                                                <Text fontSize="sm" fontFamily="monospace" color="green.600" wordBreak="break-all">
                                                    {node.data.processedData}
                                                </Text>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </VStack>
                        </Box>
                    )}
                </VStack>
            </CardBody>
        </Card>
    );
};
