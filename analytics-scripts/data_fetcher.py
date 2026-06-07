# data_fetcher.py
"""
Módulo para buscar dados de sinais vitais da API backend
"""

import requests
import logging
from typing import List, Dict, Optional
from datetime import datetime
from config import API_BASE_URL, API_TIMEOUT, LOG_LEVEL

# Configurar logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL))
logger = logging.getLogger(__name__)


class DataFetcher:
    """Classe para buscar dados da API backend de forma segura e eficiente"""

    def __init__(self, base_url: str = API_BASE_URL, timeout: int = API_TIMEOUT):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()

    def fetch_vitals_by_baby(self, baby_id: str) -> Optional[List[Dict]]:
        """
        Busca todos os sinais vitais de um bebê específico

        Args:
            baby_id (str): ID do bebê (ex: "Prematuro_01")

        Returns:
            List[Dict]: Lista de registros com campos:
                - _id: ID do documento MongoDB
                - babyId: ID do bebê
                - temperatura: Temperatura em °C
                - batimentos: BPM (batimentos por minuto)
                - dataHora: Timestamp ISO 8601
            None: Se falhar na requisição
        """
        try:
            url = f"{self.base_url}/vitals/{baby_id}"
            logger.info(f"Buscando sinais vitais de {baby_id}...")
            
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"✓ Obtidos {len(data)} registros de {baby_id}")
            return data

        except requests.exceptions.ConnectionError:
            logger.error(f"✗ Erro de conexão ao {self.base_url}")
            return None
        except requests.exceptions.Timeout:
            logger.error(f"✗ Timeout ao conectar a {self.base_url}")
            return None
        except requests.exceptions.HTTPError as e:
            logger.error(f"✗ Erro HTTP {e.response.status_code}: {e}")
            return None
        except Exception as e:
            logger.error(f"✗ Erro inesperado: {str(e)}")
            return None

    def fetch_all_vitals(self) -> Optional[List[Dict]]:
        """
        Busca todos os sinais vitais de todos os bebês

        Returns:
            List[Dict]: Lista de registros
            None: Se falhar
        """
        try:
            url = f"{self.base_url}/vitals"
            logger.info("Buscando todos os sinais vitais...")
            
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"✓ Obtidos {len(data)} registros no total")
            return data

        except Exception as e:
            logger.error(f"✗ Erro ao buscar todos os vitais: {str(e)}")
            return None

    def fetch_estatisticas_dia(self, baby_id: str, data: str) -> Optional[Dict]:
        """
        Busca estatísticas de um dia específico (já agregadas pelo backend)

        Args:
            baby_id (str): ID do bebê
            data (str): Data no formato YYYY-MM-DD

        Returns:
            Dict: Dados agregados
            None: Se falhar
        """
        try:
            url = f"{self.base_url}/estatisticas/{baby_id}/dia"
            params = {"data": data}
            logger.info(f"Buscando estatísticas de {baby_id} para {data}...")
            
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"✓ Estatísticas obtidas com sucesso")
            return data

        except Exception as e:
            logger.error(f"✗ Erro ao buscar estatísticas: {str(e)}")
            return None

    def fetch_historico_horas(self, baby_id: str, horas: int = 12) -> Optional[List[Dict]]:
        """
        Busca histórico agregado por hora

        Args:
            baby_id (str): ID do bebê
            horas (int): Quantas horas anteriores retornar

        Returns:
            List[Dict]: Histórico por hora
            None: Se falhar
        """
        try:
            url = f"{self.base_url}/estatisticas/{baby_id}/horas"
            params = {"horas": horas}
            logger.info(f"Buscando histórico de {horas}h para {baby_id}...")
            
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"✓ Histórico obtido: {len(data)} períodos")
            return data

        except Exception as e:
            logger.error(f"✗ Erro ao buscar histórico: {str(e)}")
            return None

    def validar_dados(self, vitals: List[Dict]) -> List[Dict]:
        """
        Valida e filtra dados inválidos

        Args:
            vitals: Lista de registros de sinais vitais

        Returns:
            List[Dict]: Dados validados
        """
        validos = []
        invalidos = 0

        for vital in vitals:
            try:
                # Verificar campos obrigatórios
                assert "babyId" in vital
                assert "batimentos" in vital
                assert "temperatura" in vital
                assert "dataHora" in vital

                # Verificar tipos
                assert isinstance(vital["batimentos"], (int, float))
                assert isinstance(vital["temperatura"], (int, float))
                assert vital["batimentos"] > 0
                assert vital["temperatura"] > 0

                validos.append(vital)
            except (AssertionError, KeyError):
                invalidos += 1
                continue

        if invalidos > 0:
            logger.warning(f"⚠ {invalidos} registros inválidos descartados")

        return validos

    def close(self):
        """Fecha a sessão de requisições"""
        self.session.close()
        logger.debug("Sessão encerrada")


def obter_dados_baby(baby_id: str) -> Optional[List[Dict]]:
    """
    Função auxiliar para obter dados de um bebê

    Args:
        baby_id (str): ID do bebê

    Returns:
        List[Dict]: Dados validados
    """
    fetcher = DataFetcher()
    try:
        dados = fetcher.fetch_vitals_by_baby(baby_id)
        if dados:
            return fetcher.validar_dados(dados)
        return None
    finally:
        fetcher.close()


if __name__ == "__main__":
    # Teste
    fetcher = DataFetcher()
    vitals = fetcher.fetch_vitals_by_baby("Prematuro_01")
    if vitals:
        print(f"Primeiros 3 registros: {vitals[:3]}")
    fetcher.close()
