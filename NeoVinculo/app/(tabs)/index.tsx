import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, VITAL_THRESHOLDS } from '../../constants';
import { useStore } from '../../hooks/useStore';
import { fetchColetasRecentes, fetchUltimaColeta, Coleta } from '../../services/api';

const CHART_WIDTH = Dimensions.get('window').width - 48;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { bebe, babyId, isConectado, ultimaColeta, setUltimaColeta } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [coletas, setColetas] = useState<Coleta[]>([]);

  const carregarDados = useCallback(async () => {
    if (!babyId) {
      setLoading(false);
      return;
    }

    setErro(null);
    try {
      const [ultimasColetas, ultima] = await Promise.all([
        fetchColetasRecentes(babyId, 10),
        fetchUltimaColeta(babyId),
      ]);
      setColetas(ultimasColetas);
      setUltimaColeta(ultima);
    } catch (err: any) {
      console.error('Erro carregar home:', err?.response?.data ?? err.message);
      setErro('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [babyId, setUltimaColeta]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const status = ultimaColeta ?
    (ultimaColeta.temperatura >= VITAL_THRESHOLDS.temperature.min &&
      ultimaColeta.temperatura <= VITAL_THRESHOLDS.temperature.max &&
      ultimaColeta.batimentos >= VITAL_THRESHOLDS.heartRate.min &&
      ultimaColeta.batimentos <= VITAL_THRESHOLDS.heartRate.max)
      ? 'normal' : 'alerta'
    : 'vazio';

  const formattedTime = ultimaColeta ? format(new Date(ultimaColeta.dataHora), 'HH:mm:ss', { locale: ptBR }) : '-';

  const chartLabels = coletas.map((item) => {
    try { return format(new Date(item.dataHora), 'HH:mm'); } catch { return '-'; }
  });

  const tempData = {
    labels: chartLabels.length > 0 ? chartLabels : ['--'],
    datasets: [{ data: chartLabels.length > 0 ? coletas.map((item) => item.temperatura) : [0] }],
  };

  const bpmData = {
    labels: chartLabels.length > 0 ? chartLabels : ['--'],
    datasets: [{ data: chartLabels.length > 0 ? coletas.map((item) => item.batimentos) : [0] }],
  };

  const chartConfig = (color: string) => ({
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: () => color,
    labelColor: () => COLORS.textMuted,
    propsForDots: { r: '3', strokeWidth: '1', stroke: color },
    decimalPlaces: 1,
  });

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}> 
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Carregando tela inicial...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            carregarDados();
          }}
          tintColor={COLORS.primary}
        />
      )}
    >
      <View style={styles.header}>
        <Text style={styles.headerSub}>Bem-vindo de volta</Text>
        <Text style={styles.headerTitle}>{bebe?.nome ?? 'Seu bebê'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Última coleta</Text>
        {ultimaColeta ? (
          <>
            <Text style={styles.statusText}>
              {status === 'normal' ? 'Tudo dentro do normal 👍' : 'Atenção: valor fora do normal ⚠️'}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Temperatura</Text>
              <Text style={styles.value}>{ultimaColeta.temperatura.toFixed(1)}°C</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>BPM</Text>
              <Text style={styles.value}>{ultimaColeta.batimentos} bpm</Text>
            </View>
            <View style={styles.row}> 
              <Text style={styles.label}>Horário</Text>
              <Text style={styles.value}>{formattedTime}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: status === 'normal' ? COLORS.successLight : COLORS.primaryLight }]}> 
                <Text style={[styles.badgeText, { color: status === 'normal' ? COLORS.success : COLORS.primaryDark }]}>Status {status === 'normal' ? 'Normal' : 'Alerta'}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: isConectado ? COLORS.successLight : COLORS.textMuted }]}> 
                <Text style={[styles.badgeText, { color: isConectado ? COLORS.success : COLORS.textSecondary }]}>Sensor {isConectado ? 'conectado' : 'desconectado'}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Nenhuma coleta disponível ainda. Puxe para atualizar.</Text>
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Temperatura coletada</Text>
        <LineChart
          data={tempData}
          width={CHART_WIDTH}
          height={170}
          chartConfig={chartConfig(COLORS.success)}
          bezier
          withInnerLines={false}
          withOuterLines={false}
          style={styles.chart}
        />
      </View>

      <View style={[styles.chartCard, { marginBottom: 28 }]}> 
        <Text style={styles.chartTitle}>Batimentos cardíacos</Text>
        <LineChart
          data={bpmData}
          width={CHART_WIDTH}
          height={170}
          chartConfig={chartConfig(COLORS.primary)}
          bezier
          withInnerLines={false}
          withOuterLines={false}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: COLORS.textSecondary },
  header: { padding: 20, paddingBottom: 12 },
  headerSub: { fontSize: 13, color: COLORS.textSecondary },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  card: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 0.5, borderColor: COLORS.border, padding: 18, marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  statusText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 13, color: COLORS.textSecondary },
  value: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  badgeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  chartCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 0.5, borderColor: COLORS.border, padding: 16, marginBottom: 16,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  chart: { borderRadius: 16 },
});
