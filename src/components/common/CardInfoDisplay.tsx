/**
 * Card Info Display Component
 * 카드 정보 표시 컴포넌트
 */

import React from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { CardInfo } from '../../types';

interface CardInfoDisplayProps {
    cardInfo: CardInfo | null;
}

export const CardInfoDisplay: React.FC<CardInfoDisplayProps> = ({ cardInfo }) => {
    if (!cardInfo) {
        return (
            <Box p={4} bg="gray.50" borderRadius="md">
                <Text color="gray.500">No card detected</Text>
            </Box>
        );
    }

    const infoItems = [
        { label: 'Card Type', value: cardInfo.type },
        { label: 'ATR', value: cardInfo.atr },
        { label: 'UID', value: cardInfo.uid },
        { label: 'SAK', value: cardInfo.sak || '-' },
        { label: 'ATS', value: cardInfo.ats || '-' },
    ];

    return (
        <VStack align="stretch" spacing={2}>
            {infoItems.map((item) => (
                <Flex key={item.label} justify="space-between">
                    <Text fontWeight="medium">{item.label}</Text>
                    <Text fontFamily="mono" fontSize="sm">
                        {item.value}
                    </Text>
                </Flex>
            ))}
        </VStack>
    );
};
