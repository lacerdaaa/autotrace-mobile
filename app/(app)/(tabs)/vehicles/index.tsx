import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Vehicle } from '@/lib/api/types';
import { listVehicles } from '@/lib/api/vehicles';
import { queryKeys } from '@/lib/query-keys';

export default function VehiclesScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { data, isFetching, refetch } = useQuery({
    queryKey: queryKeys.vehicles.root,
    queryFn: listVehicles,
  });

  const vehicles = data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Vehicle }) => (
      <Pressable
        onPress={() => router.push(`/(app)/vehicles/${item.id}`)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {item.manufacturer} {item.model}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {item.category} • {item.year}
            </Text>
            <Text style={[styles.cardBadge, { color: colors.secondary }]}>{item.plate}</Text>
            <Text style={{ color: colors.textMuted }}>
              Média mensal: <Text style={{ color: colors.text }}>{item.averageMonthlyKm.toLocaleString()} km</Text>
            </Text>
          </View>
          {item.photoUrl ? (
            <Image
              source={{ uri: item.photoUrl }}
              style={[styles.cardPhoto, { borderColor: colors.border }]}
              resizeMode="cover"
            />
          ) : null}
        </View>
      </Pressable>
    ),
    [colors],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={{ gap: 6 }}>
              <Text style={[styles.title, { color: colors.text }]}>Veículos</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Cadastre e acompanhe seus veículos e manutenções.
              </Text>
            </View>
            <Button label="Adicionar veículo" onPress={() => router.push('/(app)/vehicles/new')} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 12 }}>
              Nenhum veículo cadastrado ainda.
            </Text>
            <Link href="/(app)/vehicles/new" style={{ color: colors.secondary }}>
              Cadastrar agora
            </Link>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
  },
  header: {
    gap: 16,
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
    gap: 6,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardBadge: {
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  cardPhoto: {
    width: 84,
    height: 84,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#f2f2f2',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});
