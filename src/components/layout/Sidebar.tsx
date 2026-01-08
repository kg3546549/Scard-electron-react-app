/**
 * Sidebar Component
 * 사이드바 - 네비게이션 메뉴 + 드라이버 연결 상태
 */

import React from 'react';
import {
    Box,
    Flex,
    Text,
    Icon,
    Badge,
    Spacer,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconType } from 'react-icons';
import { IoIdCardOutline } from 'react-icons/io5';
import { FaSimCard } from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { useDriverStore } from '../../stores';
import { DriverConnectionStatus } from '../../types';

interface NavItem {
    name: string;
    icon: IconType;
    path: string;
}

const navItems: NavItem[] = [
    {
        name: 'Mifare Reading',
        icon: IoIdCardOutline,
        path: '/mifare',
    },
    {
        name: 'ISO7816 APDU',
        icon: FaSimCard,
        path: '/iso7816',
    },
    {
        name: 'APDU Diagram',
        icon: MdDashboard,
        path: '/diagram',
    },
    {
        name: 'Driver Test',
        icon: FaSimCard,
        path: '/driver-test',
    },
    {
        name: 'Settings',
        icon: FiSettings,
        path: '/settings',
    },
];

interface NavItemProps {
    item: NavItem;
    isActive: boolean;
    onClick: () => void;
}

const NavItemComponent: React.FC<NavItemProps> = ({ item, isActive, onClick }) => {
    const bgColor = useColorModeValue(
        isActive ? 'cyan.400' : 'transparent',
        isActive ? 'cyan.600' : 'transparent'
    );
    const textColor = useColorModeValue(
        isActive ? 'white' : 'gray.700',
        isActive ? 'white' : 'gray.200'
    );
    const hoverBg = useColorModeValue('cyan.400', 'cyan.600');

    return (
        <Flex
            align="center"
            p={4}
            mx={4}
            borderRadius="lg"
            cursor="pointer"
            bg={bgColor}
            color={textColor}
            _hover={{
                bg: hoverBg,
                color: 'white',
            }}
            onClick={onClick}
            transition="all 0.2s"
        >
            <Icon as={item.icon} mr={4} fontSize="16" />
            <Text fontWeight="medium">{item.name}</Text>
        </Flex>
    );
};

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { connectionStatus } = useDriverStore();

    const bgColor = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const getConnectionBadge = () => {
        switch (connectionStatus) {
            case DriverConnectionStatus.CONTEXT_READY:
                return <Badge colorScheme="green">Context Ready</Badge>;
            case DriverConnectionStatus.RUNNING:
                return <Badge colorScheme="blue">Running</Badge>;
            case DriverConnectionStatus.STARTING:
                return <Badge colorScheme="yellow">Starting...</Badge>;
            case DriverConnectionStatus.ERROR:
                return <Badge colorScheme="red">Error</Badge>;
            case DriverConnectionStatus.STOPPED:
            default:
                return <Badge colorScheme="gray">Stopped</Badge>;
        }
    };

    return (
        <Box
            bg={bgColor}
            borderRight="1px"
            borderRightColor={borderColor}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            display={{ base: 'none', md: 'block' }}
        >
            {/* Header */}
            <Flex h="10vh" alignItems="center" mx={8} justifyContent="center">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="extrabold">
                    CARDs
                </Text>
            </Flex>

            {/* Navigation Items */}
            <Flex direction="column" minHeight="90vh">
                <VStack spacing={1} align="stretch">
                    {navItems.map((item) => (
                        <NavItemComponent
                            key={item.path}
                            item={item}
                            isActive={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </VStack>

                <Spacer />

                {/* Driver Status */}
                <Flex
                    p={3}
                    justify="center"
                    borderTop="1px"
                    borderColor={borderColor}
                    direction="column"
                    align="center"
                >
                    <Text fontWeight="bold" mb={2}>
                        Reader Status
                    </Text>
                    {getConnectionBadge()}
                </Flex>
            </Flex>
        </Box>
    );
};
