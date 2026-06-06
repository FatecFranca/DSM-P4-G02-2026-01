// app/(tabs)/estatisticas.tsx
import { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, VITAL_THRESHOLDS } from '../../constants';
import { useStore } from '../../hooks/useStore';
import { fetchEstatisticasDia, fetchHistoricoHoras } from '../../services/api';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const W = Dimensions.get('window').width;

function StatCard({ label, value, sub, cor }: { label: string; value: string; sub: string; cor?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: cor ?? COLORS.primary }]}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function RangeBar({ min, max, absMin, absMax, color }: { min: number; max: number; absMin: number; absMax: number; color: string }) {
  const range = absMax - absMin || 1;
  const left = ((min - absMin) / range) * 100;
  const width = ((max - min) / range) * 100;
  return (
    <View style={styles.rangeBar}>
      <View style={[styles.rangeFill, { marginLeft: `${left}%` as any, width: `${width}%` as any, backgroundColor: color }]} />
    </View>
  );
}

export default function EstatisticasScreen() {
  const insets = useSafeAreaInsets();
  const { babyId, estatisticas, historicoHoras, setEstatisticas, setHistoricoHoras } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    if (!babyId) return;
    try {
      const [stats, horas] = await Promise.all([
        fetchEstatisticasDia(babyId),
        fetchHistoricoHoras(babyId, 12),
      ]);
      setEstatisticas(stats);
      setHistoricoHoras(horas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bebeId]);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  const bpmData = {
    labels: historicoHoras.slice(-6).map((h) => h.dataHora),
    datasets: [{ data: historicoHoras.slice(-6).map((h) => h.mediaBatimentos || 140) }],
  };

  const tempData = {
    labels: historicoHoras.slice(-6).map((h) => h.dataHora),
    datasets: [{ data: historicoHoras.slice(-6).map((h) => h.mediaTemperatura || 36.8) }],
  };

  const chartConfig = (color: string) => ({
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: () => color,
    labelColor: () => COLORS.textMuted,
    propsForDots: { r: '3', strokeWidth: '1', stroke: color },
    decimalPlaces: 1,
  });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerSub}>Últimas 24 horas</Text>
        <Text style={styles.headerTitle}>Resumo do dia</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="BPM médio" value={`${Math.round(estatisticas?.mediaBatimentos ?? 0)}`} sub="batimentos/min" />
        <StatCard label="Temp. média" value={`${(estatisticas?.mediaTemperatura ?? 0).toFixed(1)}°C`} sub="graus Celsius" />
        <StatCard label="Alertas" value={`${estatisticas?.totalAlertas ?? 0}`} sub="últimas 24h" cor={COLORS.primaryDark} />
        <StatCard label="Coletas" value={`${estatisticas?.totalColetas ?? 0}`} sub="registros" cor={COLORS.success} />
      </View>

      {estatisticas && (
        <>
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Variação de BPM</Text>
            <View style={styles.minMax}>
              <Text style={styles.minMaxText}>Mín: {estatisticas.minBatimentos} bpm</Text>
              <Text style={styles.minMaxText}>Máx: {estatisticas.maxBatimentos} bpm</Text>
            </View>
            <RangeBar
              min={estatisticas.minBatimentos}
              max={estatisticas.maxBatimentos}
              absMin={VITAL_THRESHOLDS.heartRate.min - 20}
              absMax={VITAL_THRESHOLDS.heartRate.max + 20}
              color={COLORS.primary}
            />
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabelText}>{VITAL_THRESHOLDS.heartRate.min - 20}</Text>
              <Text style={styles.rangeLabelText}>{VITAL_THRESHOLDS.heartRate.min}</Text>
              <Text style={styles.rangeLabelText}>{VITAL_THRESHOLDS.heartRate.max}</Text>
              <Text style={styles.rangeLabelText}>{VITAL_THRESHOLDS.heartRate.max + 20}</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Variação de temperatura</Text>
            <View style={styles.minMax}>
              <Text style={styles.minMaxText}>Mín: {estatisticas.minTemperatura.toFixed(1)}°C</Text>
              <Text style={styles.minMaxText}>Máx: {estatisticas.maxTemperatura.toFixed(1)}°C</Text>
            </View>
            <RangeBar
              min={estatisticas.minTemperatura}
              max={estatisticas.maxTemperatura}
              absMin={35}
              absMax={39}
              color={COLORS.success}
            />
            <View style={styles.rangeLabels}>
              {['35°', '36°', '37°', '38°', '39°'].map((l) => (
                <Text key={l} style={styles.rangeLabelText}>{l}</Text>
              ))}
            </View>
          </View>
        </>
      )}

      {historicoHoras.length > 0 && (
        <>
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>BPM por hora</Text>
            <LineChart data={bpmData} width={W - 64} height={140}
              chartConfig={chartConfig(COLORS.primary)} bezier withInnerLines={false} withOuterLines={false}
              style={{ borderRadius: 8 }} />
          </View>
          <View style={[styles.chartCard, { marginBottom: 28 }]}>
            <Text style={styles.sectionTitle}>Temperatura por hora</Text>
            <LineChart data={tempData} width={W - 64} height={140}
              chartConfig={chartConfig(COLORS.success)} bezier withInnerLines={false} withOuterLines={false}
              style={{ borderRadius: 8 }} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12 },
  headerSub: { fontSize: 13, color: COLORS.textSecondary },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 0.5, borderColor: COLORS.border, padding: 14, alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '600' },
  statSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  chartCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: COLORS.border, padding: 14, marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 8 },
  minMax: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  minMaxText: { fontSize: 10, color: COLORS.textMuted },
  rangeBar: { height: 8, backgroundColor: COLORS.primaryLight, borderRadius: 4, marginBottom: 4 },
  rangeFill: { height: '100%', borderRadius: 4 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeLabelText: { fontSize: 9, color: COLORS.textMuted },
});
