"""
Módulo para cálculos estatísticos avançados de sinais vitais
Calcula: Média, Moda, Desvio Padrão, por período de tempo
"""

import logging
from typing import List, Dict
from datetime import datetime
from statistics import mean, mode, stdev, StatisticsError
from collections import Counter

from config import LOG_LEVEL, VITAL_THRESHOLDS

logging.basicConfig(level=getattr(logging, LOG_LEVEL))
logger = logging.getLogger(__name__)


class StatsCalculator:
    """Calculadora de estatísticas para sinais vitais"""

    def __init__(self):
        self.thresholds = VITAL_THRESHOLDS

    def calcular_media(self, valores: List[float]) -> float:
        if not valores:
            return 0.0
        return round(mean(valores), 2)

    def calcular_moda(self, valores: List[float]) -> float:
        if not valores or len(valores) < 2:
            return 0.0

        try:
            valores_arredondados = [round(v, 1) for v in valores]
            return float(mode(valores_arredondados))
        except StatisticsError:
            return self._calcular_moda_customizada(valores_arredondados)

    def _calcular_moda_customizada(self, valores: List[float]) -> float:
        if not valores:
            return 0.0

        contador = Counter(valores)
        mais_comuns = contador.most_common(2)

        if len(mais_comuns) == 2 and mais_comuns[0][1] == mais_comuns[1][1]:
            return round((mais_comuns[0][0] + mais_comuns[1][0]) / 2, 2)

        return round(mais_comuns[0][0], 2)

    def calcular_desvio_padrao(self, valores: List[float]) -> float:
        if len(valores) < 2:
            return 0.0

        try:
            return round(stdev(valores), 2)
        except StatisticsError:
            return 0.0

    def calcular_coeficiente_variacao(self, valores: List[float]) -> float:
        if not valores:
            return 0.0

        media = self.calcular_media(valores)
        if media == 0:
            return 0.0

        desvio = self.calcular_desvio_padrao(valores)
        return round((desvio / abs(media)) * 100, 2)

    def calcular_min_max_q1_q3_mediana(self, valores: List[float]) -> Dict:
        if not valores:
            return {
                "minimo": 0,
                "maximo": 0,
                "mediana": 0,
                "q1": 0,
                "q3": 0
            }

        sorted_vals = sorted(valores)
        n = len(sorted_vals)

        minimo = sorted_vals[0]
        maximo = sorted_vals[-1]
        mediana = sorted_vals[n // 2]
        q1_idx = n // 4
        q3_idx = (3 * n) // 4

        return {
            "minimo": round(minimo, 2),
            "maximo": round(maximo, 2),
            "mediana": round(mediana, 2),
            "q1": round(sorted_vals[q1_idx], 2),
            "q3": round(sorted_vals[q3_idx], 2)
        }

    def detectar_anomalias(self, valores: List[float], metodo: str = "iqr") -> Dict:
        if len(valores) < 4:
            return {"indices": [], "valores": []}

        if metodo == "iqr":
            stats = self.calcular_min_max_q1_q3_mediana(valores)
            iqr = stats["q3"] - stats["q1"]
            lower_bound = stats["q1"] - 1.5 * iqr
            upper_bound = stats["q3"] + 1.5 * iqr

            indices = [i for i, v in enumerate(valores) if v < lower_bound or v > upper_bound]
            valores_anomalias = [valores[i] for i in indices]
            return {"indices": indices, "valores": valores_anomalias}

        media = self.calcular_media(valores)
        desvio = self.calcular_desvio_padrao(valores)

        if desvio == 0:
            return {"indices": [], "valores": []}

        indices = [i for i, v in enumerate(valores) if abs((v - media) / desvio) > 3]
        valores_anomalias = [valores[i] for i in indices]
        return {"indices": indices, "valores": valores_anomalias}

    def agrupar_por_periodo(self, vitals: List[Dict], periodo_segundos: int) -> Dict[str, List[Dict]]:
        grupos = {}

        for vital in vitals:
            try:
                dt = datetime.fromisoformat(vital["dataHora"].replace("Z", "+00:00"))
                timestamp = int(dt.timestamp())
                chave_periodo = (timestamp // periodo_segundos) * periodo_segundos
                chave_iso = datetime.fromtimestamp(chave_periodo).isoformat()

                grupos.setdefault(chave_iso, []).append(vital)
            except Exception as e:
                logger.warning(f"Erro ao processar data: {vital.get('dataHora', 'unknown')} - {e}")
                continue

        return grupos

    def processar_por_periodo(self, vitals: List[Dict], periodo_segundos: int) -> List[Dict]:
        grupos = self.agrupar_por_periodo(vitals, periodo_segundos)
        resultados = []

        for periodo_iso, registros in sorted(grupos.items()):
            batimentos = [v.get("batimentos", 0) for v in registros if v.get("batimentos")]
            temperaturas = [v.get("temperatura", 0) for v in registros if v.get("temperatura")]

            if not batimentos or not temperaturas:
                continue

            resultados.append({
                "periodo": periodo_iso,
                "totalColetas": len(registros),
                "batimentos": {
                    "media": self.calcular_media(batimentos),
                    "moda": self.calcular_moda(batimentos),
                    "desvio_padrao": self.calcular_desvio_padrao(batimentos),
                    "coeficiente_variacao": self.calcular_coeficiente_variacao(batimentos),
                    **self.calcular_min_max_q1_q3_mediana(batimentos)
                },
                "temperatura": {
                    "media": self.calcular_media(temperaturas),
                    "moda": self.calcular_moda(temperaturas),
                    "desvio_padrao": self.calcular_desvio_padrao(temperaturas),
                    "coeficiente_variacao": self.calcular_coeficiente_variacao(temperaturas),
                    **self.calcular_min_max_q1_q3_mediana(temperaturas)
                }
            })

        return resultados

    def gerar_resumo_geral(self, vitals: List[Dict]) -> Dict:
        if not vitals:
            return {
                "totalColetas": 0,
                "periodo_inicio": None,
                "periodo_fim": None,
                "batimentos": {},
                "temperatura": {}
            }

        batimentos = [v.get("batimentos") for v in vitals if v.get("batimentos")]
        temperaturas = [v.get("temperatura") for v in vitals if v.get("temperatura")]

        datas = []
        for v in vitals:
            try:
                dt = datetime.fromisoformat(v.get("dataHora", "").replace("Z", "+00:00"))
                datas.append(dt)
            except Exception:
                continue

        periodo_inicio = min(datas).isoformat() if datas else None
        periodo_fim = max(datas).isoformat() if datas else None

        anomalias_bpm = self.detectar_anomalias(batimentos, "iqr")
        anomalias_temp = self.detectar_anomalias(temperaturas, "iqr")

        return {
            "totalColetas": len(vitals),
            "periodo_inicio": periodo_inicio,
            "periodo_fim": periodo_fim,
            "batimentos": {
                "media": self.calcular_media(batimentos),
                "moda": self.calcular_moda(batimentos),
                "desvio_padrao": self.calcular_desvio_padrao(batimentos),
                "coeficiente_variacao": self.calcular_coeficiente_variacao(batimentos),
                **self.calcular_min_max_q1_q3_mediana(batimentos),
                "anomalias_detectadas": len(anomalias_bpm["valores"]),
                "fora_do_normal": sum(1 for b in batimentos if b < self.thresholds["heartRate"]["min"] or b > self.thresholds["heartRate"]["max"])
            },
            "temperatura": {
                "media": self.calcular_media(temperaturas),
                "moda": self.calcular_moda(temperaturas),
                "desvio_padrao": self.calcular_desvio_padrao(temperaturas),
                "coeficiente_variacao": self.calcular_coeficiente_variacao(temperaturas),
                **self.calcular_min_max_q1_q3_mediana(temperaturas),
                "anomalias_detectadas": len(anomalias_temp["valores"]),
                "fora_do_normal": sum(1 for t in temperaturas if t < self.thresholds["temperature"]["min"] or t > self.thresholds["temperature"]["max"])
            }
        }


if __name__ == "__main__":
    calc = StatsCalculator()
    teste_valores = [120, 125, 128, 130, 125, 122, 128, 130, 128, 125]

    print(f"Valores: {teste_valores}")
    print(f"Média: {calc.calcular_media(teste_valores)}")
    print(f"Moda: {calc.calcular_moda(teste_valores)}")
    print(f"Desvio Padrão: {calc.calcular_desvio_padrao(teste_valores)}")
    print(f"CV: {calc.calcular_coeficiente_variacao(teste_valores)}%")
    print(f"Descritivas: {calc.calcular_min_max_q1_q3_mediana(teste_valores)}")
