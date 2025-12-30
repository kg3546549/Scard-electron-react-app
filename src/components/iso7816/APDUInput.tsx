/**
 * APDU Input Component
 * APDU 입력 컴포넌트
 */

import React from 'react';
import { Stack, Flex, Button, useToast } from '@chakra-ui/react';
import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
import { HexInput } from '../common';

interface APDUInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => Promise<void>;
    onClear: () => void;
    isLoading?: boolean;
}

export const APDUInput: React.FC<APDUInputProps> = ({
    value,
    onChange,
    onSend,
    onClear,
    isLoading = false,
}) => {
    const toast = useToast();

    const handleSend = async () => {
        if (value.length < 8) {
            toast({
                title: 'Invalid Command',
                description: 'Command must be at least 4 bytes (8 hex characters)',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (value.length % 2 !== 0) {
            toast({
                title: 'Invalid Command',
                description: 'Command length must be even',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        await onSend();
    };

    return (
        <Stack spacing={3}>
            <HexInput
                label="APDU Command"
                value={value}
                onChange={onChange}
                placeholder="Enter APDU Command (hex format)"
            />
            <Flex gap={3}>
                <Button
                    leftIcon={<FaPaperPlane />}
                    colorScheme="blue"
                    onClick={handleSend}
                    isLoading={isLoading}
                    flex={1}
                >
                    Send
                </Button>
                <Button
                    leftIcon={<FaXmark />}
                    onClick={onClear}
                >
                    Clear
                </Button>
            </Flex>
        </Stack>
    );
};
