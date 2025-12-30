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
} from '@chakra-ui/react';
import { useDriverStore } from '../stores';
import { pcscService } from '../core/services';

export const DriverTestPage: React.FC = () => {
    const toast = useToast();
    const { connectionStatus, readerList } = useDriverStore();

    const [results, setResults] = React.useState<{ [key: string]: string }>({});
    const [statuses, setStatuses] = React.useState<{ [key: string]: 'ready' | 'processing' | 'success' | 'fail' }>({});

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

    const testCards = [
        {
            name: 'Socket Connect',
            command: () => pcscService.connect(),
            buttons: [
                { label: 'Connect', action: () => pcscService.connect() },
                { label: 'Disconnect', action: () => pcscService.disconnect() },
            ],
        },
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
            </SimpleGrid>

            <Divider my={6} />

            <Heading size="md" mb={3}>
                Connection Status
            </Heading>
            <Card>
                <CardBody>
                    <Stack spacing={2}>
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
