import { StatusColors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Status = 'UP' | 'DOWN' | 'DEGRADED' | 'PENDING';

interface StatusBadgeProps {
    status: Status;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
}

const statusConfig = {
    UP: { color: StatusColors.up, label: 'Up', emoji: '🟢' },
    DOWN: { color: StatusColors.down, label: 'Down', emoji: '🔴' },
    DEGRADED: { color: StatusColors.degraded, label: 'Slow', emoji: '🟡' },
    PENDING: { color: StatusColors.pending, label: 'Pending', emoji: '⚪' },
};

const sizeConfig = {
    small: { dot: 8, fontSize: 10 },
    medium: { dot: 12, fontSize: 12 },
    large: { dot: 16, fontSize: 14 },
};

export function StatusBadge({ status, size = 'medium', showLabel = false }: StatusBadgeProps) {
    const config = statusConfig[status];
    const sizes = sizeConfig[size];

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.dot,
                    {
                        backgroundColor: config.color,
                        width: sizes.dot,
                        height: sizes.dot,
                        borderRadius: sizes.dot / 2,
                    }
                ]}
            />
            {showLabel && (
                <Text style={[styles.label, { color: config.color, fontSize: sizes.fontSize }]}>
                    {config.label}
                </Text>
            )}
        </View>
    );
}

// Text-only status indicator with emoji
export function StatusEmoji({ status }: { status: Status }) {
    return <Text style={styles.emoji}>{statusConfig[status].emoji}</Text>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontWeight: '600',
    },
    emoji: {
        fontSize: 16,
    },
});
