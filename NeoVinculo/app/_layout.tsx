// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registrarNotificacoes, salvarTokenNoBackend } from '../services/notifications';
import { useStore } from '../hooks/useStore';

export default function RootLayout() {
  const { bebeId } = useStore();

  useEffect(() => {
    const setupPush = async () => {
      const token = await registrarNotificacoes();
      if (token && bebeId) {
        await salvarTokenNoBackend(bebeId, token);
      }
    };
    setupPush();
  }, [bebeId]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#f6f5ff" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
