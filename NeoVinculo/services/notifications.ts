// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registrarNotificacoes = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('Push notifications só funcionam em dispositivos reais.');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissão para notificações negada.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alertas', {
      name: 'Alertas Vitais',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D85A30',
      sound: 'alert.wav',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('[Push Token]', token);
  return token;
};

// Envia o token para o backend salvar e usar para alertas remotos
export const salvarTokenNoBackend = async (
  bebeId: string,
  token: string
) => {
  try {
    await api.post('/notificacoes/token', { bebeId, token });
  } catch (err) {
    console.error('[Push] Falha ao salvar token:', err);
  }
};

// Notificação local (para quando o app está aberto)
export const exibirAlertaLocal = async (titulo: string, corpo: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: corpo,
      sound: 'alert.wav',
      data: { tipo: 'alerta-vital' },
    },
    trigger: null, // imediato
  });
};
