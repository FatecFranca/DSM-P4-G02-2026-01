# DSM-P4-G02-2026-01
Repositório do GRUPO 02 do Projeto Interdisciplinar do 4º semestre DSM 2026/1. 
Alunos:  Ana Julia Ferreira Rodrigues, Guilherme Laurindo de Souza Silva, Juliano Ferreira Noel Lemos

# 👶 NeoVínculo - Monitoramento Neonatal Inteligente (IoT)

> **Projeto Interdisciplinar - 4º Semestre** > Curso: Desenvolvimento de Software Multiplataforma (DSM) - FATEC

O **NeoVínculo** é uma solução de IoT desenvolvida para monitorar sinais vitais (temperatura e batimentos cardíacos) de bebês prematuros. O sistema conecta uma pulseira inteligente a uma API REST, permitindo o acompanhamento em tempo real por responsáveis (via Mobile) e via Dashboard Web.

---

## 🛠️ Tecnologias e Arquitetura

O projeto foi estruturado seguindo o padrão **MVC (Model-View-Controller)** para garantir escalabilidade e organização.

### **Back-end & Banco de Dados**
* **Node.js & Express:** Servidor robusto e assíncrono.
* **MongoDB Atlas:** Banco de dados NoSQL em nuvem para alta disponibilidade de dados de sensores.
* **Mongoose:** Modelagem de dados e validação.
* **Swagger (OpenAPI 3.0):** Documentação técnica interativa.

### **Internet das Coisas (IoT)**
* **ESP32-C3:** Microcontrolador com Wi-Fi nativo.
* **MAX30102:** Sensor de oximetria e frequência cardíaca.
* **DS18B20:** Sensor de temperatura de alta precisão.
* **Protocolo HTTP:** Comunicação entre Hardware e API.

---

## 📂 Estrutura do Repositório

```text
PI-NeoVinculo/
├── backend/           # API Node.js (Desenvolvido por Ana Júlia)
│   ├── src/
│   │   ├── config/    # Conexão com Banco de Dados
│   │   ├── controllers/ # Lógica de Negócio e Alertas
│   │   ├── models/    # Esquemas do MongoDB
│   │   ├── routes/    # Definição de Endpoints
│   │   └── server.js  # Ponto de entrada da aplicação
├── iot/               # Código-fonte Arduino/C++ para ESP32
├── docs/              # Documentação acadêmica e diagramas
└── README.md