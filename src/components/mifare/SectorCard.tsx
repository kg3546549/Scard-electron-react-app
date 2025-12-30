/**
 * Sector Card Component
 * Mifare 섹터 카드 표시 컴포넌트
 */

import React from 'react';
import { Card, CardHeader, CardBody, Heading, Stack, Box } from '@chakra-ui/react';
import { MifareSector } from '../../types';

interface SectorCardProps {
    sector: MifareSector;
    isSelected: boolean;
    onClick: () => void;
}

export const SectorCard: React.FC<SectorCardProps> = ({ sector, isSelected, onClick }) => {
    return (
        <Card
            bg="gray.50"
            border={isSelected ? '2px' : '0px'}
            borderColor="blue.500"
            cursor="pointer"
            onClick={onClick}
            _hover={{ shadow: 'md' }}
            transition="all 0.2s"
        >
            <CardHeader pb={2}>
                <Heading size="xs">Sector {sector.sectorNumber}</Heading>
            </CardHeader>
            <CardBody pt={0}>
                <Stack spacing={1}>
                    {sector.blocks.map((block: any, index: number) => (
                        <Box
                            key={index}
                            p={1}
                            bg={index === 3 ? 'gray.200' : 'white'}
                            borderRadius="sm"
                            textAlign="center"
                            fontSize="xs"
                            fontFamily="mono"
                        >
                            {block || '-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --'}
                        </Box>
                    ))}
                </Stack>
            </CardBody>
        </Card>
    );
};
