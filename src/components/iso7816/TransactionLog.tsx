/**
 * Transaction Log Component
 * APDU 트랜잭션 로그 컴포넌트
 */

import React from 'react';
import {
    Box,
    Stack,
    Text,
    Badge,
    Divider,
} from '@chakra-ui/react';
import { APDUTransaction } from '../../types';

interface TransactionLogProps {
    transactions: APDUTransaction[];
    onClear: () => void;
    onSelectCommand?: (command: string) => void;
}

interface TransactionItemProps {
    transaction: APDUTransaction;
    onClick?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onClick }) => {
    return (
        <Box
            p={3}
            cursor={onClick ? 'pointer' : 'default'}
            _hover={onClick ? { bg: 'gray.50' } : {}}
            onClick={onClick}
            borderRadius="md"
        >
            <Stack direction="row" spacing={2} align="center">
                <Divider
                    orientation="vertical"
                    border="3px solid"
                    borderRadius="lg"
                    borderColor="blue.500"
                    h="80px"
                />
                <Stack spacing={1} flex={1}>
                    <Text fontSize="sm">
                        <Badge colorScheme="blue" mr={2}>
                            Reader
                        </Badge>
                        {transaction.command}
                    </Text>
                    <Text fontSize="sm" color="green.500" fontWeight="bold">
                        <Badge colorScheme="green" mr={2}>
                            Card
                        </Badge>
                        {transaction.response}
                    </Text>
                </Stack>
            </Stack>
        </Box>
    );
};

export const TransactionLog: React.FC<TransactionLogProps> = ({
    transactions,
    onClear,
    onSelectCommand,
}) => {
    if (transactions.length === 0) {
        return (
            <Box p={4} textAlign="center" color="gray.500">
                No transactions yet
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={2}>
                {transactions.map((transaction) => (
                    <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onClick={
                            onSelectCommand
                                ? () => onSelectCommand(transaction.command)
                                : undefined
                        }
                    />
                ))}
            </Stack>
        </Box>
    );
};
