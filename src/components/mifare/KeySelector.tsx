/**
 * Key Selector Component
 * Mifare 키 선택 컴포넌트
 */

import React from 'react';
import {
    Stack,
    Flex,
    Text,
    Select,
    RadioGroup,
    Radio,
    HStack,
} from '@chakra-ui/react';
import { MifareKeyType, MifareKeyConfig } from '../../types';
import { HexInput } from '../common';

interface KeySelectorProps {
    keyConfig: MifareKeyConfig;
    onChange: (config: MifareKeyConfig) => void;
}

export const KeySelector: React.FC<KeySelectorProps> = ({ keyConfig, onChange }) => {
    const predefinedKeys = [
        { label: 'Default (FFFFFFFFFFFF)', value: 'FFFFFFFFFFFF' },
        { label: 'Zeros (000000000000)', value: '000000000000' },
        { label: 'Custom', value: 'custom' },
    ];

    const [selectedPreset, setSelectedPreset] = React.useState(
        predefinedKeys.find(k => k.value === keyConfig.keyValue)?.value || 'custom'
    );

    const handleKeyTypeChange = (value: string) => {
        onChange({
            ...keyConfig,
            keyType: value as MifareKeyType,
        });
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPreset(value);

        if (value !== 'custom') {
            onChange({
                ...keyConfig,
                keyValue: value,
            });
        }
    };

    const handleCustomKeyChange = (value: string) => {
        onChange({
            ...keyConfig,
            keyValue: value,
        });
    };

    return (
        <Stack spacing={4}>
            {/* Key Type Selection */}
            <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Key Type</Text>
                <RadioGroup value={keyConfig.keyType} onChange={handleKeyTypeChange}>
                    <HStack spacing={4}>
                        <Radio value={MifareKeyType.KEY_A}>Key A</Radio>
                        <Radio value={MifareKeyType.KEY_B}>Key B</Radio>
                    </HStack>
                </RadioGroup>
            </Flex>

            {/* Preset Key Selection */}
            <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Key Preset</Text>
                <Select w="200px" value={selectedPreset} onChange={handlePresetChange}>
                    {predefinedKeys.map((key: { label: string; value: string }, index: number) => (
                        <option key={key.value} value={key.value}>
                            {key.label}
                        </option>
                    ))}
                </Select>
            </Flex>

            {/* Custom Key Input */}
            {selectedPreset === 'custom' && (
                <HexInput
                    label="Custom Key"
                    value={keyConfig.keyValue}
                    onChange={handleCustomKeyChange}
                    maxLength={12}
                />
            )}
        </Stack>
    );
};
