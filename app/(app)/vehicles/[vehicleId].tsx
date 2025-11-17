import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getApiErrorMessage, isApiError } from '@/lib/api/client';
import { getVehicleDetails, uploadVehiclePhoto } from '@/lib/api/vehicles';
import { MaintenanceRecord, MaintenanceSuggestions } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

const formatKm = (value: number | null | undefined) =>
  typeof value === 'number' ? `${value.toLocaleString()} km` : 'Não definido';

type ThemeColors = (typeof Colors)['light'];

const SuggestionsSection = ({ suggestions, colors }: { suggestions: MaintenanceSuggestions; colors: ThemeColors }) => (
  <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
    <Text style={[styles.sectionTitle, { color: colors.text }]}>Próxima manutenção</Text>
    <Text style={{ color: colors.textMuted }}>
      Quilometragem estimada: <Text style={{ color: colors.text }}>{suggestions.estimatedCurrentKm.toLocaleString()} km</Text>
    </Text>
    <Text style={{ color: colors.textMuted }}>
      Média mensal: <Text style={{ color: colors.text }}>{suggestions.monthlyAverageKm.toLocaleString()} km</Text>
    </Text>
    <Text style={{ color: colors.textMuted }}>
      Próxima revisão: <Text style={{ color: colors.text }}>{formatKm(suggestions.nextMaintenanceKm)}</Text>
    </Text>
    <Text style={{ color: suggestions.overdue ? colors.secondary : colors.primary, fontWeight: '600' }}>
      {suggestions.overdue ? 'Manutenção em atraso' : 'Cronograma em dia'}
      {suggestions.estimatedDueDate
        ? ` • Prevista para ${new Date(suggestions.estimatedDueDate).toLocaleDateString()}`
        : ''}
    </Text>

    <View style={{ gap: 6, marginTop: 12 }}>
      <Text style={[styles.listTitle, { color: colors.text }]}>Checklist sugerido</Text>
      {suggestions.checklist?.length ? (
        suggestions.checklist.map((item) => (
          <Text key={item} style={{ color: colors.textMuted }}>
            • {item}
          </Text>
        ))
      ) : (
        <Text style={{ color: colors.textMuted }}>Nenhum item sugerido.</Text>
      )}
    </View>

    <View style={{ gap: 6, marginTop: 12 }}>
      <Text style={[styles.listTitle, { color: colors.text }]}>Próximos checkpoints</Text>
      {suggestions.upcoming?.length ? (
        suggestions.upcoming.map((checkpoint) => (
          <Text key={checkpoint.kmMark} style={{ color: checkpoint.overdue ? colors.secondary : colors.text }}>
            {checkpoint.kmMark.toLocaleString()} km • {checkpoint.overdue ? 'Atrasado' : 'Dentro do prazo'}
          </Text>
        ))
      ) : (
        <Text style={{ color: colors.textMuted }}>Nenhum checkpoint cadastrado.</Text>
      )}
    </View>
  </View>
);

const MaintenanceItem = ({
  record,
  colors,
  onOpenDocument,
}: {
  record: MaintenanceRecord;
  colors: ThemeColors;
  onOpenDocument: (url: string) => void;
}) => (
  <View style={[styles.maintenanceCard, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
    <Text style={[styles.maintenanceTitle, { color: colors.text }]}>{record.serviceType}</Text>
    <Text style={{ color: colors.textMuted }}>Data: <Text style={{ color: colors.text }}>{formatDate(record.serviceDate)}</Text></Text>
    <Text style={{ color: colors.textMuted }}>Odômetro: <Text style={{ color: colors.text }}>{record.odometer.toLocaleString()} km</Text></Text>
    <Text style={{ color: colors.textMuted }}>Oficina: <Text style={{ color: colors.text }}>{record.workshop}</Text></Text>
    {record.notes ? <Text style={{ color: colors.textMuted }}>Observações: <Text style={{ color: colors.text }}>{record.notes}</Text></Text> : null}
    {record.documentUrl ? (
      <Button
        label="Abrir documento"
        onPress={() => onOpenDocument(record.documentUrl!)}
        variant="ghost"
        style={{ marginTop: 8, borderStyle: 'dashed' }}
        textStyle={{ fontSize: 14 }}
      />
    ) : null}
  </View>
);

export default function VehicleDetailsScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const params = useLocalSearchParams<{ vehicleId: string }>();
  const vehicleId = params.vehicleId ?? '';
  const queryClient = useQueryClient();
  const vehicleQueryKey = useMemo(() => queryKeys.vehicles.detail(vehicleId), [vehicleId]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: vehicleQueryKey,
    queryFn: () => getVehicleDetails(vehicleId),
    enabled: Boolean(vehicleId),
  });

  const vehicle = data?.vehicle;
  const maintenances = data?.maintenances ?? [];
  const suggestions = data?.suggestions;

  const photoMutation = useMutation({
    mutationFn: uploadVehiclePhoto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: vehicleQueryKey });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.root });
    },
    onError: (error) => {
      const message = isApiError(error)
        ? getApiErrorMessage(error)
        : error instanceof Error
          ? error.message
          : 'Não foi possível enviar a foto.';
      Alert.alert('Erro ao enviar foto', message);
    },
  });

  const handleOpenDocument = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const fileName =
      asset.fileName ?? `vehicle-${vehicleId}-${Date.now()}.${mimeType.split('/')[1] ?? 'jpg'}`.replace(/[^a-zA-Z0-9.-]/g, '');

    photoMutation.mutate({
      vehicleId,
      uri: asset.uri,
      mimeType,
      fileName,
    });
  };

  const handleAddMaintenance = () => {
    router.push({ pathname: '/(app)/vehicles/[vehicleId]/maintenance', params: { vehicleId } });
  };

  if (!vehicleId) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>Veículo não encontrado.</Text>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>Carregando veículo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.vehicleTitle, { color: colors.text }]}>
                {vehicle.manufacturer} {vehicle.model}
              </Text>
              <Text style={{ color: colors.textMuted }}>
                {vehicle.year} • {vehicle.category}
              </Text>
              <Text style={[styles.plate, { color: colors.secondary }]}>{vehicle.plate.toUpperCase()}</Text>
            </View>
            {vehicle.photoUrl ? (
              <Image
                source={{ uri: vehicle.photoUrl }}
                style={{ width: 96, height: 96, borderRadius: 12, backgroundColor: colors.surfaceMuted }}
              />
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <Button
              label={photoMutation.isPending ? 'Enviando...' : vehicle.photoUrl ? 'Atualizar foto' : 'Enviar foto'}
              onPress={handlePickPhoto}
              loading={photoMutation.isPending}
              variant="ghost"
              style={{ flex: 1 }}
            />
            <Button
              label="Registrar manutenção"
              onPress={handleAddMaintenance}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Sugestões</Text>
          {suggestions ? (
            <SuggestionsSection suggestions={suggestions} colors={colors} />
          ) : (
            <Text style={{ color: colors.textMuted }}>Nenhuma sugestão disponível ainda.</Text>
          )}
        </View>

        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Histórico de manutenções</Text>
          {maintenances.length ? (
            <FlatList
              data={maintenances}
              renderItem={({ item }) => <MaintenanceItem record={item} colors={colors} onOpenDocument={handleOpenDocument} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <Text style={{ color: colors.textMuted }}>Nenhuma manutenção registrada.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  vehicleTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  plate: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  maintenanceCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
