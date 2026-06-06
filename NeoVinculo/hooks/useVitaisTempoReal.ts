// hooks/useVitaisTempoReal.ts
import { useEffect, useCallback } from 'react';
import { useStore } from './useStore';
import { conectarSocket, onNovaColeta, onAlerta, desconectarSocket } from '../services/socket';
import { exibirAlertaLocal } from '../services/notifications';
import { VITAL_THRESHOLDS } from '../constants';
import { Coleta } from '../services/api';

export const useVitaisTempoReal = () => {
  const { babyId, adicionarColeta, adicionarAlerta, setConectado } = useStore();

  const checarLimites = useCallback((coleta: Coleta) => {
    const { batimentos, temperatura } = coleta;
    const { heartRate, temperature } = VITAL_THRESHOLDS;

    if (batimentos < heartRate.min || batimentos > heartRate.max) {
      const msg = `Batimentos fora do normal: ${batimentos} bpm`;
      exibirAlertaLocal('💓 Alerta de Batimentos', msg);
      adicionarAlerta({
        id: `${coleta._id}-bpm`,
        tipo: 'batimentos',
        mensagem: msg,
        timestamp: coleta.dataHora,   // campo correto do seu backend
        coleta,
      });
    }

    if (temperatura < temperature.min || temperatura > temperature.max) {
      const msg = `Temperatura fora do normal: ${temperatura.toFixed(1)}°C`;
      exibirAlertaLocal('🌡️ Alerta de Temperatura', msg);
      adicionarAlerta({
        id: `${coleta._id}-temp`,
        tipo: 'temperatura',
        mensagem: msg,
        timestamp: coleta.dataHora,
        coleta,
      });
    }
  }, [adicionarAlerta]);

  useEffect(() => {
    if (!babyId) return;

    const socket = conectarSocket(babyId);

    socket.on('connect', () => setConectado(true));
    socket.on('disconnect', () => setConectado(false));

    onNovaColeta((coleta) => {
      adicionarColeta(coleta);
      checarLimites(coleta);
    });

    onAlerta((alerta) => {
      exibirAlertaLocal('⚠️ Alerta do Sistema', alerta.mensagem);
      adicionarAlerta({
        id: `server-${Date.now()}`,
        tipo: alerta.tipo as any,
        mensagem: alerta.mensagem,
        timestamp: new Date().toISOString(),
        coleta: alerta.coleta,
      });
    });

    return () => {
      desconectarSocket();
      setConectado(false);
    };
  }, [babyId]);
};
