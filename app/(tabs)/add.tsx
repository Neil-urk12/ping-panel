import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
const FREQUENCIES = [
    { label: '1 min', value: 1 },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
];

export default function AddMonitorScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const addMonitor = useMutation(api.monitors.addMonitor);

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState('');
    const [frequency, setFrequency] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateUrl = (urlString: string): boolean => {
        try {
            const parsed = new URL(urlString);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validateHeaders = (headersString: string): boolean => {
        if (!headersString.trim()) return true;
        try {
            JSON.parse(headersString);
            return true;
        } catch {
            return false;
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!url.trim()) {
            newErrors.url = 'URL is required';
        } else if (!validateUrl(url)) {
            newErrors.url = 'Invalid URL format (must start with http:// or https://)';
        }

        if (headers.trim() && !validateHeaders(headers)) {
            newErrors.headers = 'Headers must be valid JSON';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            await addMonitor({
                name: name.trim(),
                url: url.trim(),
                method,
                headers: headers.trim() || undefined,
                frequency,
            });

            // Reset form
            setName('');
            setUrl('');
            setMethod('GET');
            setHeaders('');
            setFrequency(5);

            // Navigate to dashboard
            router.replace('/(tabs)');

        } catch (error) {
            Alert.alert('Error', 'Failed to add monitor. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Name Input */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.text }]}>Service Name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.surface,
                                borderColor: errors.name ? colors.down : colors.border,
                                color: colors.text,
                            }
                        ]}
                        placeholder="My API"
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    {errors.name && <Text style={[styles.error, { color: colors.down }]}>{errors.name}</Text>}
                </View>

                {/* URL Input */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.text }]}>URL</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.surface,
                                borderColor: errors.url ? colors.down : colors.border,
                                color: colors.text,
                            }
                        ]}
                        placeholder="https://api.example.com/health"
                        placeholderTextColor={colors.textSecondary}
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                    />
                    {errors.url && <Text style={[styles.error, { color: colors.down }]}>{errors.url}</Text>}
                </View>

                {/* Method Selector */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.text }]}>HTTP Method</Text>
                    <View style={styles.methodContainer}>
                        {HTTP_METHODS.slice(0, 4).map((m) => (
                            <Pressable
                                key={m}
                                style={[
                                    styles.methodButton,
                                    {
                                        backgroundColor: method === m ? colors.tint : colors.surface,
                                        borderColor: colors.border,
                                    }
                                ]}
                                onPress={() => setMethod(m)}
                            >
                                <Text style={[
                                    styles.methodText,
                                    { color: method === m ? '#fff' : colors.text }
                                ]}>
                                    {m}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Frequency Selector */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.text }]}>Check Frequency</Text>
                    <View style={styles.frequencyContainer}>
                        {FREQUENCIES.map((f) => (
                            <Pressable
                                key={f.value}
                                style={[
                                    styles.frequencyButton,
                                    {
                                        backgroundColor: frequency === f.value ? colors.tint : colors.surface,
                                        borderColor: colors.border,
                                    }
                                ]}
                                onPress={() => setFrequency(f.value)}
                            >
                                <Text style={[
                                    styles.frequencyText,
                                    { color: frequency === f.value ? '#fff' : colors.text }
                                ]}>
                                    {f.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Headers Input */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.text }]}>Headers (JSON, optional)</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.multilineInput,
                            {
                                backgroundColor: colors.surface,
                                borderColor: errors.headers ? colors.down : colors.border,
                                color: colors.text,
                            }
                        ]}
                        placeholder='{"Authorization": "Bearer token"}'
                        placeholderTextColor={colors.textSecondary}
                        value={headers}
                        onChangeText={setHeaders}
                        autoCapitalize="none"
                        autoCorrect={false}
                        multiline
                        numberOfLines={3}
                    />
                    {errors.headers && <Text style={[styles.error, { color: colors.down }]}>{errors.headers}</Text>}
                </View>

                {/* Submit Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.submitButton,
                        {
                            backgroundColor: colors.tint,
                            opacity: pressed || isLoading ? 0.7 : 1,
                        }
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Add Monitor</Text>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xl * 2,
    },
    field: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography.body,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Typography.body,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    error: {
        ...Typography.small,
        marginTop: Spacing.xs,
    },
    methodContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    methodButton: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    methodText: {
        ...Typography.body,
        fontWeight: '600',
    },
    frequencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    frequencyButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    frequencyText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    submitButton: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    submitText: {
        color: '#fff',
        ...Typography.body,
        fontWeight: '700',
    },
});
