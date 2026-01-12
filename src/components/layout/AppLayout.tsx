/**
 * App Layout Component
 * 메인 레이아웃 - Sidebar + Header + Content 영역
 */

import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
    return (
        <Flex direction="column" minH="100vh" bg="gray.100">
            {/* Header / Custom Title Bar */}
            <Header />

            <Flex flex="1" position="relative" overflow="hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <Box
                    ml={{ base: 0, md: 60 }}
                    flex="1"
                    p={4}
                    h="calc(100vh - 64px)" // Fixed height
                    overflowY="auto"       // Scrollable content
                >
                    <Outlet />
                </Box>
            </Flex>
        </Flex>
    );
};
