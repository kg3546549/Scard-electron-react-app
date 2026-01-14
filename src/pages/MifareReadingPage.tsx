/**
 * Mifare Reading Page
 * Mifare 카드 리딩 페이지
 */

import React from 'react';
import {
    Box,
    Heading,
    Grid,
    GridItem,
    Card,
    CardHeader,
    CardBody,
    Button,
    Stack,
    SimpleGrid,
    Flex,
    Checkbox,
    useToast,
    Select,
    Text,
} from '@chakra-ui/react';
import { FaSearch, FaStop, FaEdit, FaCheckCircle, FaFingerprint, FaKey, FaBook } from 'react-icons/fa';
import { useMifareStore } from '../stores';
import { CardInfoDisplay, StatusBadge, HexInput } from '../components/common';
import { SectorCard, KeySelector } from '../components/mifare';
import { CardType, CardReadingStatus } from '../types';

export const MifareReadingPage: React.FC = () => {
    const toast = useToast();
    const {
        cardInfo,
        sectorData,
        selectedSectors,
        keyConfig,
        status,
        error,
        detectCard,
        readAllSectors,
        selectSector,
        selectAllSectors,
        deselectAllSectors,
        setKeyConfig,
        writeBlock,
        connectCard,
        readUID,
        authenticateSectorOnly,
        readSectorOnly,
    } = useMifareStore();

    const [isReading, setIsReading] = React.useState(false);
    const [selectAll, setSelectAll] = React.useState(false);

    // Write State
    const [writeBlockIndex, setWriteBlockIndex] = React.useState<number>(0);
    const [writeData, setWriteData] = React.useState<string>('');

    // Computed
    const selectedSectorIndices = selectedSectors
        .map((s, i) => (s ? i : -1))
        .filter((i) => i !== -1);
    const isSingleSectorSelected = selectedSectorIndices.length === 1;
    const singleSectorIndex = isSingleSectorSelected ? selectedSectorIndices[0] : -1;

    const handleDetectCard = async () => {
        try {
            await detectCard();
            toast({
                title: 'Card detected',
                description: 'Card information loaded successfully',
                status: 'success',
                duration: 3000,
            });
        } catch (err) {
            toast({
                title: 'Detection failed',
                description: error || 'Failed to detect card',
                status: 'error',
                duration: 5000,
            });
        }
    };

    const handleStartScan = async () => {
        if (!cardInfo) {
            toast({
                title: 'No card detected',
                description: 'Detect the card first',
                status: 'warning',
                duration: 3000,
            });
            return;
        }
        if (cardInfo.type !== CardType.MIFARE_1K && cardInfo.type !== CardType.MIFARE_4K) {
            toast({
                title: 'Unsupported card type',
                description: `Mifare Classic reading only. Detected: ${cardInfo.type}`,
                status: 'warning',
                duration: 4000,
            });
            return;
        }
        if (!selectedSectors.some((s: boolean) => s)) {
            toast({
                title: 'No sectors selected',
                description: 'Please select at least one sector to read',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        setIsReading(true);
        try {
            await readAllSectors();
            toast({
                title: 'Scan completed',
                description: 'All selected sectors have been read',
                status: 'success',
                duration: 3000,
            });
        } catch (err) {
            toast({
                title: 'Scan failed',
                description: error || 'Failed to read sectors',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsReading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            deselectAllSectors();
        } else {
            selectAllSectors();
        }
        setSelectAll(!selectAll);
    };

    // Individual Operations Handlers
    const handleConnect = async () => {
        try {
            await connectCard();
            toast({ title: 'Connected', status: 'success' });
        } catch (e) {
            toast({ title: 'Connection failed', description: (e as Error).message, status: 'error' });
        }
    };

    const handleGetUID = async () => {
        try {
            await readUID();
            toast({ title: 'UID Read', status: 'success' });
        } catch (e) {
            toast({ title: 'Read UID failed', description: (e as Error).message, status: 'error' });
        }
    };

    const handleAuthSector = async () => {
        if (!isSingleSectorSelected) return;
        try {
            await authenticateSectorOnly(singleSectorIndex);
            toast({ title: `Sector ${singleSectorIndex} Authenticated`, status: 'success' });
        } catch (e) {
            toast({ title: 'Authentication failed', description: (e as Error).message, status: 'error' });
        }
    };

    const handleReadSingleSector = async () => {
        if (!isSingleSectorSelected) return;
        try {
            await readSectorOnly(singleSectorIndex);
            toast({ title: `Sector ${singleSectorIndex} Read`, status: 'success' });
        } catch (e) {
            toast({ title: 'Read failed', description: (e as Error).message, status: 'error' });
        }
    };

    const handleWriteBlock = async () => {
        if (!isSingleSectorSelected) return;
        if (writeData.length !== 32) {
            toast({ title: 'Invalid Data', description: 'Data must be 16 bytes (32 hex characters)', status: 'warning' });
            return;
        }
        try {
            await writeBlock(singleSectorIndex, writeBlockIndex, writeData);
            toast({ title: 'Write Success', description: `Written to Sector ${singleSectorIndex}, Block ${writeBlockIndex}`, status: 'success' });
        } catch (e) {
            toast({ title: 'Write failed', description: (e as Error).message, status: 'error' });
        }
    };

    return (
        <Flex direction="column" h="full" overflow="hidden" gap={4}>
            <Flex justify="space-between" flexShrink={0}>
                <Heading size="lg">Mifare Card Reading</Heading>
                <StatusBadge status={status} />
            </Flex>

            {/* Top Row: Card Status & Scan Controls */}
            <Grid templateColumns="repeat(7, 1fr)" gap={4} flexShrink={0}>
                {/* Card Status */}
                <GridItem colSpan={5}>
                    <Card>
                        <CardHeader>
                            <Flex justify="space-between" align="center">
                                <Heading size="md">Card Status</Heading>
                                <Button colorScheme="teal" onClick={handleDetectCard}>
                                    Detect Card
                                </Button>
                            </Flex>
                        </CardHeader>
                        <CardBody py={2}>
                            <CardInfoDisplay cardInfo={cardInfo} />
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Scan Controls */}
                <GridItem colSpan={2}>
                    <Card h="full">
                        <CardHeader pb={2}>
                            <Heading size="md">Scan Controls</Heading>
                        </CardHeader>
                        <CardBody>
                            <Stack spacing={3}>
                                <Button
                                    colorScheme="blue"
                                    leftIcon={<FaSearch />}
                                    onClick={handleStartScan}
                                    isLoading={isReading}
                                    loadingText="Scanning..."
                                >
                                    Start Full Scan
                                </Button>
                                <Button
                                    leftIcon={<FaStop />}
                                    isDisabled={!isReading}
                                >
                                    Stop Scan
                                </Button>
                            </Stack>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            {/* Bottom Row: Sector Data & Right Column */}
            <Flex flex="1" gap={4} minH={0} w="full">
                {/* Sector Data */}
                <Box flex={5} h="full" minH={0}>
                    <Card h="full" display="flex" flexDirection="column" overflow="hidden">
                        <CardHeader pb={2} flexShrink={0}>
                            <Flex justify="space-between" align="center">
                                <Heading size="md">Sector Data (0-15)</Heading>
                                <Checkbox
                                    isChecked={selectAll}
                                    onChange={handleSelectAll}
                                >
                                    Select All
                                </Checkbox>
                            </Flex>
                        </CardHeader>
                        <CardBody 
                            flex="1" 
                            overflowY="auto" 
                            pb={10}
                            px={4}
                            css={{
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-track': { width: '6px' },
                                '&::-webkit-scrollbar-thumb': { background: '#cbd5e0', borderRadius: '24px' },
                            }}
                        >
                            <SimpleGrid columns={2} gap={4} w="full">
                                {sectorData.map((sector: any, index: number) => (
                                    <SectorCard
                                        key={sector.sectorNumber}
                                        sector={sector}
                                        isSelected={selectedSectors[index]}
                                        onClick={() => selectSector(index)}
                                    />
                                ))}
                            </SimpleGrid>
                        </CardBody>
                    </Card>
                </Box>

                {/* Right Column Stack */}
                <Box flex={2} h="full" minH={0}>
                    <Box h="full" overflowY="auto" pr={1} css={{
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-track': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { background: '#cbd5e0', borderRadius: '24px' },
                    }}>
                        <Stack spacing={4} pb={10}>
                            {/* Key Settings */}
                            <Card variant="outline">
                                <CardHeader pb={2}>
                                    <Heading size="sm">Key Settings</Heading>
                                </CardHeader>
                                <CardBody pt={0}>
                                    <KeySelector
                                        keyConfig={keyConfig}
                                        onChange={setKeyConfig}
                                    />
                                </CardBody>
                            </Card>

                            {/* Individual Operations */}
                            <Card variant="outline">
                                <CardHeader pb={2}>
                                    <Heading size="sm">Individual Steps</Heading>
                                </CardHeader>
                                <CardBody pt={0}>
                                    <Stack spacing={2}>
                                        <Button 
                                            size="sm"
                                            leftIcon={<FaCheckCircle />} 
                                            onClick={handleConnect}
                                            isLoading={status === CardReadingStatus.CONNECTING}
                                        >
                                            1. Select (Connect)
                                        </Button>
                                        <Button 
                                            size="sm"
                                            leftIcon={<FaFingerprint />} 
                                            onClick={handleGetUID}
                                            isLoading={status === CardReadingStatus.GETTING_UID}
                                        >
                                            2. Anticollision (UID)
                                        </Button>
                                        <Button 
                                            size="sm"
                                            leftIcon={<FaKey />} 
                                            onClick={handleAuthSector}
                                            isDisabled={!isSingleSectorSelected}
                                            isLoading={status === CardReadingStatus.AUTHENTICATING}
                                            colorScheme={isSingleSectorSelected ? "orange" : "gray"}
                                        >
                                            3. Authenticate
                                        </Button>
                                        <Button 
                                            size="sm"
                                            leftIcon={<FaBook />} 
                                            onClick={handleReadSingleSector}
                                            isDisabled={!isSingleSectorSelected}
                                            isLoading={status === CardReadingStatus.READING}
                                            colorScheme={isSingleSectorSelected ? "green" : "gray"}
                                        >
                                            4. Read Sector
                                        </Button>
                                        {!isSingleSectorSelected && (
                                            <Text fontSize="xs" color="gray.500">
                                                Select exactly one sector for steps 3 & 4.
                                            </Text>
                                        )}
                                    </Stack>
                                </CardBody>
                            </Card>

                            {/* Write Operations */}
                            <Card variant="outline">
                                <CardHeader pb={2}>
                                    <Heading size="sm">Write Block</Heading>
                                </CardHeader>
                                <CardBody pt={0}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Text mb={1} fontSize="xs">Block Index (0-3)</Text>
                                            <Select 
                                                size="sm"
                                                value={writeBlockIndex} 
                                                onChange={(e) => setWriteBlockIndex(Number(e.target.value))}
                                                isDisabled={!isSingleSectorSelected}
                                            >
                                                <option value={0}>Block 0</option>
                                                <option value={1}>Block 1</option>
                                                <option value={2}>Block 2</option>
                                                <option value={3}>Block 3</option>
                                            </Select>
                                        </Box>
                                        <HexInput 
                                            size="sm"
                                            label="Data (16 Bytes)" 
                                            value={writeData} 
                                            onChange={setWriteData}
                                            maxLength={32}
                                            isDisabled={!isSingleSectorSelected}
                                        />
                                        <Button
                                            size="sm"
                                            leftIcon={<FaEdit />}
                                            colorScheme="red"
                                            onClick={handleWriteBlock}
                                            isDisabled={!isSingleSectorSelected || writeData.length !== 32}
                                            isLoading={status === CardReadingStatus.WRITING}
                                        >
                                            Write to Sector {isSingleSectorSelected ? singleSectorIndex : '?'}
                                        </Button>
                                    </Stack>
                                </CardBody>
                            </Card>
                        </Stack>
                    </Box>
                </Box>
            </Flex>
        </Flex>
    );
};

