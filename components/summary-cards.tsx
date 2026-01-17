import { BorderRadius, Colors, Spacing, StatusColors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SummaryCardsProps {
    total: number;
    down: number;
    degraded: number;
    avgLatency: number;
}

export function SummaryCards({ total, down, degraded, avgLatency }: SummaryCardsProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const formatLatency = (ms: number) => {
        if (ms === 0) return '--';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.value, { color: colors.tint }]}>{total}</Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Total</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.value, { color: down > 0 ? StatusColors.down : colors.text }]}>
                    {down}
                </Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Down</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.value, { color: degraded > 0 ? StatusColors.degraded : colors.text }]}>
                    {degraded}
                </Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Slow</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.value, { color: colors.text }]}>{formatLatency(avgLatency)}</Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Avg</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    value: {
        ...Typography.title,
        marginBottom: 2,
    },
    label: {
        ...Typography.small,
    },
});
