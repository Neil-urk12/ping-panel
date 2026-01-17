import { ResponseViewer } from '@/components/response-viewer';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

interface ResponseData {
    status: number;
    statusText: string;
    latency: number;
    headers: Record<string, string>;
    body: string;
    error?: string;
}

export default function DebugScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [url, setUrl] = useState('');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<ResponseData | null>(null);

    const handleSend = async () => {
        if (!url.trim()) return;

        setIsLoading(true);
        setResponse(null);

        const startTime = Date.now();

        try {
            // Parse headers
            let headersObj: Record<string, string> = {};
            if (headers.trim()) {
                try {
                    headersObj = JSON.parse(headers);
                } catch {
                    setResponse({
                        status: 0,
                        statusText: 'Error',
                        latency: 0,
                        headers: {},
                        body: '',
                        error: 'Invalid headers JSON format',
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // Make the request
            const fetchOptions: RequestInit = {
                method,
                headers: headersObj,
            };

            if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
                fetchOptions.body = body;
                if (!headersObj['Content-Type']) {
                    headersObj['Content-Type'] = 'application/json';
                }
            }

            const res = await fetch(url, fetchOptions);
            const latency = Date.now() - startTime;

            // Get response headers
            const responseHeaders: Record<string, string> = {};
            res.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            // Get response body
            let responseBody = '';
            try {
                const text = await res.text();
                // Try to format as JSON if possible
                try {
                    const json = JSON.parse(text);
                    responseBody = JSON.stringify(json, null, 2);
                } catch {
                    responseBody = text;
                }
            } catch {
                responseBody = '[Unable to read response body]';
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                latency,
                headers: responseHeaders,
                body: responseBody,
            });

        } catch (error) {
            const latency = Date.now() - startTime;
            setResponse({
                status: 0,
                statusText: 'Network Error',
                latency,
                headers: {},
                body: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            });
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
                {/* URL Input */}
                <View style={styles.urlRow}>
                    <View style={[styles.methodDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Pressable onPress={() => {
                            const currentIndex = HTTP_METHODS.indexOf(method);
                            const nextIndex = (currentIndex + 1) % HTTP_METHODS.length;
                            setMethod(HTTP_METHODS[nextIndex]);
                        }}>
                            <Text style={[styles.methodDropdownText, { color: colors.tint }]}>{method}</Text>
                        </Pressable>
                    </View>
                    <TextInput
                        style={[
                            styles.urlInput,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text,
                            }
                        ]}
                        placeholder="https://api.example.com/endpoint"
                        placeholderTextColor={colors.textSecondary}
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                    />
                </View>

                {/* Headers Input */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Headers (JSON)</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.multilineInput,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
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
                        numberOfLines={2}
                    />
                </View>

                {/* Body Input (for POST/PUT/PATCH) */}
                {['POST', 'PUT', 'PATCH'].includes(method) && (
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Body</Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.multilineInput,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    color: colors.text,
                                }
                            ]}
                            placeholder='{"key": "value"}'
                            placeholderTextColor={colors.textSecondary}
                            value={body}
                            onChangeText={setBody}
                            autoCapitalize="none"
                            autoCorrect={false}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                )}

                {/* Send Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.sendButton,
                        {
                            backgroundColor: colors.tint,
                            opacity: pressed || isLoading ? 0.7 : 1,
                        }
                    ]}
                    onPress={handleSend}
                    disabled={isLoading || !url.trim()}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.sendText}>Send Request</Text>
                    )}
                </Pressable>

                {/* Response Viewer */}
                {response && <ResponseViewer response={response} />}
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
    urlRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    methodDropdown: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        justifyContent: 'center',
        minWidth: 70,
        alignItems: 'center',
    },
    methodDropdownText: {
        ...Typography.body,
        fontWeight: '700',
    },
    urlInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Typography.body,
    },
    field: {
        marginBottom: Spacing.md,
    },
    label: {
        ...Typography.small,
        marginBottom: Spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Typography.body,
    },
    multilineInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    sendButton: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sendText: {
        color: '#fff',
        ...Typography.body,
        fontWeight: '700',
    },
});
