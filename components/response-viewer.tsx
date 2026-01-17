import { BorderRadius, Colors, Spacing, StatusColors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ResponseData {
    status: number;
    statusText: string;
    latency: number;
    headers: Record<string, string>;
    body: string;
    error?: string;
}

interface ResponseViewerProps {
    response: ResponseData;
}

type Tab = 'body' | 'headers';

export function ResponseViewer({ response }: ResponseViewerProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [activeTab, setActiveTab] = useState<Tab>('body');

    const getStatusColor = (status: number) => {
        if (status === 0) return StatusColors.down;
        if (status >= 200 && status < 300) return StatusColors.up;
        if (status >= 400) return StatusColors.down;
        return StatusColors.degraded;
    };

    const statusColor = getStatusColor(response.status);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Status Bar */}
            <View style={styles.statusBar}>
                <View style={styles.statusInfo}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusCode}>
                            {response.status || 'ERR'}
                        </Text>
                    </View>
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                        {response.statusText}
                    </Text>
                </View>
                <Text style={[styles.latency, { color: colors.textSecondary }]}>
                    {response.latency}ms
                </Text>
            </View>

            {/* Error Message */}
            {response.error && (
                <View style={[styles.errorBox, { backgroundColor: `${StatusColors.down}20` }]}>
                    <Text style={[styles.errorText, { color: StatusColors.down }]}>
                        {response.error}
                    </Text>
                </View>
            )}

            {/* Tabs */}
            <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
                <Pressable
                    style={[
                        styles.tab,
                        activeTab === 'body' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }
                    ]}
                    onPress={() => setActiveTab('body')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'body' ? colors.tint : colors.textSecondary }
                    ]}>
                        Body
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.tab,
                        activeTab === 'headers' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }
                    ]}
                    onPress={() => setActiveTab('headers')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'headers' ? colors.tint : colors.textSecondary }
                    ]}>
                        Headers ({Object.keys(response.headers).length})
                    </Text>
                </Pressable>
            </View>

            {/* Tab Content */}
            <ScrollView
                style={styles.content}
                horizontal={activeTab === 'body'}
                showsHorizontalScrollIndicator={activeTab === 'body'}
            >
                {activeTab === 'body' ? (
                    <ScrollView nestedScrollEnabled>
                        <Text style={[styles.codeText, { color: colors.text }]}>
                            {response.body || '[Empty response]'}
                        </Text>
                    </ScrollView>
                ) : (
                    <View style={styles.headersContainer}>
                        {Object.entries(response.headers).map(([key, value]) => (
                            <View key={key} style={styles.headerRow}>
                                <Text style={[styles.headerKey, { color: colors.tint }]}>{key}:</Text>
                                <Text style={[styles.headerValue, { color: colors.text }]} numberOfLines={2}>
                                    {value}
                                </Text>
                            </View>
                        ))}
                        {Object.keys(response.headers).length === 0 && (
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No headers
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusCode: {
        color: '#fff',
        ...Typography.body,
        fontWeight: '700',
    },
    statusText: {
        ...Typography.body,
    },
    latency: {
        ...Typography.caption,
        fontWeight: '600',
    },
    errorBox: {
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    errorText: {
        ...Typography.caption,
        fontWeight: '500',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
    },
    tabText: {
        ...Typography.body,
        fontWeight: '600',
    },
    content: {
        maxHeight: 300,
        padding: Spacing.md,
    },
    codeText: {
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 18,
    },
    headersContainer: {
        gap: Spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    headerKey: {
        ...Typography.caption,
        fontWeight: '600',
    },
    headerValue: {
        ...Typography.caption,
        flex: 1,
    },
    emptyText: {
        ...Typography.body,
        fontStyle: 'italic',
    },
});
