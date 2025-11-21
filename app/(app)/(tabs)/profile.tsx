import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      Alert.alert('Erro ao sair', (error as Error)?.message ?? 'Não foi possível encerrar a sessão.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Gerencie suas preferências e sessão.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>{user?.name}</Text>
          <Text style={{ color: colors.textMuted }}>{user?.email}</Text>
          <Text style={{ color: colors.textMuted }}>
            Conta criada em {user ? new Date(user.createdAt).toLocaleDateString() : '-'}
          </Text>
          <Text style={{ color: colors.textMuted }}>Permissão: {user?.role}</Text>
        </View>

        <Button
          label={isSigningOut ? 'Saindo...' : 'Encerrar sessão'}
          onPress={handleSignOut}
          loading={isSigningOut}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
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
  card: {
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
