import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getDashboard } from '@/lib/api/dashboard';
import { DashboardSummaryItem } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : 'Sem registro');

export default function DashboardScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { data, isFetching, refetch } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
  });

  const items = data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: DashboardSummaryItem }) => (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Veículo: {item.vehiclePlate ?? item.vehicleId}</Text>
        <Text style={{ color: colors.textMuted }}>
          Total de manutenções: <Text style={{ color: colors.text }}>{item.totalMaintenances}</Text>
        </Text>
        <Text style={{ color: colors.textMuted }}>
          Última manutenção: <Text style={{ color: colors.text }}>{formatDate(item.lastMaintenanceDate)}</Text>
        </Text>
        <Text style={{ color: colors.textMuted }}>
          Próxima revisão:{' '}
          <Text style={{ color: colors.text }}>
            {item.nextMaintenanceKm ? `${item.nextMaintenanceKm.toLocaleString()} km` : 'Não definido'}
          </Text>
        </Text>
        <Text
          style={{
            color: item.overdue ? colors.secondary : colors.primary,
            fontWeight: '600',
          }}>
          {item.overdue ? 'Manutenção em atraso' : 'Cronograma em dia'}
        </Text>
      </View>
    ),
    [colors],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
        data={items}
        keyExtractor={(item) => item.vehicleId}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Acompanhe os indicadores gerais dos seus veículos.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.textMuted }}>Cadastre um veículo para ver seus indicadores aqui.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 24,
  },
  header: {
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});
