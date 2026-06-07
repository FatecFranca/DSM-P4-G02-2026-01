"""
Ponto de entrada para gerar analytics avançadas de sinais vitais.

Uso:
    python main.py <baby_id>

O script consulta a API backend, processa os sinais vitais e grava o JSON no diretório output.
"""

import argparse
import json
import logging
import sys
from pathlib import Path

from config import OUTPUT_DIR, PRETTY_JSON, STATS_CONFIG, LOG_LEVEL
from data_fetcher import obter_dados_baby
from stats_calculator import StatsCalculator

logging.basicConfig(level=getattr(logging, LOG_LEVEL))
logger = logging.getLogger(__name__)


def gerar_analytics(baby_id: str) -> dict:
    logger.info(f"Iniciando geração de analytics para {baby_id}")
    dados = obter_dados_baby(baby_id)
    if not dados:
        raise ValueError(f"Nenhum dado de sinais vitais encontrado para {baby_id}")

    calculadora = StatsCalculator()
    resumo_geral = calculadora.gerar_resumo_geral(dados)

    analytics = {
        "babyId": baby_id,
        "totalColetas": len(dados),
        "resumoGeral": resumo_geral,
        "meta": {
            "outputFile": str(OUTPUT_DIR / f"analytics_{baby_id}.json"),
            "registrosProcessados": len(dados)
        }
    }

    if STATS_CONFIG.get("agrupar_por_hora"):
        analytics["porHora"] = calculadora.processar_por_periodo(dados, 3600)

    if STATS_CONFIG.get("agrupar_por_dia"):
        analytics["porDia"] = calculadora.processar_por_periodo(dados, 86400)

    return analytics


def salvar_saida(analytics: dict, baby_id: str) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"analytics_{baby_id}.json"
    with output_path.open("w", encoding="utf-8") as arquivo:
        json.dump(analytics, arquivo, indent=2 if PRETTY_JSON else None, ensure_ascii=False)
    logger.info(f"Analytics gravadas em: {output_path}")
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera analytics avançadas para um bebê usando dados de sinais vitais.")
    parser.add_argument("baby_id", help="ID do bebê (por exemplo: Prematuro_01)")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        analytics = gerar_analytics(args.baby_id)
        salvar_saida(analytics, args.baby_id)
        return 0
    except Exception as error:
        logger.error(f"Falha ao gerar analytics: {error}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
