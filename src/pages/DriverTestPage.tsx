/**
 * Driver Test Page
 * PCSC 드라이버 테스트 페이지
 */

import React from 'react';
import {
    Box,
    Heading,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Textarea,
    Badge,
    Stack,
    Text,
    Divider,
    useToast,
    HStack,
} from '@chakra-ui/react';
import { useDriverStore } from '../stores';
import { pcscService } from '../core/services';

export const DriverTestPage: React.FC = () => {
    const toast = useToast();
    const { connectionStatus, readerList } = useDriverStore();

    const [results, setResults] = React.useState<{ [key: string]: string }>({});
    const [statuses, setStatuses] = React.useState<{ [key: string]: 'ready' | 'processing' | 'success' | 'fail' }>({});
    const [apduInput, setApduInput] = React.useState('00A4040000');
    const [driverProcessStatus, setDriverProcessStatus] = React.useState<{ running: boolean; pid: number | null }>({
        running: false,
        pid: null,
    });

    const badgeColor = {
        ready: 'gray',
        processing: 'yellow',
        success: 'green',
        fail: 'red',
    };

    const runCommand = async (
        name: string,
        command: () => Promise<any>
    ) => {
        setStatuses(prev => ({ ...prev, [name]: 'processing' }));
        try {
            const result = await command();
            setResults(prev => ({ ...prev, [name]: JSON.stringify(result, null, 2) }));
            setStatuses(prev => ({ ...prev, [name]: 'success' }));
            toast({
                title: `${name} Success`,
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            setResults(prev => ({ ...prev, [name]: (error as Error).message }));
            setStatuses(prev => ({ ...prev, [name]: 'fail' }));
            toast({
                title: `${name} Failed`,
                description: (error as Error).message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const refreshDriverStatus = React.useCallback(async () => {
        if (!window.electron?.ipcRenderer) return;
        const status = await window.electron.ipcRenderer.invoke('driver-process-status');
        setDriverProcessStatus(status);
    }, []);

    React.useEffect(() => {
        refreshDriverStatus();
    }, [refreshDriverStatus]);

    const testCards = [
        {
            name: 'Establish Context',
            command: () => pcscService.establishContext(),
            buttons: [
                { label: 'Establish', action: () => pcscService.establishContext() },
                { label: 'Release', action: () => pcscService.releaseContext() },
            ],
        },
        {
            name: 'Reader List',
            command: () => pcscService.getReaderList(),
            buttons: [{ label: 'Run', action: () => pcscService.getReaderList() }],
        },
        {
            name: 'Connect Card',
            command: () => pcscService.connectCard(),
            buttons: [{ label: 'Run', action: () => pcscService.connectCard() }],
        },
        {
            name: 'Get ATR',
            command: () => pcscService.getATR(),
            buttons: [{ label: 'Run', action: () => pcscService.getATR() }],
        },
        {
            name: 'Get UID',
            command: () => pcscService.getMifareUID(),
            buttons: [{ label: 'Run', action: () => pcscService.getMifareUID() }],
        },
    ];

    return (
        <Box>
            <Heading size="lg" mb={5}>
                PCSC Driver Test
            </Heading>

            <Heading size="md" mb={3}>
                Reader Connect
            </Heading>

            <SimpleGrid columns={3} spacing={4}>
                {testCards.map((card) => (
                    <Card key={card.name}>
                        <CardHeader>
                            <Stack direction="row" align="center">
                                <Heading size="sm">{card.name}</Heading>
                                <Badge colorScheme={badgeColor[statuses[card.name] || 'ready']}>
                                    {statuses[card.name] || 'ready'}
                                </Badge>
                            </Stack>
                        </CardHeader>
                        <CardBody>
                            <Text fontSize="sm" mb={2}>
                                Result
                            </Text>
                            <Textarea
                                readOnly
                                value={results[card.name] || ''}
                                fontSize="xs"
                                fontFamily="mono"
                                minH="100px"
                            />
                        </CardBody>
                        <CardFooter>
                            <Stack direction="row" spacing={2}>
                                {card.buttons.map((btn) => (
                                    <Button
                                        key={btn.label}
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => runCommand(card.name, btn.action)}
                                    >
                                        {btn.label}
                                    </Button>
                                ))}
                            </Stack>
                        </CardFooter>
                    </Card>
                ))}
                <Card>
                    <CardHeader>
                        <Stack direction="row" align="center">
                            <Heading size="sm">Transmit APDU</Heading>
                            <Badge colorScheme={badgeColor[statuses['Transmit APDU'] || 'ready']}>
                                {statuses['Transmit APDU'] || 'ready'}
                            </Badge>
                        </Stack>
                    </CardHeader>
                    <CardBody>
                        <Text fontSize="sm" mb={2}>
                            APDU (hex)
                        </Text>
                        <Textarea
                            value={apduInput}
                            onChange={(e) => setApduInput(e.target.value.toUpperCase())}
                            fontSize="xs"
                            fontFamily="mono"
                            minH="60px"
                            mb={3}
                        />
                        <Text fontSize="sm" mb={2}>
                            Result
                        </Text>
                        <Textarea
                            readOnly
                            value={results['Transmit APDU'] || ''}
                            fontSize="xs"
                            fontFamily="mono"
                            minH="100px"
                        />
                    </CardBody>
                    <CardFooter>
                        <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() =>
                                runCommand('Transmit APDU', () => pcscService.transmit(apduInput.trim()))
                            }
                        >
                            Send
                        </Button>
                    </CardFooter>
                </Card>
            </SimpleGrid>

            <Divider my={6} />

            <Heading size="md" mb={3}>
                Connection Status
            </Heading>
            <Card>
                <CardBody>
                    <Stack spacing={2}>
                        <HStack spacing={2}>
                            <Text>
                                <strong>Driver Process:</strong>{' '}
                                {driverProcessStatus.running ? 'RUNNING' : 'STOPPED'}
                                {driverProcessStatus.pid ? ` (PID ${driverProcessStatus.pid})` : ''}
                            </Text>
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={async () => {
                                    if (!window.electron?.ipcRenderer) return;
                                    await window.electron.ipcRenderer.invoke('driver-restart-if-stopped');
                                    await refreshDriverStatus();
                                }}
                            >
                                Restart If Stopped
                            </Button>
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={async () => {
                                    if (!window.electron?.ipcRenderer) return;
                                    await window.electron.ipcRenderer.invoke('driver-restart');
                                    await refreshDriverStatus();
                                }}
                            >
                                Restart
                            </Button>
                        </HStack>
                        <Text>
                            <strong>Status:</strong> {connectionStatus}
                        </Text>
                        <Text>
                            <strong>Readers:</strong> {readerList.join(', ') || 'None'}
                        </Text>
                    </Stack>
                </CardBody>
            </Card>
        </Box>
    );
};
