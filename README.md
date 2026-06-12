# DSM-P4-G02-2026-01
Repositório do GRUPO 02 do Projeto Interdisciplinar do 4º semestre DSM 2026/1. 
Alunos:  Ana Julia Ferreira Rodrigues, Guilherme Laurindo de Souza Silva, Juliano Ferreira Noel Lemos

# 👶 NeoVínculo - Monitoramento Neonatal Inteligente (IoT)

> **Projeto Interdisciplinar - 4º Semestre** > Curso: Desenvolvimento de Software Multiplataforma (DSM) - FATEC

O **NeoVínculo** é uma solução de IoT desenvolvida para monitorar sinais vitais (temperatura e batimentos cardíacos) de bebês prematuros. O sistema conecta uma pulseira inteligente a uma API REST, permitindo o acompanhamento em tempo real por responsáveis (via Mobile) e via Dashboard Web.

## Tecnologias

- **React Native + Expo** (iOS e Android)
- **Expo Router** — navegação por abas
- **Socket.io** — dados em tempo real do IoT
- **Expo Notifications** — alertas push
- **Zustand** — estado global
- **Axios** — requisições HTTP para seu backend Node.js
- **react-native-chart-kit** — gráficos de BPM e temperatura

## Estrutura do projeto

```
NeoVinculo/
├── app/
│   ├── _layout.tsx          # Layout raiz + setup de push notifications
│   ├── index.tsx            # Tela de Login
│   └── (tabs)/
│       ├── _layout.tsx      # Barra de navegação inferior
│       ├── index.tsx        # 🏠 Início — vitais em tempo real
│       ├── coletas.tsx      # 📋 Histórico de coletas
│       ├── estatisticas.tsx # 📊 Estatísticas do dia
│       └── perfil.tsx       # 👤 Perfil e configurações
│
├── services/
│   ├── api.ts               # Axios + todas as chamadas ao backend
│   ├── socket.ts            # Socket.io para dados em tempo real
│   └── notifications.ts    # Expo Push Notifications
│
├── hooks/
│   ├── useStore.ts          # Zustand — estado global
│   └── useVitaisTempoReal.ts # Hook que conecta socket + alertas
│
└── constants/
    └── index.ts             # Cores, limites vitais, URL do backend
```

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o backend
# Edite constants/index.ts e troque:
#   API_URL = 'http://SEU_IP_OU_DOMINIO:3000'
#   SOCKET_URL = 'http://SEU_IP_OU_DOMINIO:3000'

# 3. Iniciar o app
npx expo start

# Escanear o QR code com o app Expo Go (iOS/Android)
```

## Integração com seu backend Node.js

### Rotas REST esperadas pelo app

```
POST /auth/login                        → { token, bebe }
GET  /bebes/:id                         → Bebe
GET  /coletas/:bebeId?limite=N          → Coleta[]
GET  /coletas/:bebeId/ultima            → Coleta
GET  /estatisticas/:bebeId/dia?data=    → EstatisticasDia
GET  /estatisticas/:bebeId/horas?horas= → HistoricoHora[]
POST /notificacoes/token                → salva token push
```

### Estrutura esperada da Coleta (MongoDB)

```json
{
  "_id": "...",
  "bebeId": "...",
  "temperatura": 37.1,
  "batimentos": 143,
  "timestamp": "2025-04-10T14:30:00Z",
  "status": "normal"
}
```

### Socket.io no backend — eventos esperados

```js
// Quando IoT enviar nova coleta:
io.to(bebeId).emit('nova-coleta', coleta);

// Quando detectar anomalia:
io.to(bebeId).emit('alerta-vital', {
  tipo: 'temperatura',       // ou 'batimentos'
  mensagem: 'Temp. 38.5°C — acima do normal',
  coleta: coleta
});

// Sala por bebê:
socket.on('entrar-sala', (bebeId) => {
  socket.join(bebeId);
});
```

### Push Notification no backend (opcional)

Para alertar mesmo com o app fechado, use a API da Expo:

```js
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Quando houver alerta:
await expo.sendPushNotificationsAsync([{
  to: tokenSalvoNoBanco,
  title: '⚠️ Alerta — Sofia',
  body: 'Temperatura: 38.5°C',
  sound: 'default',
  data: { bebeId }
}]);
```

## Limites vitais configuráveis

Em `constants/index.ts`:

```ts
export const VITAL_THRESHOLDS = {
  heartRate:   { min: 120, max: 160, unit: 'bpm' },
  temperature: { min: 36.5, max: 37.5, unit: '°C' },
};
```

## Build para produção

```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login

# Build Android (.apk / .aab)
eas build --platform android

# Build iOS (requer conta Apple Developer)
eas build --platform ios
```