import { StatusBadge } from '@/components/status-badge';
import { BorderRadius, Colors, Spacing, StatusColors, Typography } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMutation, useQuery } from 'convex/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
const FREQUENCIES = [
    { label: '1 min', value: 1 },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '30 min', value: 30 },
];

export default function MonitorDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const monitorId = id as Id<"monitors">;
    const monitor = useQuery(api.monitors.getMonitor, { id: monitorId });
    const logs = useQuery(api.monitors.getMonitorLogs, { monitorId, limit: 10 });

    const updateMonitor = useMutation(api.monitors.updateMonitor);
    const deleteMonitor = useMutation(api.monitors.deleteMonitor);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editName, setEditName] = useState('');
    const [editUrl, setEditUrl] = useState('');
    const [editMethod, setEditMethod] = useState('GET');
    const [editFrequency, setEditFrequency] = useState(5);

    const startEditing = () => {
        if (monitor) {
            setEditName(monitor.name);
            setEditUrl(monitor.url);
            setEditMethod(monitor.method);
            setEditFrequency(monitor.frequency);
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateMonitor({
                id: monitorId,
                name: editName,
                url: editUrl,
                method: editMethod,
                frequency: editFrequency,
            });
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update monitor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Monitor',
            `Are you sure you want to delete "${monitor?.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMonitor({ id: monitorId });
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete monitor');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleActive = async () => {
        if (!monitor) return;
        try {
            await updateMonitor({
                id: monitorId,
                isActive: !monitor.isActive,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update monitor');
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    if (!monitor) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: monitor.name,
                    headerRight: () => (
                        <Pressable onPress={isEditing ? handleSave : startEditing}>
                            <Text style={[styles.headerButton, { color: colors.tint }]}>
                                {isLoading ? '...' : isEditing ? 'Save' : 'Edit'}
                            </Text>
                        </Pressable>
                    ),
                }}
            />
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Status Section */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.statusRow}>
                        <StatusBadge status={monitor.currentStatus} size="large" showLabel />
                        <Pressable
                            style={[
                                styles.toggleButton,
                                {
                                    backgroundColor: monitor.isActive ? colors.up : colors.surfaceSecondary,
                                    borderColor: colors.border,
                                }
                            ]}
                            onPress={handleToggleActive}
                        >
                            <Text style={[styles.toggleText, { color: monitor.isActive ? '#fff' : colors.text }]}>
                                {monitor.isActive ? 'Active' : 'Paused'}
                            </Text>
                        </Pressable>
                    </View>

                    {monitor.lastChecked && (
                        <Text style={[styles.lastChecked, { color: colors.textSecondary }]}>
                            Last checked: {formatTime(monitor.lastChecked)}
                        </Text>
                    )}
                </View>

                {/* Details Section */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuration</Text>

                    {isEditing ? (
                        <>
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                                    value={editName}
                                    onChangeText={setEditName}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>URL</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                                    value={editUrl}
                                    onChangeText={setEditUrl}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Method</Text>
                                <View style={styles.methodContainer}>
                                    {HTTP_METHODS.map((m) => (
                                        <Pressable
                                            key={m}
                                            style={[
                                                styles.methodButton,
                                                {
                                                    backgroundColor: editMethod === m ? colors.tint : colors.surfaceSecondary,
                                                    borderColor: colors.border,
                                                }
                                            ]}
                                            onPress={() => setEditMethod(m)}
                                        >
                                            <Text style={{ color: editMethod === m ? '#fff' : colors.text }}>{m}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Frequency</Text>
                                <View style={styles.methodContainer}>
                                    {FREQUENCIES.map((f) => (
                                        <Pressable
                                            key={f.value}
                                            style={[
                                                styles.methodButton,
                                                {
                                                    backgroundColor: editFrequency === f.value ? colors.tint : colors.surfaceSecondary,
                                                    borderColor: colors.border,
                                                }
                                            ]}
                                            onPress={() => setEditFrequency(f.value)}
                                        >
                                            <Text style={{ color: editFrequency === f.value ? '#fff' : colors.text }}>{f.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>URL</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>{monitor.url}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Method</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{monitor.method}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Frequency</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{monitor.frequency} min</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Latency</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>
                                    {monitor.lastLatency ? `${monitor.lastLatency}ms` : '--'}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Recent Logs Section */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Checks</Text>

                    {logs && logs.length > 0 ? (
                        logs.map((log: Doc<"logs">) => (
                            <View key={log._id} style={[styles.logRow, { borderBottomColor: colors.border }]}>
                                <StatusBadge status={log.status} size="small" />
                                <View style={styles.logInfo}>
                                    <Text style={[styles.logStatus, { color: colors.text }]}>
                                        {log.statusCode || 'Error'} • {log.latency}ms
                                    </Text>
                                    <Text style={[styles.logTime, { color: colors.textSecondary }]}>
                                        {formatTime(log.timestamp)}
                                    </Text>
                                </View>
                                {log.errorMessage && (
                                    <Text style={[styles.logError, { color: colors.down }]} numberOfLines={1}>
                                        {log.errorMessage}
                                    </Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No check history yet
                        </Text>
                    )}
                </View>

                {/* Delete Button */}
                <Pressable
                    style={[styles.deleteButton, { backgroundColor: `${StatusColors.down}15` }]}
                    onPress={handleDelete}
                >
                    <Text style={[styles.deleteText, { color: StatusColors.down }]}>Delete Monitor</Text>
                </Pressable>

                <View style={{ height: Spacing.xl * 2 }} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButton: {
        ...Typography.body,
        fontWeight: '600',
    },
    section: {
        margin: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    sectionTitle: {
        ...Typography.subtitle,
        marginBottom: Spacing.md,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    toggleText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    lastChecked: {
        ...Typography.caption,
        marginTop: Spacing.sm,
    },
    field: {
        marginBottom: Spacing.md,
    },
    label: {
        ...Typography.caption,
        marginBottom: Spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        ...Typography.body,
    },
    methodContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    methodButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
    },
    detailLabel: {
        ...Typography.body,
    },
    detailValue: {
        ...Typography.body,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        gap: Spacing.sm,
    },
    logInfo: {
        flex: 1,
    },
    logStatus: {
        ...Typography.caption,
        fontWeight: '600',
    },
    logTime: {
        ...Typography.small,
    },
    logError: {
        ...Typography.small,
        maxWidth: 100,
    },
    emptyText: {
        ...Typography.body,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: Spacing.md,
    },
    deleteButton: {
        margin: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    deleteText: {
        ...Typography.body,
        fontWeight: '600',
    },
});
