# main.py
"""
Script principal - Orquestrador de análise estatística
Busca dados, calcula estatísticas e salva resultados em JSON
"""

import json
import logging
from typing import Optional, List
from datetime import datetime
from pathlib import Path

from config import OUTPUT_DIR, LOG_LEVEL, PRETTY_JSON, TIME_INTERVALS
from data_fetcher import DataFetcher, obter_dados_baby
from stats_calculator import StatsCalculator

# Configurar logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AnalyticsOrchestrator:
    """Orquestrador principal de análise"""

    def __init__(self):
        self.fetcher = DataFetcher()
        self.calculator = StatsCalculator()

    def analisar_bebe(self, baby_id: str, salvar: bool = True) -> Optional[dict]:
        """
        Analisa um bebê específico e retorna estatísticas completas

        Args:
            baby_id (str): ID do bebê
            salvar (bool): Se True, salva resultado em JSON

        Returns:
            dict: Análise completa
            None: Se falhar em obter dados
        """
        logger.info(f"\n{'='*60}")
        logger.info(f"Iniciando análise para: {baby_id}")
        logger.info(f"{'='*60}")

        # 1. Buscar dados
        vitals = self.fetcher.fetch_vitals_by_baby(baby_id)
        if not vitals:
            logger.error(f"✗ Falha ao obter dados de {baby_id}")
            return None

        # 2. Validar dados
        vitals_validos = self.fetcher.validar_dados(vitals)
        if not vitals_validos:
            logger.error(f"✗ Nenhum dado válido para {baby_id}")
            return None

        logger.info(f"✓ Dados obtidos e validados: {len(vitals_validos)} registros")

        # 3. Calcular resumo geral
        logger.info("Calculando resumo geral...")
        resumo_geral = self.calculator.gerar_resumo_geral(vitals_validos)

        # 4. Processar por hora
        logger.info("Processando dados por hora...")
        por_hora = self.calculator.processar_por_periodo(
            vitals_validos,
            TIME_INTERVALS["hora"]
        )

        # 5. Processar por 30 minutos
        logger.info("Processando dados por 30 minutos...")
        por_30min = self.calculator.processar_por_periodo(
            vitals_validos,
            TIME_INTERVALS["30_min"]
        )

        # 6. Montar resultado final
        resultado = {
            "metadata": {
                "babyId": baby_id,
                "geradoEm": datetime.now().isoformat(),
                "versao": "1.0",
                "descricao": "Análise estatística completa de sinais vitais"
            },
            "resumoGeral": resumo_geral,
            "porHora": por_hora,
            "por30Minutos": por_30min
        }

        # 7. Salvar em arquivo
        if salvar:
            self._salvar_resultado(baby_id, resultado)

        logger.info(f"✓ Análise concluída com sucesso")
        return resultado

    def analisar_todos_bebes(self) -> dict:
        """
        Analisa todos os bebês no banco de dados

        Returns:
            dict: Resultados de cada bebê
        """
        logger.info("\n" + "="*60)
        logger.info("Analisando TODOS os bebês")
        logger.info("="*60)

        # Buscar todos os vitals
        todos_vitals = self.fetcher.fetch_all_vitals()
        if not todos_vitals:
            logger.error("✗ Falha ao obter dados gerais")
            return {}

        # Agrupar por baby_id
        por_baby = {}
        for vital in todos_vitals:
            baby_id = vital.get("babyId")
            if baby_id:
                if baby_id not in por_baby:
                    por_baby[baby_id] = []
                por_baby[baby_id].append(vital)

        logger.info(f"✓ Encontrados {len(por_baby)} bebês únicos")

        # Analisar cada um
        resultados = {}
        for baby_id in por_baby:
            resultado = self.analisar_bebe(baby_id)
            if resultado:
                resultados[baby_id] = resultado

        logger.info(f"\n✓ Análise completa: {len(resultados)} bebês processados")
        return resultados

    def _salvar_resultado(self, baby_id: str, resultado: dict) -> bool:
        """
        Salva resultado em arquivo JSON

        Args:
            baby_id (str): ID do bebê
            resultado (dict): Dados a salvar

        Returns:
            bool: True se salvo com sucesso
        """
        try:
            arquivo = OUTPUT_DIR / f"analytics_{baby_id}.json"
            
            with open(arquivo, 'w', encoding='utf-8') as f:
                if PRETTY_JSON:
                    json.dump(resultado, f, indent=2, ensure_ascii=False)
                else:
                    json.dump(resultado, f, ensure_ascii=False)

            logger.info(f"✓ Resultado salvo em: {arquivo}")
            return True

        except Exception as e:
            logger.error(f"✗ Erro ao salvar resultado: {str(e)}")
            return False

    def exibir_resultado(self, resultado: dict) -> None:
        """Exibe resultado formatado no console"""

        metadata = resultado.get("metadata", {})
        resumo = resultado.get("resumoGeral", {})
        bpm = resumo.get("batimentos", {})
        temp = resumo.get("temperatura", {})

        logger.info(f"\n{'='*60}")
        logger.info(f"ANÁLISE DE {metadata.get('babyId', 'DESCONHECIDO')}")
        logger.info(f"{'='*60}")

        logger.info(f"\n📊 RESUMO GERAL")
        logger.info(f"Total de coletas: {resumo.get('totalColetas', 0)}")
        logger.info(f"Período: {resumo.get('periodo_inicio', 'N/A')} até {resumo.get('periodo_fim', 'N/A')}")

        logger.info(f"\n💓 BATIMENTOS CARDÍACOS (BPM)")
        logger.info(f"  Média: {bpm.get('media', 0)} bpm")
        logger.info(f"  Moda: {bpm.get('moda', 'N/A')} bpm")
        logger.info(f"  Desvio Padrão: {bpm.get('desvio_padrao', 0)} bpm")
        logger.info(f"  Coef. Variação: {bpm.get('coeficiente_variacao', 0)}%")
        logger.info(f"  Mín: {bpm.get('minimo', 0)} | Máx: {bpm.get('maximo', 0)}")
        logger.info(f"  Fora do normal: {bpm.get('fora_do_normal', 0)} registros")
        logger.info(f"  Anomalias detectadas: {bpm.get('anomalias_detectadas', 0)}")

        logger.info(f"\n🌡️  TEMPERATURA (°C)")
        logger.info(f"  Média: {temp.get('media', 0)}°C")
        logger.info(f"  Moda: {temp.get('moda', 'N/A')}°C")
        logger.info(f"  Desvio Padrão: {temp.get('desvio_padrao', 0)}°C")
        logger.info(f"  Coef. Variação: {temp.get('coeficiente_variacao', 0)}%")
        logger.info(f"  Mín: {temp.get('minimo', 0)}°C | Máx: {temp.get('maximo', 0)}°C")
        logger.info(f"  Fora do normal: {temp.get('fora_do_normal', 0)} registros")
        logger.info(f"  Anomalias detectadas: {temp.get('anomalias_detectadas', 0)}")

        logger.info(f"\n{'='*60}\n")

    def close(self):
        """Fecha recursos"""
        self.fetcher.close()
        logger.info("Recursos liberados")


def main():
    """Função principal"""
    import sys

    orchestrator = AnalyticsOrchestrator()

    try:
        # Se passar ID de bebê como argumento
        if len(sys.argv) > 1:
            baby_id = sys.argv[1]
            resultado = orchestrator.analisar_bebe(baby_id)
            if resultado:
                orchestrator.exibir_resultado(resultado)
        else:
            # Analisar todos
            logger.info("Nenhum ID de bebê especificado. Analisando todos...")
            resultados = orchestrator.analisar_todos_bebes()
            
            # Exibir resumo
            for baby_id, resultado in resultados.items():
                orchestrator.exibir_resultado(resultado)

    except KeyboardInterrupt:
        logger.info("\n\n⚠️  Análise interrompida pelo usuário")
    except Exception as e:
        logger.error(f"✗ Erro fatal: {str(e)}", exc_info=True)
    finally:
        orchestrator.close()


if __name__ == "__main__":
    main()
