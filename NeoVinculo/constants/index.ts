// constants/index.ts

export const COLORS = {
  primary: '#D85A30',
  primaryLight: '#FAECE7',
  primaryMid: '#F5C4B3',
  primaryDark: '#993C1D',
  success: '#639922',
  successLight: '#EAF3DE',
  successMid: '#C0DD97',
  warning: '#BA7517',
  warningLight: '#FAEEDA',
  danger: '#A32D2D',
  dangerLight: '#FCEBEB',
  info: '#378ADD',
  infoLight: '#E6F1FB',
  background: '#FFF9F5',
  surface: '#FFFFFF',
  border: '#FFD9C9',
  textPrimary: '#2C2C2A',
  textSecondary: '#888780',
  textMuted: '#B4B2A9',
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

export const API_URL = 'http://SEU_IP_OU_DOMINIO:3000'; // Troque pelo seu backend
export const SOCKET_URL = 'http://SEU_IP_OU_DOMINIO:3000';

export const COLETA_INTERVAL_MS = 30000; // 30 segundos (igual ao IoT)
