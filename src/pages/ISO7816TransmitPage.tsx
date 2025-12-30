/**
 * ISO7816 Transmit Page
 * ISO7816 APDU 전송 페이지
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
    Flex,
    useToast,
} from '@chakra-ui/react';
import { FaXmark } from 'react-icons/fa6';
import { useISO7816Store } from '../stores';
import { CardInfoDisplay, StatusBadge } from '../components/common';
import { APDUInput, TransactionLog, QuickCommands } from '../components/iso7816';

export const ISO7816TransmitPage: React.FC = () => {
    const toast = useToast();
    const {
        cardInfo,
        transactions,
        currentCommand,
        currentResponse,
        status,
        error,
        quickCommands,
        connectCard,
        transmitAPDU,
        setCurrentCommand,
        clearCommand,
        clearTransactions,
        loadQuickCommand,
    } = useISO7816Store();

    const [isTransmitting, setIsTransmitting] = React.useState(false);

    const handleConnect = async () => {
        try {
            await connectCard();
            toast({
                title: 'Card connected',
                description: 'Card information loaded successfully',
                status: 'success',
                duration: 3000,
            });
        } catch (err) {
            toast({
                title: 'Connection failed',
                description: error || 'Failed to connect card',
                status: 'error',
                duration: 5000,
            });
        }
    };

    const handleTransmit = async () => {
        setIsTransmitting(true);
        try {
            await transmitAPDU(currentCommand);
            toast({
                title: 'APDU transmitted',
                description: 'Command sent successfully',
                status: 'success',
                duration: 3000,
            });
        } catch (err) {
            toast({
                title: 'Transmission failed',
                description: error || 'Failed to transmit APDU',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsTransmitting(false);
        }
    };

    return (
        <Box>
            <Flex justify="space-between" mb={5}>
                <Heading size="lg">ISO7816 APDU Transmit</Heading>
                <StatusBadge status={status} />
            </Flex>

            <Grid templateColumns="repeat(10, 1fr)" gap={4}>
                {/* Transmit Section */}
                <GridItem colSpan={7}>
                    <Card>
                        <CardHeader>
                            <Heading size="sm">Transmit</Heading>
                        </CardHeader>
                        <CardBody>
                            <APDUInput
                                value={currentCommand}
                                onChange={setCurrentCommand}
                                onSend={handleTransmit}
                                onClear={clearCommand}
                                isLoading={isTransmitting}
                            />

                            {/* Response */}
                            {currentResponse && (
                                <Box mt={4}>
                                    <Heading size="xs" mb={2}>
                                        Response
                                    </Heading>
                                    <Box
                                        bg="gray.100"
                                        p={3}
                                        borderRadius="md"
                                        fontFamily="mono"
                                        fontSize="sm"
                                    >
                                        {currentResponse}
                                    </Box>
                                </Box>
                            )}
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Card Information */}
                <GridItem colSpan={3}>
                    <Card>
                        <CardHeader>
                            <Flex justify="space-between" align="center">
                                <Heading size="sm">Card Information</Heading>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    borderRadius="full"
                                    onClick={handleConnect}
                                >
                                    Connect
                                </Button>
                            </Flex>
                        </CardHeader>
                        <CardBody>
                            <CardInfoDisplay cardInfo={cardInfo} />
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Transaction Log */}
                <GridItem colSpan={7}>
                    <Card h="45vh" overflowY="auto">
                        <CardHeader>
                            <Flex justify="space-between" align="center">
                                <Heading size="sm">Transaction Log</Heading>
                                {transactions.length > 0 && (
                                    <Button
                                        size="xs"
                                        leftIcon={<FaXmark />}
                                        colorScheme="blue"
                                        borderRadius="full"
                                        onClick={clearTransactions}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Flex>
                        </CardHeader>
                        <CardBody>
                            <TransactionLog
                                transactions={transactions}
                                onClear={clearTransactions}
                                onSelectCommand={setCurrentCommand}
                            />
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Quick Commands */}
                <GridItem colSpan={3}>
                    <Card h="45vh" overflowY="auto">
                        <CardHeader>
                            <Heading size="sm">Quick Commands</Heading>
                        </CardHeader>
                        <CardBody>
                            <QuickCommands
                                commands={quickCommands}
                                onSelect={loadQuickCommand}
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </Box>
    );
};
