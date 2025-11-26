import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiError, getApiErrorMessage } from '@/lib/api/client';
import { CreateVehiclePayload, createVehicle } from '@/lib/api/vehicles';
import { queryKeys } from '@/lib/query-keys';

type FormState = Omit<CreateVehiclePayload, 'year' | 'averageMonthlyKm' | 'initialOdometer'> & {
  year: string;
  averageMonthlyKm: string;
  initialOdometer: string;
};

const CATEGORY_OPTIONS: { label: string; value: CreateVehiclePayload['category'] }[] = [
  { label: 'Carro', value: 'car' },
  { label: 'Motocicleta', value: 'motorcycle' },
];

export default function NewVehicleScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<CreateVehiclePayload['category']>('car');
  const [form, setForm] = useState<FormState>({
    plate: '',
    model: '',
    manufacturer: '',
    year: '',
    category: 'car',
    averageMonthlyKm: '',
    initialOdometer: '',
  });

  const mutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: async (vehicle) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      router.replace(`/(app)/vehicles/${vehicle.id}`);
    },
    onError: (error: ApiError) => {
      Alert.alert('Erro ao salvar veículo', getApiErrorMessage(error));
    },
  });

  const isSubmitting = mutation.isPending;

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const numericFields = useMemo(
    () => ({
      year: form.year ? Number(form.year) : undefined,
      averageMonthlyKm: form.averageMonthlyKm ? Number(form.averageMonthlyKm) : undefined,
      initialOdometer: form.initialOdometer ? Number(form.initialOdometer) : undefined,
    }),
    [form.year, form.averageMonthlyKm, form.initialOdometer],
  );

  const handleSubmit = () => {
    if (!form.plate || !form.model || !form.manufacturer || !numericFields.year || !numericFields.averageMonthlyKm) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
      return;
    }

    mutation.mutate({
      plate: form.plate.trim(),
      model: form.model.trim(),
      manufacturer: form.manufacturer.trim(),
      year: numericFields.year,
      category: selectedCategory,
      averageMonthlyKm: numericFields.averageMonthlyKm,
      initialOdometer: numericFields.initialOdometer,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding' })}>
        <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Novo veículo</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Informe os dados básicos para começarmos a sugerir manutenções preventivas.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Placa *</Text>
              <TextInput
                placeholder="ABC1D23"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={form.plate}
                onChangeText={(value) => handleChange('plate', value.toUpperCase())}
              />

              <Text style={[styles.label, { color: colors.text }]}>Modelo *</Text>
              <TextInput
                placeholder="Modelo"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={form.model}
                onChangeText={(value) => handleChange('model', value)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Fabricante *</Text>
              <TextInput
                placeholder="Fabricante"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={form.manufacturer}
                onChangeText={(value) => handleChange('manufacturer', value)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Ano *</Text>
              <TextInput
                placeholder="2024"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={form.year}
                onChangeText={(value) => handleChange('year', value.replace(/[^0-9]/g, ''))}
              />

              <Text style={[styles.label, { color: colors.text }]}>Categoria *</Text>
              <View style={styles.segmentedRow}>
                {CATEGORY_OPTIONS.map((option) => {
                  const isActive = option.value === selectedCategory;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setSelectedCategory(option.value);
                        handleChange('category', option.value);
                      }}
                      style={[
                        styles.segmentedItem,
                        {
                          borderColor: isActive ? colors.primary : colors.border,
                          backgroundColor: isActive ? colors.primarySoft : colors.surface,
                        },
                      ]}>
                      <Text style={{ color: isActive ? colors.primary : colors.textMuted, fontWeight: '600' }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Média de km/mês *</Text>
              <TextInput
                placeholder="Ex.: 1200"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={form.averageMonthlyKm}
                onChangeText={(value) => handleChange('averageMonthlyKm', value.replace(/[^0-9]/g, ''))}
              />

              <Text style={[styles.label, { color: colors.text }]}>Odômetro atual</Text>
              <TextInput
                placeholder="Ex.: 35000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={form.initialOdometer}
                onChangeText={(value) => handleChange('initialOdometer', value.replace(/[^0-9]/g, ''))}
              />
            </View>

            <Button label="Salvar veículo" onPress={handleSubmit} loading={isSubmitting} />
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
  segmentedRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentedItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
  },
});
