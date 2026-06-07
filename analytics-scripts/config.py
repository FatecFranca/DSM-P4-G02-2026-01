"""
Configurações centralizadas para scripts de análise estatística
"""

import os
from pathlib import Path

# ===== API Backend =====
API_BASE_URL = "http://localhost:3000"

# Alternativa local (descomente se estiver rodando backend localmente)
# API_BASE_URL = "http://localhost:3000"

API_TIMEOUT = 10  # segundos

# ===== Limites de Sinais Vitais (prematuros) =====
VITAL_THRESHOLDS = {
    "heartRate": {
        "min": 120,
        "max": 160,
        "unit": "bpm",
        "label": "Batimentos Cardíacos"
    },
    "temperature": {
        "min": 36.5,
        "max": 37.5,
        "unit": "°C",
        "label": "Temperatura"
    }
}

# ===== Caminhos =====
BASE_DIR = Path(__file__).parent.absolute()
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# ===== Modo de log =====
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL

# ===== Configuração de análise =====
STATS_CONFIG = {
    "calcular_media": True,
    "calcular_moda": True,
    "calcular_desvio_padrao": True,
    "agrupar_por_hora": True,
    "agrupar_por_dia": True,
    "incluir_analise_anomalias": True
}

# ===== Intervalos de tempo para agregação =====
TIME_INTERVALS = {
    "hora": 3600,        # 1 hora em segundos
    "30_min": 1800,      # 30 minutos
    "dia": 86400,        # 1 dia
}

# ===== Formato de saída =====
OUTPUT_FORMAT = "json"  # json, csv (expandível)
PRETTY_JSON = True      # Formatar JSON com indentação

# ===== Comportamento de limpeza de dados =====
REMOVER_OUTLIERS = False  # Se True, remove valores muito distantes (3*desvio padrão)

if __name__ == "__main__":
    print(f"API URL: {API_BASE_URL}")
    print(f"Output Directory: {OUTPUT_DIR}")
    print(f"Vital Thresholds: {VITAL_THRESHOLDS}")
