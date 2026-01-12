/**
 * Header Component
 * 애플리케이션 커스텀 타이틀바
 */

import React from 'react';
import { Flex, Text, HStack, Box, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FiMinus, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();
  
  // 경로에 따른 타이틀 설정
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/mifare')) return 'Mifare Reader';
    if (path.includes('/iso7816')) return 'ISO7816 Transmit';
    if (path.includes('/diagram')) return 'APDU Diagram';
    if (path.includes('/driver-test')) return 'Driver Test';
    if (path.includes('/settings')) return 'Settings';
    return 'CARD Tools';
  };

  const handleMinimize = () => {
    (window as any).electron?.ipcRenderer.send('window-minimize');
  };

  const handleClose = () => {
    (window as any).electron?.ipcRenderer.send('window-close');
  };

  return (
    <Flex
      as="header"
      w="full"
      h="64px"
      bg="white"
      align="center"
      justify="space-between"
      px={6}
      borderBottom="1px solid"
      borderColor="ui.border"
      position="relative"
      zIndex="sticky"
      // CRITICAL: Makes the div act as a window handle
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* 1. Left: Brand Identity */}
      <HStack spacing={4}>
        <Text fontSize="lg" fontWeight="black" color="brand.500" userSelect="none">
          S1 Tools
        </Text>
      </HStack>

      {/* 2. Center: Application Title */}
      <Box
        position="absolute"
        left="50%"
        transform="translateX(-50%)"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <Text fontSize="md" fontWeight="bold" color="gray.600" userSelect="none">
          {getTitle()}
        </Text>
      </Box>

      {/* 3. Right: Window Controls */}
      <HStack spacing={2} style={{ WebkitAppRegion: 'no-drag' } as any}>
        <IconButton
          aria-label="Minimize"
          icon={<FiMinus />}
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
        />
        <IconButton
          aria-label="Close"
          icon={<FiX />}
          variant="ghost"
          size="sm"
          colorScheme="red"
          onClick={handleClose}
        />
      </HStack>
    </Flex>
  );
};
