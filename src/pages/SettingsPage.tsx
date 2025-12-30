/**
 * Settings Page
 * 설정 페이지
 */

import React from 'react';
import {
    Box,
    Heading,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Card,
    CardBody,
    Stack,
    FormControl,
    FormLabel,
    Input,
    Switch,
    Button,
    useToast,
} from '@chakra-ui/react';
import { useSettingsStore } from '../stores';

export const SettingsPage: React.FC = () => {
    const toast = useToast();
    const {
        pcscPort,
        diagramPath,
        autoConnect,
        setPcscPort,
        setDiagramPath,
        setAutoConnect,
        reset,
    } = useSettingsStore();

    const [tempPort, setTempPort] = React.useState(pcscPort);
    const [tempPath, setTempPath] = React.useState(diagramPath);

    const handleSave = () => {
        setPcscPort(tempPort);
        setDiagramPath(tempPath);
        toast({
            title: 'Settings saved',
            description: 'Your settings have been saved successfully',
            status: 'success',
            duration: 3000,
        });
    };

    const handleReset = () => {
        reset();
        setTempPort('localhost:8888');
        setTempPath('');
        toast({
            title: 'Settings reset',
            description: 'All settings have been reset to default',
            status: 'info',
            duration: 3000,
        });
    };

    return (
        <Box>
            <Heading size="lg" mb={5}>
                Settings
            </Heading>

            <Tabs>
                <TabList>
                    <Tab>General</Tab>
                    <Tab>Driver</Tab>
                </TabList>

                <TabPanels>
                    {/* General Settings */}
                    <TabPanel>
                        <Card>
                            <CardBody>
                                <Stack spacing={4}>
                                    <FormControl>
                                        <FormLabel>Diagram Save Path</FormLabel>
                                        <Input
                                            value={tempPath}
                                            onChange={(e) => setTempPath(e.target.value)}
                                            placeholder="Enter diagram save path"
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel mb={0}>Auto Connect on Startup</FormLabel>
                                        <Switch
                                            isChecked={autoConnect}
                                            onChange={(e) => setAutoConnect(e.target.checked)}
                                        />
                                    </FormControl>

                                    <Stack direction="row" spacing={3}>
                                        <Button colorScheme="blue" onClick={handleSave}>
                                            Save Settings
                                        </Button>
                                        <Button variant="outline" onClick={handleReset}>
                                            Reset to Default
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Driver Settings */}
                    <TabPanel>
                        <Card>
                            <CardBody>
                                <Stack spacing={4}>
                                    <FormControl>
                                        <FormLabel>PCSC Driver Port</FormLabel>
                                        <Input
                                            value={tempPort}
                                            onChange={(e) => setTempPort(e.target.value)}
                                            placeholder="localhost:8888"
                                        />
                                    </FormControl>

                                    <Button colorScheme="blue" onClick={handleSave}>
                                        Save Settings
                                    </Button>
                                </Stack>
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};
