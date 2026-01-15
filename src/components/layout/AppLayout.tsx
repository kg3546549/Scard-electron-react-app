import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
    return (
        <Flex h="100vh" w="100vw" overflow="hidden">
            {/* Sidebar (Fixed Left) */}
            <Sidebar />

            {/* Main Content Area (Right) */}
            <Flex direction="column" flex={1} bg="ui.bg" position="relative" overflow="hidden">
                {/* Header (Top) */}
                <Header />

                {/* Content (Scrollable) */}
                <Box
                    flex={1}
                    overflowY="auto"
                    px={4}
                    py={4}
                >
                    <Outlet />
                </Box>
            </Flex>
        </Flex>
    );
};