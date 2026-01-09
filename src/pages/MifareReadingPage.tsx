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
} from '@chakra-ui/react';
import { FaSearch, FaStop } from 'react-icons/fa';
import { useMifareStore } from '../stores';
import { CardInfoDisplay, StatusBadge } from '../components/common';
import { SectorCard, KeySelector } from '../components/mifare';
import { CardType } from '../types';

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
    } = useMifareStore();

    const [isReading, setIsReading] = React.useState(false);
    const [selectAll, setSelectAll] = React.useState(false);

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

    return (
        <Box>
            <Flex justify="space-between" mb={5}>
                <Heading size="lg">Mifare Card Reading</Heading>
                <StatusBadge status={status} />
            </Flex>

            <Grid templateColumns="repeat(7, 1fr)" gap={4}>
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
                        <CardBody>
                            <CardInfoDisplay cardInfo={cardInfo} />
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Scan Controls */}
                <GridItem colSpan={2}>
                    <Card>
                        <CardHeader>
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

                {/* Sector Data */}
                <GridItem colSpan={5}>
                    <Card h="65vh" overflowY="auto">
                        <CardHeader>
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
                        <CardBody>
                            <SimpleGrid columns={2} gap={4}>
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
                </GridItem>

                {/* Key Settings */}
                <GridItem colSpan={2}>
                    <Card>
                        <CardHeader>
                            <Heading size="md">Key Settings</Heading>
                        </CardHeader>
                        <CardBody>
                            <KeySelector
                                keyConfig={keyConfig}
                                onChange={setKeyConfig}
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </Box>
    );
};
