import * as DocumentPicker from 'expo-document-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiError, getApiErrorMessage } from '@/lib/api/client';
import { createMaintenanceRecord } from '@/lib/api/vehicles';
import { queryKeys } from '@/lib/query-keys';

type DocumentSelection = {
  uri: string;
  name: string;
  type: string;
};

type FormState = {
  serviceType: string;
  serviceDate: string;
  odometer: string;
  workshop: string;
  notes: string;
  document: DocumentSelection | null;
};

export default function NewMaintenanceScreen() {
  const params = useLocalSearchParams<{ vehicleId: string }>();
  const vehicleId = params.vehicleId ?? '';
  const queryClient = useQueryClient();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const [form, setForm] = useState<FormState>({
    serviceType: '',
    serviceDate: '',
    odometer: '',
    workshop: '',
    notes: '',
    document: null,
  });

  const mutation = useMutation({
    mutationFn: createMaintenanceRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
      router.replace(`/(app)/vehicles/${vehicleId}`);
    },
    onError: (error: ApiError) => {
      Alert.alert('Erro ao salvar manutenção', getApiErrorMessage(error));
    },
  });

  const numericOdometer = useMemo(
    () => (form.odometer ? Number(form.odometer.replace(/[^\d]/g, '')) : undefined),
    [form.odometer],
  );

  const handleChange = (key: keyof FormState, value: string | DocumentSelection | null) => {
    setForm((prev) => ({ ...prev, [key]: value } as FormState));
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const { name, mimeType, uri } = result.assets[0];

    handleChange('document', {
      uri,
      name,
      type: mimeType ?? 'application/pdf',
    });
  };

  const handleSubmit = () => {
    if (!vehicleId) {
      Alert.alert('Veículo inválido', 'Não foi possível identificar o veículo.');
      return;
    }

    if (!form.serviceType || !form.serviceDate || !numericOdometer || !form.workshop) {
      Alert.alert('Campos obrigatórios', 'Preencha os campos obrigatórios marcados com *.');
      return;
    }

    mutation.mutate({
      vehicleId,
      serviceType: form.serviceType.trim(),
      serviceDate: form.serviceDate,
      odometer: numericOdometer,
      workshop: form.workshop.trim(),
      notes: form.notes ? form.notes.trim() : undefined,
      document: form.document,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding' })}>
        <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Registrar manutenção</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Informe os detalhes para alimentar o histórico e recalcular as sugestões.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Serviço *</Text>
              <TextInput
                placeholder="Troca de óleo"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={form.serviceType}
                onChangeText={(value) => handleChange('serviceType', value)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Data do serviço *</Text>
              <TextInput
                placeholder="2025-10-04"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={form.serviceDate}
                onChangeText={(value) => handleChange('serviceDate', value)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Odômetro *</Text>
              <TextInput
                placeholder="15000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={form.odometer}
                onChangeText={(value) => handleChange('odometer', value.replace(/[^0-9]/g, ''))}
              />

              <Text style={[styles.label, { color: colors.text }]}>Oficina *</Text>
              <TextInput
                placeholder="Oficina XPTO"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={form.workshop}
                onChangeText={(value) => handleChange('workshop', value)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Observações</Text>
              <TextInput
                placeholder="Informações adicionais"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                    textAlignVertical: 'top',
                    minHeight: 120,
                  },
                ]}
                value={form.notes}
                onChangeText={(value) => handleChange('notes', value)}
              />

              <View style={styles.documentRow}>
                <Text style={[styles.label, { color: colors.text }]}>Documento</Text>
                <Button
                  label={form.document ? 'Alterar documento' : 'Anexar documento'}
                  onPress={handlePickDocument}
                  variant="ghost"
                />
                {form.document ? (
                  <Text style={{ color: colors.textMuted }}>Selecionado: {form.document.name}</Text>
                ) : (
                  <Text style={{ color: colors.textMuted }}>PDF ou imagem (opcional).</Text>
                )}
              </View>
            </View>

            <Button
              label={mutation.isPending ? 'Salvando...' : 'Salvar manutenção'}
              onPress={handleSubmit}
              loading={mutation.isPending}
              variant="secondary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  formGroup: {
    gap: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  documentRow: {
    gap: 8,
  },
});
