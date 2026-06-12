// hooks/useStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bebe, Coleta, EstatisticasDia, HistoricoHora } from '../services/api';

type Alerta = {
  id: string;
  tipo: 'temperatura' | 'batimentos';
  mensagem: string;
  timestamp: string;
  coleta: Coleta;
};

type AppState = {
  token: string | null;
  babyId: string | null;
  bebe: Bebe | null;
  setAuth: (token: string, babyId: string) => void;
  logout: () => void;
  setBebe: (b: Bebe) => void;

  ultimaColeta: Coleta | null;
  coletasRecentes: Coleta[];
  setUltimaColeta: (c: Coleta) => void;
  adicionarColeta: (c: Coleta) => void;

  estatisticas: EstatisticasDia | null;
  historicoHoras: HistoricoHora[];
  setEstatisticas: (e: EstatisticasDia) => void;
  setHistoricoHoras: (h: HistoricoHora[]) => void;

  alertas: Alerta[];
  adicionarAlerta: (a: Alerta) => void;
  limparAlertas: () => void;

  isConectado: boolean;
  setConectado: (v: boolean) => void;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      babyId: null,
      bebe: null,
      setAuth: (token, babyId) => {
        global.__authToken = token;
        set({ token, babyId });
      },
      logout: () => {
        global.__authToken = undefined;
        AsyncStorage.removeItem('baby-monitor-storage').catch(() => {});
        set({
          token: null, babyId: null, bebe: null,
          ultimaColeta: null, coletasRecentes: [], alertas: [],
        });
      },
      setBebe: (bebe) => set({ bebe }),

      ultimaColeta: null,
      coletasRecentes: [],
      setUltimaColeta: (c) => set({ ultimaColeta: c }),
      adicionarColeta: (c) =>
        set((state) => ({
          ultimaColeta: c,
          coletasRecentes: [c, ...state.coletasRecentes].slice(0, 50),
        })),

      estatisticas: null,
      historicoHoras: [],
      setEstatisticas: (estatisticas) => set({ estatisticas }),
      setHistoricoHoras: (historicoHoras) => set({ historicoHoras }),

      alertas: [],
      adicionarAlerta: (a) =>
        set((state) => ({ alertas: [a, ...state.alertas].slice(0, 20) })),
      limparAlertas: () => set({ alertas: [] }),

      isConectado: false,
      setConectado: (isConectado) => set({ isConectado }),
    }),
    {
      name: 'baby-monitor-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persiste apenas auth e bebe — o resto recarrega do backend
      partialize: (state) => ({
        token: state.token,
        babyId: state.babyId,
        bebe: state.bebe,
      }),
    }
  )
);
