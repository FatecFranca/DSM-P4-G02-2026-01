// constants/index.ts

export const COLORS = {
  primary: '#1D70B8',
  primaryLight: '#E6F1FB',
  primaryMid: '#A3CBED',
  primaryDark: '#0B477D',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  successMid: '#C8E6C9',
  warning: '#BA7517',
  warningLight: '#FAEEDA',
  danger: '#D32F2F',
  dangerLight: '#FFEBEE',
  info: '#378ADD',
  infoLight: '#E6F1FB',
  background: '#F4F7FA',
  surface: '#FFFFFF',
  border: '#D0DFED',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
};

export const VITAL_THRESHOLDS = {
  heartRate: {
    min: 120,
    max: 160,
    unit: 'bpm',
    label: 'Batimentos Cardíacos',
  },
  temperature: {
    min: 36.5,
    max: 37.5,
    unit: '°C',
    label: 'Temperatura',
  },
};

export const API_URL = 'http://192.168.24.5:3000'; // Troque pelo seu backend
export const SOCKET_URL = 'http://192.168.24.5:3000';

export const COLETA_INTERVAL_MS = 30000; // 30 segundos (igual ao IoT)
