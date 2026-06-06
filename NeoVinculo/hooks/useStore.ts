// hooks/useStore.ts
import { create } from 'zustand';
import { Bebe, Coleta, EstatisticasDia, HistoricoHora } from '../services/api';

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
  babyId: string | null;          // usa babyId igual ao backend (ex: "Prematuro_01")
  setAuth: (token: string, babyId: string) => void;
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
  historicoHoras: HistoricoHora[];
  setEstatisticas: (e: EstatisticasDia) => void;
  setHistoricoHoras: (h: HistoricoHora[]) => void;

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
  babyId: null,
  setAuth: (token, babyId) => {
    global.__authToken = token;
    set({ token, babyId });
  },
  logout: () => {
    global.__authToken = undefined;
    set({ token: null, babyId: null, bebe: null, ultimaColeta: null, coletasRecentes: [], alertas: [] });
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
