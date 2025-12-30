/**
 * Quick Commands Component
 * 빠른 APDU 명령어 버튼 컴포넌트
 */

import { HexInput } from '../common';
import { Stack, Button } from '@chakra-ui/react';
import { QuickAPDUCommand } from '../../types';

interface QuickCommandsProps {
    commands: QuickAPDUCommand[];
    onSelect: (template: string) => void;
}

export const QuickCommands: React.FC<QuickCommandsProps> = ({ commands, onSelect }) => {
    return (
        <Stack spacing={3}>
            {commands.map((command: QuickAPDUCommand, index: number) => (
                <Button
                    key={command.name}
                    onClick={() => onSelect(command.template)}
                    size="sm"
                    variant="outline"
                >
                    {command.name}
                </Button>
            ))}
        </Stack>
    );
};
