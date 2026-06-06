// hooks/useStore.ts
import { create } from 'zustand';
import { Bebe, Coleta, EstatisticasDia } from '../services/api';

type Alerta = {
  id: string;
  tipo: 'temperatura' | 'batimentos';
  mensagem: string;
  timestamp: string;
  coleta: Coleta;
};

type AppState = {
  // Auth
  token: string | null;
  bebeId: string | null;
  setAuth: (token: string, bebeId: string) => void;
  logout: () => void;

  // Dados do bebê
  bebe: Bebe | null;
  setBebe: (b: Bebe) => void;

  // Vitais em tempo real
  ultimaColeta: Coleta | null;
  coletasRecentes: Coleta[];
  setUltimaColeta: (c: Coleta) => void;
  adicionarColeta: (c: Coleta) => void;

  // Estatísticas
  estatisticas: EstatisticasDia | null;
  historicoHoras: { hora: string; mediaBatimentos: number; mediaTemperatura: number }[];
  setEstatisticas: (e: EstatisticasDia) => void;
  setHistoricoHoras: (h: AppState['historicoHoras']) => void;

  // Alertas
  alertas: Alerta[];
  adicionarAlerta: (a: Alerta) => void;
  limparAlertas: () => void;

  // Conexão
  isConectado: boolean;
  setConectado: (v: boolean) => void;
};

export const useStore = create<AppState>((set) => ({
  token: null,
  bebeId: null,
  setAuth: (token, bebeId) => {
    global.__authToken = token;
    set({ token, bebeId });
  },
  logout: () => {
    global.__authToken = undefined;
    set({ token: null, bebeId: null, bebe: null, ultimaColeta: null, coletasRecentes: [], alertas: [] });
  },

  bebe: null,
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
}));
