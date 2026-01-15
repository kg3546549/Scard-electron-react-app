import React, { useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    Icon,
    Badge,
    VStack,
    IconButton,
    Tooltip,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconType } from 'react-icons';
import { IoIdCardOutline } from 'react-icons/io5';
import { FaSimCard } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSidebarStore } from '../../stores/useSidebarStore';
import { useDriverStore } from '../../stores';
import { DriverConnectionStatus } from '../../types';

interface NavItem {
    id: string;
    name: string;
    icon: IconType;
    path: string;
}

const navItems: NavItem[] = [
    {
        id: 'mifare',
        name: 'Mifare Reading',
        icon: IoIdCardOutline,
        path: '/mifare',
    },
    {
        id: 'iso7816',
        name: 'ISO7816 APDU',
        icon: FaSimCard,
        path: '/iso7816',
    },
    {
        id: 'diagram',
        name: 'APDU Diagram',
        icon: MdDashboard,
        path: '/diagram',
    },
    {
        id: 'driver-test',
        name: 'Driver Test',
        icon: FaSimCard,
        path: '/driver-test',
    },
];

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isCollapsed, toggleSidebar, setActivePage } = useSidebarStore();
    const { connectionStatus } = useDriverStore();

    // Sync active page with location
    useEffect(() => {
        const currentPath = location.pathname;
        const currentItem = navItems.find(item => currentPath.startsWith(item.path));
        if (currentItem) {
            setActivePage(currentItem.id);
        }
    }, [location, setActivePage]);

    const getConnectionBadge = () => {
        if (isCollapsed) {
             let color = 'gray.500';
             switch (connectionStatus) {
                case DriverConnectionStatus.CONTEXT_READY: color = 'green.500'; break;
                case DriverConnectionStatus.RUNNING: color = 'blue.500'; break;
                case DriverConnectionStatus.STARTING: color = 'yellow.500'; break;
                case DriverConnectionStatus.ERROR: color = 'red.500'; break;
             }
             return <Box w="10px" h="10px" borderRadius="full" bg={color} />;
        }

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
            as="nav"
            w={isCollapsed ? '70px' : '240px'}
            h="100vh" // Full height
            bg="white"
            borderRight="1px solid"
            borderColor="ui.border"
            transition="width 0.2s ease-in-out"
            zIndex={100}
            display="flex"
            flexDirection="column"
        >
            {/* Branding Area */}
            <Flex
                h="64px"
                align="center"
                justify={isCollapsed ? 'center' : 'flex-start'}
                px={isCollapsed ? 0 : 6}
                borderBottom="1px solid"
                borderColor="ui.border"
            >
                <Text fontSize="xl" fontWeight="bold" color="brand.500" whiteSpace="nowrap">
                    {isCollapsed ? 'CARD' : 'CARD Tools'}
                </Text>
            </Flex>

            {/* Menu Items */}
            <VStack spacing={1} align="stretch" p={2} flex={1}>
                {navItems.map((module) => {
                    const isActive = location.pathname.startsWith(module.path);
                    return (
                        <Tooltip
                            key={module.id}
                            label={isCollapsed ? module.name : ''}
                            placement="right"
                            hasArrow
                            isDisabled={!isCollapsed}
                        >
                            <Flex
                                align="center"
                                p={3}
                                cursor="pointer"
                                borderRadius="md"
                                bg={isActive ? 'brand.50' : 'transparent'}
                                color={isActive ? 'brand.600' : 'gray.600'}
                                fontWeight={isActive ? 'bold' : 'normal'}
                                _hover={{ bg: 'brand.50', color: 'brand.600' }}
                                onClick={() => navigate(module.path)}
                                justify={isCollapsed ? 'center' : 'flex-start'}
                            >
                                <Icon as={module.icon} boxSize={5} />
                                {!isCollapsed && (
                                    <Text ml={3} fontSize="sm" whiteSpace="nowrap">
                                        {module.name}
                                    </Text>
                                )}
                            </Flex>
                        </Tooltip>
                    );
                })}
            </VStack>
            
            {/* Driver Status - Adapted for Sidebar */}
             <Box p={2} borderTop="1px solid" borderColor="ui.border">
                <Flex 
                    direction={isCollapsed ? 'column' : 'row'} 
                    align="center" 
                    justify="center" 
                    mb={isCollapsed ? 2 : 0}
                >
                     {!isCollapsed && (
                         <Text fontSize="xs" color="gray.500" mr={2} fontWeight="bold">
                             Reader:
                         </Text>
                     )}
                     {getConnectionBadge()}
                </Flex>
            </Box>


            {/* Footer / Toggle */}
            <Box p={2} borderTop="1px solid" borderColor="ui.border">
                <Flex justify={isCollapsed ? 'center' : 'flex-end'}>
                    <IconButton
                        aria-label="Toggle Sidebar"
                        icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        onClick={toggleSidebar}
                    />
                </Flex>
            </Box>
        </Box>
    );
};