/**
 * Status Badge Component
 * 상태 뱃지 컴포넌트
 */

import React from 'react';
import { Badge } from '@chakra-ui/react';
import { CardReadingStatus } from '../../types';

interface StatusBadgeProps {
    status: CardReadingStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getColorScheme = () => {
        switch (status) {
            case CardReadingStatus.SUCCESS:
                return 'green';
            case CardReadingStatus.READING:
            case CardReadingStatus.DETECTING:
                return 'yellow';
            case CardReadingStatus.ERROR:
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Badge colorScheme={getColorScheme()} fontSize="sm">
            {status}
        </Badge>
    );
};
