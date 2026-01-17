import { MonitorCard } from '@/components/monitor-card';
import { SummaryCards } from '@/components/summary-cards';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const monitors = useQuery(api.monitors.getMonitors);
  const stats = useQuery(api.monitors.getDashboardStats);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Convex automatically refetches, so we just need a visual delay
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleMonitorPress = (monitorId: string) => {
    router.push(`/monitor/${monitorId}`);
  };

  if (monitors === undefined || stats === undefined) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading monitors...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={monitors}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MonitorCard
            monitor={item}
            onPress={() => handleMonitorPress(item._id)}
          />
        )}
        ListHeaderComponent={
          <>
            <SummaryCards
              total={stats.total}
              down={stats.down}
              degraded={stats.degraded}
              avgLatency={stats.avgLatency}
            />
            {monitors.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Monitors
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyEmoji]}>📡</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No monitors yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your first monitor to start tracking uptime
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        contentContainerStyle={monitors.length === 0 ? styles.emptyList : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },
  sectionTitle: {
    ...Typography.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.subtitle,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
});
