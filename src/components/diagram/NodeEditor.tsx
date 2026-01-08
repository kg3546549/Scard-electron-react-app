/**
 * Node Editor Component
 * APDU / Crypto / Pipe / Variable 설정을 탭으로 제공
 */

import React, { useEffect, useMemo, useState } from 'react';
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
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    FormErrorMessage,
    Code,
    Tag,
    TagLabel,
    Divider,
    SimpleGrid,
    IconButton,
} from '@chakra-ui/react';
import { FaTrash, FaSave, FaPlus, FaUndo } from 'react-icons/fa';
import {
    DiagramNode,
    DiagramNodeType,
    NodeParameter,
    CryptoAlgorithm,
    PipeConfig,
    VariableSaveConfig,
    VariableUseConfig,
} from '../../types';
import { PipeConfigEditor } from './PipeConfigEditor';

interface NodeEditorProps {
    node: DiagramNode | null;
    onUpdate: (nodeId: string, updates: Partial<DiagramNode>) => void;
    onDelete: (nodeId: string) => void;
    onClose: () => void;
    allNodes?: DiagramNode[];
}

const HEX_RULE = 'HEX 대문자, 짝수 길이';

const normalizeHex = (val: string) => val.replace(/[^0-9A-F]/gi, '').toUpperCase();
const isValidHexEven = (val: string) => val === '' || (val.length % 2 === 0 && /^[0-9A-F]*$/i.test(val));

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onUpdate, onDelete, onClose: _onClose, allNodes = [] }) => {
    const [label, setLabel] = useState('');
    const [parameters, setParameters] = useState<NodeParameter[]>([]);
    const [cryptoAlgorithm, setCryptoAlgorithm] = useState<CryptoAlgorithm>(CryptoAlgorithm.NONE);
    const [cryptoKey, setCryptoKey] = useState('');
    const [cryptoIv, setCryptoIv] = useState('');
    const [pipeConfig, setPipeConfig] = useState<PipeConfig | undefined>(undefined);
    const [pipeConfigB, setPipeConfigB] = useState<PipeConfig | undefined>(undefined);
    const [varSave, setVarSave] = useState<VariableSaveConfig[]>([]);
    const [varUse, setVarUse] = useState<VariableUseConfig>({});
    const [apduDataSource, setApduDataSource] = useState<'literal' | 'variable' | 'pipe'>('literal');
    const [apduDataVar, setApduDataVar] = useState('');
    const [cryptoDataSource, setCryptoDataSource] = useState<'literal' | 'variable' | 'pipe'>('variable');
    const [cryptoDataVar, setCryptoDataVar] = useState('');
    const [concatASource, setConcatASource] = useState<'literal' | 'variable' | 'pipe'>('literal');
    const [concatAVar, setConcatAVar] = useState('');
    const [concatBSource, setConcatBSource] = useState<'literal' | 'variable' | 'pipe'>('literal');
    const [concatBVar, setConcatBVar] = useState('');

    useEffect(() => {
        if (node) {
            setLabel(node.data.label);
            const params = node.data.parameters || [];
            const effectiveType = (node.data as any)?.type || node.type;
            if (params.length === 0 && effectiveType) {
                setParameters(getDefaultParametersForType(effectiveType));
            } else {
                setParameters(params);
            }
            setCryptoAlgorithm(node.data.cryptoConfig?.algorithm || CryptoAlgorithm.NONE);
            setCryptoKey(node.data.cryptoConfig?.key || '');
            setCryptoIv(node.data.cryptoConfig?.iv || '');
            setPipeConfig(node.data.pipeConfig);
            setPipeConfigB((node.data as any).pipeConfigB);
            setVarSave(node.data.variableConfig?.save || []);
            setVarUse(node.data.variableConfig?.use || {});

            const dataVar = node.data.variableConfig?.use?.dataVar || '';
            const keyVar = node.data.variableConfig?.use?.keyVar || '';

            if (effectiveType && effectiveType !== DiagramNodeType.ENCRYPT_DATA && effectiveType !== DiagramNodeType.DECRYPT_DATA && effectiveType !== DiagramNodeType.CONCAT_DATA) {
                if (dataVar) {
                    setApduDataSource('variable');
                    setApduDataVar(dataVar);
                } else if (node.data.pipeConfig) {
                    setApduDataSource('pipe');
                } else {
                    setApduDataSource('literal');
                }
            }

            if (effectiveType === DiagramNodeType.ENCRYPT_DATA || effectiveType === DiagramNodeType.DECRYPT_DATA) {
                if (dataVar) {
                    setCryptoDataSource('variable');
                    setCryptoDataVar(dataVar);
                } else if (node.data.pipeConfig) {
                    setCryptoDataSource('pipe');
                } else {
                    setCryptoDataSource('literal');
                }
            }

            if (effectiveType === DiagramNodeType.CONCAT_DATA) {
                if (dataVar) {
                    setConcatASource('variable');
                    setConcatAVar(dataVar);
                } else if (node.data.pipeConfig) {
                    setConcatASource('pipe');
                } else {
                    setConcatASource('literal');
                }
                if (keyVar) {
                    setConcatBSource('variable');
                    setConcatBVar(keyVar);
                } else if ((node.data as any).pipeConfigB) {
                    setConcatBSource('pipe');
                } else {
                    setConcatBSource('literal');
                }
            }
        }
    }, [node]);

    const effectiveType = (node?.data as any)?.type || node?.type;
    const isCryptoNode = effectiveType === DiagramNodeType.ENCRYPT_DATA || effectiveType === DiagramNodeType.DECRYPT_DATA;
    const isConcatNode = effectiveType === DiagramNodeType.CONCAT_DATA;
    const isAPDUNode = !!node && !isCryptoNode && !isConcatNode;

    const getParameter = (name: string) => parameters.find((p) => p.name === name);
    const getParamValue = (name: string) => getParameter(name)?.value || '';
    const setParamValue = (name: string, value: string) => {
        const idx = parameters.findIndex((p) => p.name === name);
        const next = [...parameters];
        if (idx >= 0) {
            next[idx] = { ...next[idx], value };
        } else {
            next.push({ name, value, type: 'hex', description: '' });
        }
        setParameters(next);
    };

    const addParameter = () => {
        setParameters([...parameters, { name: '', value: '', type: 'hex', description: '' }]);
    };

    const removeParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const updateParameter = (index: number, field: keyof NodeParameter, value: string) => {
        const updated = [...parameters];
        updated[index] = { ...updated[index], [field]: value };
        setParameters(updated);
    };

    const loadDefaultParameters = () => {
        if (!node) return;
        setParameters(getDefaultParametersForType(node.type));
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
            default:
                return [];
        }
    };

    const commandPreview = useMemo(() => {
        if (!isAPDUNode) return '';
        const cla = getParamValue('CLA');
        const ins = getParamValue('INS');
        const p1 = getParamValue('P1');
        const p2 = getParamValue('P2');
        const data = getParamValue('Data');
        const le = getParamValue('Le');
        if (!(cla && ins && p1 && p2)) return '';
        let cmd = `${cla}${ins}${p1}${p2}`;
        let lcHex = '';
        if (data) {
            lcHex = (data.length / 2).toString(16).padStart(2, '0').toUpperCase();
            cmd += lcHex + data;
        }
        if (le) cmd += le;
        return cmd.toUpperCase();
    }, [parameters, isAPDUNode]);

    const lcLength = useMemo(() => {
        const data = getParamValue('Data');
        return data ? data.length / 2 : 0;
    }, [parameters]);

    const keyError = useMemo(() => {
        if (!isCryptoNode || cryptoAlgorithm === CryptoAlgorithm.NONE) return '';
        if (varUse.keyVar) return '';
        if (!cryptoKey) return 'Key is required';
        const len = cryptoKey.length;
        if (cryptoAlgorithm === CryptoAlgorithm.AES && ![32, 48, 64].includes(len)) {
            return 'AES key must be 16/24/32 bytes (32/48/64 hex)';
        }
        if (cryptoAlgorithm === CryptoAlgorithm.DES && len !== 16) {
            return 'DES key must be 8 bytes (16 hex)';
        }
        if (cryptoAlgorithm === CryptoAlgorithm.TRIPLE_DES && ![32, 48].includes(len)) {
            return '3DES key must be 16 or 24 bytes (32/48 hex)';
        }
        if (cryptoAlgorithm === CryptoAlgorithm.SEED && len !== 32) {
            return 'SEED key must be 16 bytes (32 hex)';
        }
        if (!isValidHexEven(cryptoKey)) return HEX_RULE;
        return '';
    }, [cryptoAlgorithm, cryptoKey, isCryptoNode]);

    const ivError = useMemo(() => {
        if (!isCryptoNode || cryptoAlgorithm === CryptoAlgorithm.NONE) return '';
        if (varUse.ivVar) return '';
        if (!cryptoIv) return '';
        if (!isValidHexEven(cryptoIv)) return HEX_RULE;
        if (cryptoAlgorithm === CryptoAlgorithm.AES && cryptoIv.length !== 32) {
            return 'AES IV must be 16 bytes (32 hex)';
        }
        if (cryptoAlgorithm === CryptoAlgorithm.SEED && cryptoIv.length !== 32) {
            return 'SEED IV must be 16 bytes (32 hex)';
        }
        return '';
    }, [cryptoAlgorithm, cryptoIv, isCryptoNode]);

    const availableNodesForPipe = useMemo(() => {
        if (!node) return [];
        return allNodes
            .filter((n) => n.id !== node.id)
            .map((n) => ({
                id: n.id,
                label: n.data.label || (n.data as any)?.type || n.type,
            }));
    }, [allNodes, node]);

    const handleSave = () => {
        if (!node) return;
        const nextVarUse: VariableUseConfig = { ...varUse };
        let nextPipeConfig = pipeConfig;
        let nextPipeConfigB = pipeConfigB;

        if (isAPDUNode) {
            if (apduDataSource === 'variable') {
                nextVarUse.dataVar = apduDataVar;
                nextPipeConfig = undefined;
            } else if (apduDataSource === 'pipe') {
                nextVarUse.dataVar = undefined;
            } else {
                nextVarUse.dataVar = undefined;
                nextPipeConfig = undefined;
            }
        }

        if (isCryptoNode) {
            if (cryptoDataSource === 'variable') {
                nextVarUse.dataVar = cryptoDataVar;
                nextPipeConfig = undefined;
            } else if (cryptoDataSource === 'pipe') {
                nextVarUse.dataVar = undefined;
            } else {
                nextVarUse.dataVar = undefined;
                nextPipeConfig = undefined;
            }
        }

        if (isConcatNode) {
            if (concatASource === 'variable') {
                nextVarUse.dataVar = concatAVar;
                nextPipeConfig = undefined;
            } else if (concatASource === 'pipe') {
                nextVarUse.dataVar = undefined;
            } else {
                nextVarUse.dataVar = undefined;
                nextPipeConfig = undefined;
            }

            if (concatBSource === 'variable') {
                nextVarUse.keyVar = concatBVar;
                nextPipeConfigB = undefined;
            } else if (concatBSource === 'pipe') {
                nextVarUse.keyVar = undefined;
            } else {
                nextVarUse.keyVar = undefined;
                nextPipeConfigB = undefined;
            }
        }

        const updates: Partial<DiagramNode> = {
            data: {
                ...node.data,
                label,
                parameters: isCryptoNode && cryptoDataSource !== 'literal' ? [] : parameters,
                cryptoConfig:
                    isCryptoNode && cryptoAlgorithm !== CryptoAlgorithm.NONE
                        ? {
                              algorithm: cryptoAlgorithm,
                              key: cryptoKey,
                              iv: cryptoIv,
                          }
                        : undefined,
                pipeConfig: nextPipeConfig,
                pipeConfigB: nextPipeConfigB,
                variableConfig: {
                    save: varSave,
                    use: nextVarUse,
                },
            },
        };
        onUpdate(node.id, updates);
    };

    const handleAddVarSave = () => {
        setVarSave([
            ...varSave,
            { name: '', source: 'response', dataOffset: 0, dataLength: -1 },
        ]);
    };

    const handleVarSaveChange = (idx: number, field: keyof VariableSaveConfig, value: string | number) => {
        const next = [...varSave];
        next[idx] = { ...next[idx], [field]: value } as VariableSaveConfig;
        setVarSave(next);
    };

    const handleRemoveVarSave = (idx: number) => {
        setVarSave(varSave.filter((_, i) => i !== idx));
    };

    const renderAPDUPanel = () => {
        if (isConcatNode) {
            return renderConcatPanel();
        }
        if (!isAPDUNode || !node) {
            return <Text fontSize="sm" color="gray.500">APDU 노드가 아닙니다.</Text>;
        }

        const fields: Array<{ name: string; label: string; helper?: string }> = [
            { name: 'CLA', label: 'CLA' },
            { name: 'INS', label: 'INS' },
            { name: 'P1', label: 'P1' },
            { name: 'P2', label: 'P2' },
            { name: 'Data', label: 'Data', helper: 'hex payload' },
            { name: 'Le', label: 'Le', helper: 'Expected length' },
        ];

        return (
            <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                    <Text fontWeight="bold">APDU 설정</Text>
                    <Button size="xs" variant="outline" onClick={loadDefaultParameters} leftIcon={<FaUndo />}>
                        기본값 불러오기
                    </Button>
                </HStack>
                <SimpleGrid columns={2} spacing={3}>
                    {fields.map((f) => {
                        const value = getParamValue(f.name);
                        const isInvalid = !isValidHexEven(value);
                        return (
                            <FormControl key={f.name} isInvalid={isInvalid}>
                                <FormLabel fontSize="sm">{f.label}</FormLabel>
                                <Input
                                    size="sm"
                                    value={value}
                                    onChange={(e) => setParamValue(f.name, normalizeHex(e.target.value))}
                                    placeholder={HEX_RULE}
                                />
                                {f.helper && <Text fontSize="xs" color="gray.500">{f.helper}</Text>}
                                <FormErrorMessage>{HEX_RULE}</FormErrorMessage>
                            </FormControl>
                        );
                    })}
                </SimpleGrid>

                <Box>
                    <Text fontWeight="bold" fontSize="sm" mb={1}>Command Preview</Text>
                    <HStack spacing={2} align="center" mb={2}>
                        <Tag size="sm" colorScheme="blue">
                            <TagLabel>LC {lcLength}B</TagLabel>
                        </Tag>
                        <Tag size="sm" colorScheme="purple">
                            <TagLabel>Len {commandPreview.length / 2}B</TagLabel>
                        </Tag>
                        {getParamValue('Le') && (
                            <Tag size="sm" colorScheme="green">
                                <TagLabel>Le {getParamValue('Le')}</TagLabel>
                            </Tag>
                        )}
                    </HStack>
                    <Code p={2} display="block" whiteSpace="pre-wrap" wordBreak="break-all">
                        {commandPreview || '---'}
                    </Code>
                </Box>

                <Divider />
                <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Data Source</Text>
                    <FormControl mb={2}>
                        <FormLabel fontSize="xs">Source Type</FormLabel>
                        <Select
                            size="sm"
                            value={apduDataSource}
                            onChange={(e) => setApduDataSource(e.target.value as any)}
                        >
                            <option value="literal">Literal</option>
                            <option value="variable">Variable</option>
                            <option value="pipe">Pipe</option>
                        </Select>
                    </FormControl>
                    {apduDataSource === 'variable' && (
                        <FormControl>
                            <FormLabel fontSize="xs">Variable Name</FormLabel>
                            <Input
                                size="sm"
                                value={apduDataVar}
                                onChange={(e) => setApduDataVar(e.target.value)}
                                placeholder="dataVar"
                            />
                        </FormControl>
                    )}
                    {apduDataSource === 'pipe' && (
                        <PipeConfigEditor
                            pipeConfig={pipeConfig}
                            availableNodes={availableNodesForPipe}
                            onChange={setPipeConfig}
                        />
                    )}
                </Box>

                <Divider />

                <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>추가 파라미터</Text>
                    {parameters
                        .filter((p) => !['CLA', 'INS', 'P1', 'P2', 'Data', 'Le'].includes(p.name))
                        .map((param, idx) => (
                            <HStack key={`${param.name}-${idx}`} spacing={2} align="center" mb={2}>
                                <Input
                                    size="sm"
                                    placeholder="Name"
                                    value={param.name}
                                    onChange={(e) => updateParameter(idx, 'name', e.target.value)}
                                />
                                <Input
                                    size="sm"
                                    placeholder="Value"
                                    value={param.value}
                                    onChange={(e) => updateParameter(idx, 'value', normalizeHex(e.target.value))}
                                />
                                <IconButton
                                    aria-label="Remove parameter"
                                    size="sm"
                                    icon={<FaTrash />}
                                    variant="ghost"
                                    onClick={() => removeParameter(idx)}
                                />
                            </HStack>
                        ))}
                    <Button size="xs" leftIcon={<FaPlus />} onClick={addParameter}>
                        파라미터 추가
                    </Button>
                </Box>
            </VStack>
        );
    };

    const renderCryptoPanel = () => {
        if (!isCryptoNode) {
            return <Text fontSize="sm" color="gray.500">암/복호화 노드가 아닙니다.</Text>;
        }

        return (
            <VStack align="stretch" spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm">Algorithm</FormLabel>
                    <Select
                        size="sm"
                        value={cryptoAlgorithm}
                        onChange={(e) => setCryptoAlgorithm(e.target.value as CryptoAlgorithm)}
                    >
                        <option value={CryptoAlgorithm.NONE}>NONE (disable crypto)</option>
                        <option value={CryptoAlgorithm.AES}>AES (CBC)</option>
                        <option value={CryptoAlgorithm.DES}>DES</option>
                        <option value={CryptoAlgorithm.TRIPLE_DES}>3DES</option>
                        <option value={CryptoAlgorithm.SEED}>SEED</option>
                    </Select>
                </FormControl>

                <FormControl isInvalid={!!keyError}>
                    <FormLabel fontSize="sm">Key (hex)</FormLabel>
                    <Input
                        size="sm"
                        value={cryptoKey}
                        onChange={(e) => setCryptoKey(normalizeHex(e.target.value))}
                        placeholder="Key"
                    />
                    <FormErrorMessage>{keyError}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!ivError}>
                    <FormLabel fontSize="sm">IV (hex)</FormLabel>
                    <Input
                        size="sm"
                        value={cryptoIv}
                        onChange={(e) => setCryptoIv(normalizeHex(e.target.value))}
                        placeholder="IV (optional for DES/3DES)"
                    />
                    <FormErrorMessage>{ivError}</FormErrorMessage>
                </FormControl>

                <Divider />

                <FormControl>
                    <FormLabel fontSize="sm">입력 데이터 소스</FormLabel>
                    <Select
                        size="sm"
                        value={cryptoDataSource}
                        onChange={(e) => setCryptoDataSource(e.target.value as any)}
                    >
                        <option value="literal">Literal</option>
                        <option value="variable">Variable</option>
                        <option value="pipe">Pipe</option>
                    </Select>
                    {cryptoDataSource === 'literal' && (
                        <Input
                            size="sm"
                            mt={2}
                            placeholder="data (hex)"
                            value={getParamValue('Data')}
                            onChange={(e) => setParamValue('Data', normalizeHex(e.target.value))}
                        />
                    )}
                    {cryptoDataSource === 'variable' && (
                        <Input
                            size="sm"
                            mt={2}
                            placeholder="data 변수명"
                            value={cryptoDataVar}
                            onChange={(e) => setCryptoDataVar(e.target.value)}
                        />
                    )}
                    {cryptoDataSource === 'pipe' && (
                        <Box mt={2}>
                            <PipeConfigEditor
                                pipeConfig={pipeConfig}
                                availableNodes={availableNodesForPipe}
                                onChange={setPipeConfig}
                            />
                        </Box>
                    )}
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm">Key 변수</FormLabel>
                    <Input
                        size="sm"
                        placeholder="key 변수명 (선택)"
                        value={varUse.keyVar || ''}
                        onChange={(e) => setVarUse({ ...varUse, keyVar: e.target.value })}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm">IV 변수</FormLabel>
                    <Input
                        size="sm"
                        placeholder="iv 변수명 (선택)"
                        value={varUse.ivVar || ''}
                        onChange={(e) => setVarUse({ ...varUse, ivVar: e.target.value })}
                    />
                </FormControl>
            </VStack>
        );
    };

    const renderPipePanel = () => (
        <VStack align="stretch" spacing={3}>
            <PipeConfigEditor
                pipeConfig={pipeConfig}
                availableNodes={availableNodesForPipe}
                onChange={setPipeConfig}
            />
            {isConcatNode && (
                <PipeConfigEditor
                    pipeConfig={pipeConfigB}
                    availableNodes={availableNodesForPipe}
                    onChange={setPipeConfigB}
                />
            )}
            <Text fontSize="xs" color="gray.500">
                우선순위: 변수 → 파이프 순으로 설정됩니다. (PipeConfig에서 priority 조정 가능)
            </Text>
        </VStack>
    );

    const renderConcatPanel = () => {
        return (
            <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold" fontSize="sm">Concat Data (A + B)</Text>
                <Text fontSize="xs" color="gray.600">
                    A: dataVar → pipeConfig → AData, B: keyVar → pipeConfigB → BData
                </Text>
                <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                        <FormLabel fontSize="xs">A Source</FormLabel>
                        <Select
                            size="sm"
                            value={concatASource}
                            onChange={(e) => setConcatASource(e.target.value as any)}
                        >
                            <option value="literal">Literal</option>
                            <option value="variable">Variable</option>
                            <option value="pipe">Pipe</option>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="xs">B Source</FormLabel>
                        <Select
                            size="sm"
                            value={concatBSource}
                            onChange={(e) => setConcatBSource(e.target.value as any)}
                        >
                            <option value="literal">Literal</option>
                            <option value="variable">Variable</option>
                            <option value="pipe">Pipe</option>
                        </Select>
                    </FormControl>
                </SimpleGrid>
                {concatASource === 'variable' && (
                    <FormControl>
                        <FormLabel fontSize="xs">A Variable</FormLabel>
                        <Input
                            size="sm"
                            value={concatAVar}
                            onChange={(e) => setConcatAVar(e.target.value)}
                        />
                    </FormControl>
                )}
                {concatBSource === 'variable' && (
                    <FormControl>
                        <FormLabel fontSize="xs">B Variable</FormLabel>
                        <Input
                            size="sm"
                            value={concatBVar}
                            onChange={(e) => setConcatBVar(e.target.value)}
                        />
                    </FormControl>
                )}
                <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                        <FormLabel fontSize="sm">AData (hex)</FormLabel>
                        <Input
                            size="sm"
                            value={getParamValue('AData')}
                            onChange={(e) => setParamValue('AData', normalizeHex(e.target.value))}
                            placeholder="수기 입력 A"
                            isDisabled={concatASource !== 'literal'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="sm">BData (hex)</FormLabel>
                        <Input
                            size="sm"
                            value={getParamValue('BData')}
                            onChange={(e) => setParamValue('BData', normalizeHex(e.target.value))}
                            placeholder="수기 입력 B"
                            isDisabled={concatBSource !== 'literal'}
                        />
                    </FormControl>
                </SimpleGrid>
                <Divider />
                <Text fontSize="xs" color="gray.600">
                    Pipe 탭에서 A/B 소스를 설정할 수 있습니다. 변수 탭의 dataVar/keyVar로도 입력 가능합니다.
                </Text>
            </VStack>
        );
    };

    const renderVariablePanel = () => (
        <VStack align="stretch" spacing={4}>
            <Box>
                <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold" fontSize="sm">Save variables</Text>
                    <Button size="xs" leftIcon={<FaPlus />} onClick={handleAddVarSave}>
                        Add
                    </Button>
                </HStack>
                {varSave.length === 0 && (
                    <Text fontSize="xs" color="gray.500">저장 규칙이 없습니다.</Text>
                )}
                <VStack align="stretch" spacing={2}>
                    {varSave.map((cfg, idx) => (
                        <Box key={idx} p={2} borderWidth="1px" borderRadius="md">
                            <HStack spacing={2} align="center" mb={2}>
                                <Input
                                    size="sm"
                                    placeholder="변수명"
                                    value={cfg.name}
                                    onChange={(e) => handleVarSaveChange(idx, 'name', e.target.value)}
                                />
                                <Select
                                    size="sm"
                                    value={cfg.source}
                                    onChange={(e) => handleVarSaveChange(idx, 'source', e.target.value)}
                                >
                                    <option value="response">response</option>
                                    <option value="processedData">processedData</option>
                                </Select>
                                <IconButton
                                    aria-label="remove"
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveVarSave(idx)}
                                />
                            </HStack>
                            <SimpleGrid columns={2} spacing={2}>
                                <FormControl>
                                    <FormLabel fontSize="xs">Offset (bytes)</FormLabel>
                                    <Input
                                        size="sm"
                                        type="number"
                                        value={cfg.dataOffset}
                                        onChange={(e) =>
                                            handleVarSaveChange(idx, 'dataOffset', parseInt(e.target.value) || 0)
                                        }
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="xs">Length (bytes)</FormLabel>
                                    <Input
                                        size="sm"
                                        type="number"
                                        value={cfg.dataLength}
                                        onChange={(e) =>
                                            handleVarSaveChange(idx, 'dataLength', parseInt(e.target.value) || -1)
                                        }
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                -1 은 전체 길이, response/processedData에서 지정 범위를 저장합니다.
                            </Text>
                        </Box>
                    ))}
                </VStack>
            </Box>

            <Divider />

            <Box>
                <Text fontWeight="bold" fontSize="sm" mb={2}>Use variables</Text>
                <VStack align="stretch" spacing={2}>
                    <FormControl>
                        <FormLabel fontSize="sm">Data 변수</FormLabel>
                        <Input
                            size="sm"
                            placeholder="dataVar"
                            value={varUse.dataVar || ''}
                            onChange={(e) => setVarUse({ ...varUse, dataVar: e.target.value })}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="sm">Key 변수</FormLabel>
                        <Input
                            size="sm"
                            placeholder="keyVar"
                            value={varUse.keyVar || ''}
                            onChange={(e) => setVarUse({ ...varUse, keyVar: e.target.value })}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="sm">IV 변수</FormLabel>
                        <Input
                            size="sm"
                            placeholder="ivVar"
                            value={varUse.ivVar || ''}
                            onChange={(e) => setVarUse({ ...varUse, ivVar: e.target.value })}
                        />
                    </FormControl>
                </VStack>
            </Box>
        </VStack>
    );

    const renderMetaPanel = () => {
        if (!node) {
            return <Text fontSize="sm" color="gray.500">노드를 선택하세요.</Text>;
        }
        const data = node.data;
        const response = data.response;

        return (
            <VStack align="stretch" spacing={3}>
                <HStack>
                    <Tag colorScheme={data.executed ? 'green' : 'gray'}>
                        <TagLabel>{data.executed ? 'Executed' : 'Not executed'}</TagLabel>
                    </Tag>
                    {response?.statusCode && (
                        <Tag colorScheme={response.success ? 'green' : 'red'}>
                            <TagLabel>SW {response.statusCode}</TagLabel>
                        </Tag>
                    )}
                    {data.error && (
                        <Tag colorScheme="red">
                            <TagLabel>Error</TagLabel>
                        </Tag>
                    )}
                </HStack>
                {data.error && <Text color="red.500" fontSize="sm">{data.error}</Text>}
                {response?.data && (
                    <Box>
                        <Text fontWeight="bold" fontSize="sm">Last Response</Text>
                        <Code p={2} display="block" whiteSpace="pre-wrap" wordBreak="break-all">
                            {response.data} / SW {response.statusCode}
                        </Code>
                    </Box>
                )}
                {(data as any).lastCommandHex && (
                    <Box>
                        <Text fontWeight="bold" fontSize="sm">Last APDU</Text>
                        <Code p={2} display="block" whiteSpace="pre-wrap" wordBreak="break-all">
                            {(data as any).lastCommandHex}
                        </Code>
                    </Box>
                )}
                {data.processedData && (
                    <Box>
                        <Text fontWeight="bold" fontSize="sm">Processed Data</Text>
                        <Code p={2} display="block" whiteSpace="pre-wrap" wordBreak="break-all">
                            {data.processedData}
                        </Code>
                    </Box>
                )}
            </VStack>
        );
    };

    return (
        <Card h="100%" overflowY="auto">
            <CardHeader>
                <HStack justify="space-between" align="center">
                    <Heading size="sm">Node Editor</Heading>
                    <HStack>
                        <Button
                            size="sm"
                            leftIcon={<FaTrash />}
                            colorScheme="red"
                            variant="outline"
                            onClick={() => node && onDelete(node.id)}
                            isDisabled={!node}
                        >
                            Delete
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<FaSave />}
                            colorScheme="blue"
                            onClick={handleSave}
                            isDisabled={!node}
                        >
                            Save
                        </Button>
                    </HStack>
                </HStack>
            </CardHeader>

            <CardBody>
                {!node ? (
                    <Text color="gray.500">Select a node to edit</Text>
                ) : (
                    <VStack align="stretch" spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm">Label</FormLabel>
                            <Input
                                size="sm"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="노드 라벨"
                            />
                        </FormControl>

                        <Tabs size="sm" variant="enclosed">
                            <TabList>
                                <Tab>APDU</Tab>
                                <Tab>Crypto</Tab>
                                <Tab>Pipe</Tab>
                                <Tab>Variables</Tab>
                                <Tab>Meta</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>{renderAPDUPanel()}</TabPanel>
                                <TabPanel>{renderCryptoPanel()}</TabPanel>
                                <TabPanel>{renderPipePanel()}</TabPanel>
                                <TabPanel>{renderVariablePanel()}</TabPanel>
                                <TabPanel>{renderMetaPanel()}</TabPanel>
                            </TabPanels>
                        </Tabs>
                    </VStack>
                )}
            </CardBody>
        </Card>
    );
};
