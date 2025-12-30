/**
 * Hex Input Component
 * Hex 입력 필드 컴포넌트
 */

import React, { useState } from 'react';
import { Input, InputProps, FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';

interface HexInputProps extends Omit<InputProps, 'onChange'> {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    validateLength?: boolean;
}

export const HexInput: React.FC<HexInputProps> = ({
    label,
    value,
    onChange,
    maxLength,
    validateLength = true,
    ...inputProps
}) => {
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');

        // 길이 검증
        if (validateLength && newValue.length % 2 !== 0 && newValue.length > 0) {
            setError('Hex string must have even length');
        } else {
            setError('');
        }

        onChange(newValue);
    };

    const inputElement = (
        <Input
            {...inputProps}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            fontFamily="mono"
            placeholder="Enter hex value (e.g., FFFFFFFFFFFF)"
            isInvalid={!!error}
        />
    );

    if (label) {
        return (
            <FormControl isInvalid={!!error}>
                <FormLabel>{label}</FormLabel>
                {inputElement}
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        );
    }

    return inputElement;
};
