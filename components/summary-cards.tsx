import { BorderRadius, Colors, Shadows, Spacing, StatusColors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

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
            <View style={[styles.card, { backgroundColor: colors.surface, ...Shadows.sm }]}>
                <View style={styles.iconContainer}>
                    <IconSymbol name="server.rack" size={20} color={colors.tint} />
                </View>
                <Text style={[styles.value, { color: colors.text }]}>{total}</Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Total</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, ...Shadows.sm }]}>
                <View style={[styles.iconContainer, { backgroundColor: down > 0 ? StatusColors.down + '20' : colors.surfaceSecondary }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={20} color={down > 0 ? StatusColors.down : colors.textSecondary} />
                </View>
                <Text style={[styles.value, { color: down > 0 ? StatusColors.down : colors.text }]}>
                    {down}
                </Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Down</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, ...Shadows.sm }]}>
                <View style={[styles.iconContainer, { backgroundColor: degraded > 0 ? StatusColors.degraded + '20' : colors.surfaceSecondary }]}>
                    <IconSymbol name="activity" size={20} color={degraded > 0 ? StatusColors.degraded : colors.textSecondary} />
                </View>
                <Text style={[styles.value, { color: degraded > 0 ? StatusColors.degraded : colors.text }]}>
                    {degraded}
                </Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Slow</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, ...Shadows.sm }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                    <IconSymbol name="bolt.fill" size={20} color={colors.textSecondary} />
                </View>
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
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        // Removed border, strictly using shadow now
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        backgroundColor: '#EEF2FF', // Indigo 50
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    value: {
        ...Typography.title,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 0,
    },
    label: {
        ...Typography.caption,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
