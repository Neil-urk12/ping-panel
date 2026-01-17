import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import type { Doc } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from './status-badge';

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
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                }
            ]}
            onPress={onPress}
        >
            <View style={styles.header}>
                <StatusBadge status={monitor.currentStatus} />
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {monitor.name}
                </Text>
            </View>

            <Text style={[styles.url, { color: colors.textSecondary }]} numberOfLines={1}>
                {formatUrl(monitor.url)}
            </Text>

            <View style={styles.footer}>
                <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Latency</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {formatLatency(monitor.lastLatency)}
                    </Text>
                </View>

                <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {monitor.lastStatusCode || '--'}
                    </Text>
                </View>

                <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Checked</Text>
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
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
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
    },
    url: {
        ...Typography.caption,
        marginBottom: Spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        ...Typography.small,
        marginBottom: 2,
    },
    statValue: {
        ...Typography.body,
        fontWeight: '600',
    },
});
