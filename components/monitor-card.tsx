import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import type { Doc } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from './status-badge';
import { IconSymbol } from './ui/icon-symbol';

interface MonitorCardProps {
    monitor: Doc<"monitors">;
    onPress?: () => void;
}

export function MonitorCard({ monitor, onPress }: MonitorCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const formatLatency = (ms?: number) => {
        if (ms === undefined) return '--';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const formatUrl = (url: string) => {
        try {
            const parsed = new URL(url);
            return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
        } catch {
            return url;
        }
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderColor: 'transparent', // using shadow instead of border
                    ...Shadows.sm,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                }
            ]}
            onPress={onPress}
        >
            <View style={styles.header}>
                <StatusBadge status={monitor.currentStatus} />
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {monitor.name}
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.urlContainer}>
                <IconSymbol name="globe" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.url, { color: colors.textSecondary }]} numberOfLines={1}>
                    {formatUrl(monitor.url)}
                </Text>
            </View>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <View style={styles.stat}>
                    <View style={styles.statHeader}>
                        <IconSymbol name="speedometer" size={14} color={colors.textSecondary} />
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Latency</Text>
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {formatLatency(monitor.lastLatency)}
                    </Text>
                </View>

                <View style={[styles.statSeparator, { backgroundColor: colors.border }]} />

                <View style={styles.stat}>
                    <View style={styles.statHeader}>
                        <IconSymbol name="activity" size={14} color={colors.textSecondary} />
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status</Text>
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {monitor.lastStatusCode || '--'}
                    </Text>
                </View>

                <View style={[styles.statSeparator, { backgroundColor: colors.border }]} />

                <View style={styles.stat}>
                    <View style={styles.statHeader}>
                        <IconSymbol name="clock" size={14} color={colors.textSecondary} />
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Checked</Text>
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {formatTime(monitor.lastChecked)}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.xl, // More rounded
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    name: {
        ...Typography.subtitle,
        flex: 1,
        fontSize: 18,
    },
    urlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    url: {
        ...Typography.body,
        fontSize: 14,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    statLabel: {
        ...Typography.caption,
        fontSize: 12,
        fontWeight: '500',
    },
    statValue: {
        ...Typography.body,
        fontWeight: '700',
        fontSize: 15,
    },
    statSeparator: {
        width: 1,
        height: '80%',
        alignSelf: 'center',
    }
});
