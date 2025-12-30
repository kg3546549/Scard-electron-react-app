/**
 * Diagram Toolbar Component
 * 다이어그램 도구 모음
 */

import React from 'react';
import { HStack, Button, ButtonGroup, Divider } from '@chakra-ui/react';
import {
    FaPlay,
    FaPause,
    FaStop,
    FaSave,
    FaFolderOpen,
    FaTrash,
    FaPlus,
} from 'react-icons/fa';

interface DiagramToolbarProps {
    onExecute: () => void;
    onPause: () => void;
    onStop: () => void;
    onSave: () => void;
    onLoad: () => void;
    onClear: () => void;
    onNew: () => void;
    isExecuting: boolean;
    isPaused: boolean;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
    onExecute,
    onPause,
    onStop,
    onSave,
    onLoad,
    onClear,
    onNew,
    isExecuting,
    isPaused,
}) => {
    return (
        <HStack spacing={2} p={2} bg="gray.50" borderRadius="md">
            <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                    leftIcon={<FaPlay />}
                    onClick={onExecute}
                    isDisabled={isExecuting && !isPaused}
                    colorScheme="green"
                >
                    {isPaused ? 'Resume' : 'Execute'}
                </Button>
                <Button
                    leftIcon={<FaPause />}
                    onClick={onPause}
                    isDisabled={!isExecuting || isPaused}
                    colorScheme="yellow"
                >
                    Pause
                </Button>
                <Button
                    leftIcon={<FaStop />}
                    onClick={onStop}
                    isDisabled={!isExecuting}
                    colorScheme="red"
                >
                    Stop
                </Button>
            </ButtonGroup>

            <Divider orientation="vertical" h="30px" />

            <ButtonGroup size="sm" variant="outline">
                <Button leftIcon={<FaPlus />} onClick={onNew}>
                    New
                </Button>
                <Button leftIcon={<FaSave />} onClick={onSave}>
                    Save
                </Button>
                <Button leftIcon={<FaFolderOpen />} onClick={onLoad}>
                    Load
                </Button>
                <Button leftIcon={<FaTrash />} onClick={onClear} colorScheme="red">
                    Clear
                </Button>
            </ButtonGroup>
        </HStack>
    );
};
