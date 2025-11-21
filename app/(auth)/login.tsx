import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LoginPayload } from '@/lib/api/auth';
import { ApiError, getApiErrorMessage } from '@/lib/api/client';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [form, setForm] = useState<LoginPayload>({
    email: '',
    password: '',
  });

  const onChange = (key: keyof LoginPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await signIn(form);
    } catch (error) {
      const message = getApiErrorMessage(error as ApiError);
      Alert.alert('Erro ao entrar', message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingVertical: 48 }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Bem-vindo</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Entre para acessar seus veículos e manutenções.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={form.email}
              onChangeText={(value) => onChange('email', value.trim())}
            />

            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <TextInput
              placeholder="Digite sua senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={form.password}
              onChangeText={(value) => onChange('password', value)}
            />
          </View>

          <Button label="Entrar" onPress={handleSubmit} loading={isLoading} />

          <View style={styles.footer}>
            <Text style={{ color: colors.textMuted }}>Ainda não tem conta?</Text>
            <Link href="/(auth)/register" style={{ color: colors.secondary }}>
              Cadastre-se
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 30,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
});
