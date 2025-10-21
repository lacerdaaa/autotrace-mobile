import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { ApiError, getApiErrorMessage } from '@/lib/api/client';
import { downloadCertificatePdf, shareCertificate, validateCertificate } from '@/lib/api/certificates';
import { listVehicles } from '@/lib/api/vehicles';
import { queryKeys } from '@/lib/query-keys';

export default function CertificatesScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { token } = useAuth();
  const [certificateId, setCertificateId] = useState('');
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const { data: vehicles } = useQuery({
    queryKey: queryKeys.vehicles.root,
    queryFn: listVehicles,
  });

  const validationMutation = useMutation({
    mutationFn: validateCertificate,
    onSuccess: (data) => {
      const certificate = data.certificate;
      setValidationResult(
        `Certificado válido • Veículo ${certificate.vehiclePlate} • Gerado em ${new Date(
          certificate.generatedAt,
        ).toLocaleString()}`,
      );
    },
    onError: (error: ApiError) => {
      setValidationResult(null);
      Alert.alert('Validação falhou', getApiErrorMessage(error));
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      if (!token) {
        throw new Error('Token de autenticação ausente.');
      }
      const fileUri = await downloadCertificatePdf(vehicleId, token);
      await shareCertificate(fileUri);
      return fileUri;
    },
    onError: (error: unknown) => {
      if ((error as ApiError)?.isAxiosError) {
        Alert.alert('Erro ao gerar certificado', getApiErrorMessage(error as ApiError));
        return;
      }
      Alert.alert('Erro ao gerar certificado', (error as Error)?.message ?? 'Erro inesperado.');
    },
  });

  const handleValidate = () => {
    if (!certificateId.trim()) {
      Alert.alert('Informe o código', 'Digite o ID do certificado para validar.');
      return;
    }

    validationMutation.mutate(certificateId.trim());
  };

  const handleGenerate = (vehicleId: string) => {
    generateMutation.mutate(vehicleId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}> 
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Certificados</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Gere certificados das manutenções e valide os códigos recebidos.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>Validar certificado</Text>
          <TextInput
            placeholder="ID do certificado"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            value={certificateId}
            onChangeText={setCertificateId}
          />
          <Button
            label={validationMutation.isPending ? 'Validando...' : 'Validar'}
            onPress={handleValidate}
            loading={validationMutation.isPending}
          />
          {validationResult ? (
            <View style={[styles.validationBox, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}> 
              <Text style={{ color: colors.primary }}>{validationResult}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gerar certificado em PDF</Text>
          {vehicles && vehicles.length ? (
            vehicles.map((vehicle) => (
              <View
                key={vehicle.id}
                style={[styles.vehicleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {vehicle.manufacturer} {vehicle.model}
                </Text>
                <Text style={{ color: colors.textMuted }}>{vehicle.plate}</Text>
                <Button
                  label={generateMutation.isPending ? 'Gerando...' : 'Gerar certificado'}
                  onPress={() => handleGenerate(vehicle.id)}
                  loading={generateMutation.isPending}
                  variant="secondary"
                />
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textMuted }}>Cadastre veículos para gerar certificados.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 8,
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
    borderRadius: 18,
    padding: 20,
    gap: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  validationBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  vehicleCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
});
