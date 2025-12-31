/**
 * App Layout Component
 * 메인 레이아웃 - Sidebar + Header + Content 영역
 */

import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
    return (
        <Flex minH="100vh" bg="gray.100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <Box
                ml={{ base: 0, md: 60 }}
                flex="1"
                p={4}
                minH="100vh"
            >
                <Outlet />
            </Box>
        </Flex>
    );
};
