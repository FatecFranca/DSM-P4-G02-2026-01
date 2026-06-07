# __init__.py
"""
Analytics Scripts - NeoVínculo
Módulo para análise estatística de sinais vitais
"""

__version__ = "1.0.0"
__author__ = "NeoVínculo Team"

from .data_fetcher import DataFetcher, obter_dados_baby
from .stats_calculator import StatsCalculator
from .config import API_BASE_URL, VITAL_THRESHOLDS, OUTPUT_DIR

__all__ = [
    "DataFetcher",
    "obter_dados_baby",
    "StatsCalculator",
    "API_BASE_URL",
    "VITAL_THRESHOLDS",
    "OUTPUT_DIR",
]
