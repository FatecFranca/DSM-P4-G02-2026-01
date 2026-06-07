const path = require('path');
const { promises: fs } = require('fs');
const { execFile } = require('child_process');
const util = require('util');
const SinalVital = require('../models/SinalVital');

const execFileAsync = util.promisify(execFile);
const ANALYTICS_SCRIPT_DIR = path.resolve(__dirname, '../../..', 'analytics-scripts');
const OUTPUT_DIR = path.join(ANALYTICS_SCRIPT_DIR, 'output');
let pythonCmdCache = null;

const findPythonCommand = async () => {
  if (pythonCmdCache) {
    return pythonCmdCache;
  }

  const candidates = ['python', 'python3', 'py'];
  for (const cmd of candidates) {
    try {
      await execFileAsync(cmd, ['--version']);
      pythonCmdCache = cmd;
      return cmd;
    } catch (_err) {
      continue;
    }
  }

  throw new Error('Python não encontrado. Instale Python 3 e adicione-o ao PATH.');
};

const runPythonAnalytics = async (bebeId) => {
  const pythonCmd = await findPythonCommand();
  const scriptPath = path.join(ANALYTICS_SCRIPT_DIR, 'main.py');
  const outputPath = path.join(OUTPUT_DIR, `analytics_${bebeId}.json`);

  await execFileAsync(pythonCmd, [scriptPath, bebeId], {
    cwd: ANALYTICS_SCRIPT_DIR,
    timeout: 30000,
    windowsHide: true
  });

  const fileContent = await fs.readFile(outputPath, 'utf-8');
  return JSON.parse(fileContent);
};

const parseDate = (value) => {
  const parts = String(value).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
};

const roundValue = (value, decimals = 2) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

module.exports = {
  async estatisticasDia(req, res) {
    try {
      const { bebeId } = req.params;
      const { data } = req.query;

      if (!data) {
        return res.status(400).json({ erro: 'Parâmetro data é obrigatório.' });
      }

      const inicio = parseDate(data);
      if (!inicio) {
        return res.status(400).json({ erro: 'Formato de data inválido. Use YYYY-MM-DD.' });
      }

      const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

      const stats = await SinalVital.aggregate([
        {
          $match: {
            babyId: bebeId,
            dataHora: { $gte: inicio, $lt: fim }
          }
        },
        {
          $group: {
            _id: null,
            totalColetas: { $sum: 1 },
            mediaBatimentos: { $avg: '$batimentos' },
            mediaTemperatura: { $avg: '$temperatura' },
            minBatimentos: { $min: '$batimentos' },
            maxBatimentos: { $max: '$batimentos' },
            minTemperatura: { $min: '$temperatura' },
            maxTemperatura: { $max: '$temperatura' }
          }
        }
      ]);

      if (stats.length === 0) {
        return res.status(404).json({ erro: 'Nenhuma coleta encontrada para a data informada.' });
      }

      const resultado = stats[0];
      return res.json({
        bebeId,
        data,
        totalColetas: resultado.totalColetas,
        mediaBatimentos: roundValue(resultado.mediaBatimentos),
        mediaTemperatura: roundValue(resultado.mediaTemperatura),
        minBatimentos: resultado.minBatimentos,
        maxBatimentos: resultado.maxBatimentos,
        minTemperatura: roundValue(resultado.minTemperatura),
        maxTemperatura: roundValue(resultado.maxTemperatura)
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas do dia:', error);
      return res.status(500).json({ erro: 'Erro ao calcular estatísticas do dia.' });
    }
  },

  async historicoHoras(req, res) {
    try {
      const { bebeId } = req.params;
      const horas = parseInt(req.query.horas, 10);

      if (Number.isNaN(horas) || horas <= 0) {
        return res.status(400).json({ erro: 'Parâmetro horas deve ser um número inteiro maior que zero.' });
      }

      const agora = new Date();
      const inicio = new Date(agora.getTime() - horas * 60 * 60 * 1000);

      const agrupamento = await SinalVital.aggregate([
        {
          $match: {
            babyId: bebeId,
            dataHora: { $gte: inicio }
          }
        },
        {
          $project: {
            year: { $year: '$dataHora' },
            month: { $month: '$dataHora' },
            day: { $dayOfMonth: '$dataHora' },
            hour: { $hour: '$dataHora' },
            batimentos: '$batimentos',
            temperatura: '$temperatura'
          }
        },
        {
          $group: {
            _id: {
              year: '$year',
              month: '$month',
              day: '$day',
              hour: '$hour'
            },
            totalColetas: { $sum: 1 },
            mediaBatimentos: { $avg: '$batimentos' },
            mediaTemperatura: { $avg: '$temperatura' }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
            '_id.day': 1,
            '_id.hour': 1
          }
        }
      ]);

      const historico = agrupamento.map((item) => ({
        bebeId,
        dataHora: `${item._id.year.toString().padStart(4, '0')}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}T${item._id.hour.toString().padStart(2, '0')}:00:00Z`,
        totalColetas: item.totalColetas,
        mediaBatimentos: roundValue(item.mediaBatimentos),
        mediaTemperatura: roundValue(item.mediaTemperatura)
      }));

      return res.json(historico);
    } catch (error) {
      console.error('Erro ao calcular histórico por horas:', error);
      return res.status(500).json({ erro: 'Erro ao calcular histórico por horas.' });
    }
  },

  async analyticsAvancadas(req, res) {
    try {
      const { bebeId } = req.params;
      const exists = await SinalVital.exists({ babyId: bebeId });

      if (!exists) {
        return res.status(404).json({ erro: 'Nenhuma coleta encontrada para este bebê.' });
      }

      const resultado = await runPythonAnalytics(bebeId);
      return res.json(resultado);
    } catch (error) {
      console.error('Erro ao calcular analytics avançadas:', error);
      return res.status(500).json({ erro: error.message || 'Erro ao gerar analytics avançadas.' });
    }
  }
};
