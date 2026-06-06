// services/socket.ts
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import { Coleta } from './api';

let socket: Socket | null = null;

export type NovaColetaCallback = (coleta: Coleta) => void;
export type AlertaCallback = (alerta: { tipo: string; mensagem: string; coleta: Coleta }) => void;

export const conectarSocket = (bebeId: string) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    query: { bebeId },
  });

  socket.on('connect', () => {
    console.log('[Socket] Conectado ao servidor IoT');
    socket?.emit('entrar-sala', bebeId);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Desconectado');
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Erro de conexão:', err.message);
  });

  return socket;
};

export const onNovaColeta = (callback: NovaColetaCallback) => {
  socket?.on('nova-coleta', callback);
};

export const onAlerta = (callback: AlertaCallback) => {
  socket?.on('alerta-vital', callback);
};

export const desconectarSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
