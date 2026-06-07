// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registrarNotificacoes, salvarTokenNoBackend } from '../services/notifications';
import { useStore } from '../hooks/useStore';
import { router } from 'expo-router';

export default function RootLayout() {
  const { token, babyId } = useStore();

  useEffect(() => {
    if (token && babyId) {
      router.replace('/(tabs)');
    } else {
      router.replace('/');
    }
  }, [token]);

  useEffect(() => {
    const setupPush = async () => {
      const pushToken = await registrarNotificacoes();
      if (pushToken && babyId) {
        await salvarTokenNoBackend(babyId, pushToken);
      }
    };
    setupPush();
  }, [babyId]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFF9F5" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}