// services/api.ts
import axios from 'axios';
import { API_URL } from '../constants';
import { format } from 'date-fns';


const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adiciona token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = (globalThis as any).__authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Tipagens alinhadas com seu backend ----

export type Coleta = {
  _id: string;
  babyId: string;          // seu backend usa babyId (não bebeId)
  temperatura: number;
  batimentos: number;
  dataHora: string;        // seu backend usa dataHora (não timestamp)
  status?: 'normal' | 'alerta' | 'critico';
};

export type Bebe = {
  babyId: string;          // seu backend usa babyId como identificador
  nome: string;
  dataNascimento: string;
  sexo: 'M' | 'F' | 'O';
  // campos extras que seu backend retornar também aparecerão aqui
};

export type EstatisticasDia = {
  bebeId: string;
  data: string;
  totalColetas: number;
  mediaBatimentos: number;
  mediaTemperatura: number;
  minBatimentos: number;
  maxBatimentos: number;
  minTemperatura: number;
  maxTemperatura: number;
};

export type HistoricoHora = {
  bebeId: string;
  dataHora: string;        // seu backend usa dataHora
  totalColetas: number;
  mediaBatimentos: number;
  mediaTemperatura: number;
};

// ---- Auth ----

export const login = async (email: string, senha: string) => {
  const res = await api.post('/auth/login', { email, senha });
  (globalThis as any).__authToken = res.data.token;
  return res.data; // { token, bebe: { babyId, nome, ... } }
};

// ---- Bebê ----

export const fetchBebe = async (babyId: string): Promise<Bebe> => {
  const res = await api.get(`/bebes/${babyId}`);
  return res.data;
};

// ---- Coletas ----

export const fetchColetasRecentes = async (
  babyId: string,
  limite = 20
): Promise<Coleta[]> => {
  const res = await api.get(`/coletas/${babyId}`, {
    params: { limite },
  });
  return res.data;
};

export const fetchUltimaColeta = async (babyId: string): Promise<Coleta> => {
  const res = await api.get(`/coletas/${babyId}/ultima`);
  return res.data;
};

// ---- Estatísticas ----

export const fetchEstatisticasDia = async (
  babyId: string,
  data?: string  // YYYY-MM-DD — obrigatório no seu backend
): Promise<EstatisticasDia> => {
  const dataParam = data ?? format(new Date(), 'yyyy-MM-dd');
  const res = await api.get(`/estatisticas/${babyId}/dia`, {
    params: { data: dataParam },
  });
  return res.data;
};

export const fetchHistoricoHoras = async (
  babyId: string,
  horas = 6
): Promise<HistoricoHora[]> => {
  const res = await api.get(`/estatisticas/${babyId}/horas`, {
    params: { horas },
  });
  return res.data;
};

export const fetchAnalyticsAvancadas = async (
  babyId: string
) => {
  const res = await api.get(`/analytics/${babyId}`);
  return res.data;
};

// ---- Sinais vitais diretos do IoT (rota extra do seu backend) ----

export const fetchVitais = async (babyId: string) => {
  const res = await api.get(`/vitals/${babyId}`);
  return res.data;
};

export default api;
