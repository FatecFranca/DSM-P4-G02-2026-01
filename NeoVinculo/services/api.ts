// services/api.ts
import axios from 'axios';
import { API_URL } from '../constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adiciona token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = global.__authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Tipagens ----

export type Coleta = {
  _id: string;
  bebeId: string;
  temperatura: number;
  batimentos: number;
  timestamp: string;
  status: 'normal' | 'alerta' | 'critico';
};

export type Bebe = {
  _id: string;
  nome: string;
  dataNascimento: string;
  semanasGestacao: number;
  peso: number;
  comprimento: number;
  leito: string;
  mae: string;
};

export type EstatisticasDia = {
  mediaBatimentos: number;
  mediaTemperatura: number;
  minBatimentos: number;
  maxBatimentos: number;
  minTemperatura: number;
  maxTemperatura: number;
  totalColetas: number;
  totalAlertas: number;
};

// ---- Auth ----

export const login = async (email: string, senha: string) => {
  const res = await api.post('/auth/login', { email, senha });
  global.__authToken = res.data.token;
  return res.data;
};

// ---- Bebê ----

export const fetchBebe = async (bebeId: string): Promise<Bebe> => {
  const res = await api.get(`/bebes/${bebeId}`);
  return res.data;
};

// ---- Coletas ----

export const fetchColetasRecentes = async (
  bebeId: string,
  limite = 20
): Promise<Coleta[]> => {
  const res = await api.get(`/coletas/${bebeId}`, {
    params: { limite },
  });
  return res.data;
};

export const fetchUltimaColeta = async (bebeId: string): Promise<Coleta> => {
  const res = await api.get(`/coletas/${bebeId}/ultima`);
  return res.data;
};

// ---- Estatísticas ----

export const fetchEstatisticasDia = async (
  bebeId: string,
  data?: string // formato YYYY-MM-DD, padrão = hoje
): Promise<EstatisticasDia> => {
  const res = await api.get(`/estatisticas/${bebeId}/dia`, {
    params: { data },
  });
  return res.data;
};

export const fetchHistoricoHoras = async (
  bebeId: string,
  horas = 6
): Promise<{ hora: string; mediaBatimentos: number; mediaTemperatura: number }[]> => {
  const res = await api.get(`/estatisticas/${bebeId}/horas`, {
    params: { horas },
  });
  return res.data;
};

export default api;
