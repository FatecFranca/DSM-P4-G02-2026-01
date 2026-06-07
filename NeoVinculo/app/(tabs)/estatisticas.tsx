// app/(tabs)/estatisticas.tsx
import { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, VITAL_THRESHOLDS } from '../../constants';
import { useStore } from '../../hooks/useStore';
import { fetchEstatisticasDia, fetchHistoricoHoras, fetchAnalyticsAvancadas } from '../../services/api';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { format } from 'date-fns';

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

function AnalysisCard({ label, value, unit, icon, cor }: { label: string; value: number | string; unit: string; icon: string; cor?: string }) {
  return (
    <View style={styles.analysisCard}>
      <Text style={styles.analysisIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.analysisLabel}>{label}</Text>
        <Text style={[styles.analysisValue, { color: cor ?? COLORS.primary }]}>{value}</Text>
        <Text style={styles.analysisUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function RangeBar({ min, max, absMin, absMax, color }: {
  min: number; max: number; absMin: number; absMax: number; color: string;
}) {
  const range = absMax - absMin || 1;
  const left = Math.max(0, ((min - absMin) / range) * 100);
  const width = Math.max(5, ((max - min) / range) * 100);
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
  const [erro, setErro] = useState<string | null>(null);
  const [analyticsAvancadas, setAnalyticsAvancadas] = useState<any>(null);

  const carregar = useCallback(async () => {
    if (!babyId) return;
    setErro(null);
    try {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const [stats, horas, analytics] = await Promise.all([
        fetchEstatisticasDia(babyId, hoje),
        fetchHistoricoHoras(babyId, 12),
        fetchAnalyticsAvancadas(babyId),
      ]);
      setEstatisticas(stats);
      setHistoricoHoras(horas);
      if (analytics) {
        setAnalyticsAvancadas(analytics);
      }
    } catch (err: any) {
      console.error('Erro estatísticas:', err?.response?.data ?? err.message);
      setErro('Sem dados para hoje. Envie coletas pelo Postman para visualizar.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [babyId]);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  // Labels formatados para o gráfico
  const horasSlice = historicoHoras.slice(-6);
  const labels = horasSlice.map((h) => {
    try { return format(new Date(h.dataHora), 'HH:mm'); } catch { return '-'; }
  });

  const bpmData = {
    labels: labels.length > 0 ? labels : ['--'],
    datasets: [{ data: horasSlice.length > 0 ? horasSlice.map((h) => h.mediaBatimentos || 0) : [0] }],
  };

  const tempData = {
    labels: labels.length > 0 ? labels : ['--'],
    datasets: [{ data: horasSlice.length > 0 ? horasSlice.map((h) => h.mediaTemperatura || 0) : [0] }],
  };

  const chartConfig = (color: string) => ({
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: () => color,
    labelColor: () => COLORS.textMuted,
    propsForDots: { r: '3', strokeWidth: '1', stroke: color },
    decimalPlaces: 1,
  });

  const advancedStats = analyticsAvancadas?.resumoGeral;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); carregar(); }}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerSub}>Últimas 24 horas</Text>
        <Text style={styles.headerTitle}>Resumo do dia</Text>
      </View>

      {erro ? (
        <View style={styles.erroCard}>
          <Text style={styles.erroEmoji}>📊</Text>
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="BPM médio" value={`${Math.round(estatisticas?.mediaBatimentos ?? 0)}`} sub="batimentos/min" />
            <StatCard label="Temp. média" value={`${(estatisticas?.mediaTemperatura ?? 0).toFixed(1)}°C`} sub="graus Celsius" />
            <StatCard label="Coletas" value={`${estatisticas?.totalColetas ?? 0}`} sub="registros" cor={COLORS.success} />
            <StatCard label="Alertas" value={`${(estatisticas as any)?.totalAlertas ?? 0}`} sub="últimas 24h" cor={COLORS.primaryDark} />
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

          {horasSlice.length > 0 && (
            <>
              <View style={styles.chartCard}>
                <Text style={styles.sectionTitle}>BPM por hora</Text>
                <LineChart data={bpmData} width={W - 64} height={140}
                  chartConfig={chartConfig(COLORS.primary)} bezier
                  withInnerLines={false} withOuterLines={false}
                  style={{ borderRadius: 8 }} />
              </View>
              <View style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Temperatura por hora</Text>
                <LineChart data={tempData} width={W - 64} height={140}
                  chartConfig={chartConfig(COLORS.success)} bezier
                  withInnerLines={false} withOuterLines={false}
                  style={{ borderRadius: 8 }} />
              </View>
            </>
          )}

          {advancedStats && (
            <>
              <View style={styles.divider} />
              <View style={styles.advancedSection}>
                <View style={styles.advancedHeader}>
                  <Text style={styles.advancedTitle}>📈 Análise Avançada</Text>
                  <Text style={styles.advancedSubtitle}>Dados estatísticos completos</Text>
                </View>

                <Text style={styles.analysisSubtitle}>💓 Batimentos Cardíacos</Text>
                <View style={styles.analysisGrid}>
                  <AnalysisCard 
                    label="Moda"
                    value={advancedStats.batimentos?.moda ?? '-'}
                    unit="bpm (mais frequente)"
                    icon="🎯"
                    cor={COLORS.primary}
                  />
                  <AnalysisCard 
                    label="Desvio Padrão"
                    value={advancedStats.batimentos?.desvio_padrao?.toFixed(1) ?? '-'}
                    unit="bpm (variabilidade)"
                    icon="📊"
                    cor={COLORS.primaryDark}
                  />
                </View>
                <View style={styles.analysisGrid}>
                  <AnalysisCard 
                    label="Coef. Variação"
                    value={`${advancedStats.batimentos?.coeficiente_variacao?.toFixed(1) ?? '-'}%`}
                    unit="variabilidade relativa"
                    icon="📐"
                    cor={COLORS.success}
                  />
                  <AnalysisCard 
                    label="Q3 (75º %ile)"
                    value={advancedStats.batimentos?.q3?.toFixed(0) ?? '-'}
                    unit="bpm (75% abaixo)"
                    icon="📍"
                    cor={COLORS.info}
                  />
                </View>
                {advancedStats.batimentos?.anomalias_detectadas > 0 && (
                  <View style={[styles.anomalyAlert, { backgroundColor: COLORS.dangerLight }]}>
                    <Text style={styles.anomalyText}>
                      ⚠️ {advancedStats.batimentos.anomalias_detectadas} anomalia(s) detectada(s)
                    </Text>
                  </View>
                )}

                <Text style={[styles.analysisSubtitle, { marginTop: 16 }]}>🌡️  Temperatura</Text>
                <View style={styles.analysisGrid}>
                  <AnalysisCard 
                    label="Moda"
                    value={advancedStats.temperatura?.moda?.toFixed(1) ?? '-'}
                    unit="°C (mais frequente)"
                    icon="🎯"
                    cor={COLORS.success}
                  />
                  <AnalysisCard 
                    label="Desvio Padrão"
                    value={advancedStats.temperatura?.desvio_padrao?.toFixed(2) ?? '-'}
                    unit="°C (variabilidade)"
                    icon="📊"
                    cor={COLORS.primaryDark}
                  />
                </View>
                <View style={styles.analysisGrid}>
                  <AnalysisCard 
                    label="Coef. Variação"
                    value={`${advancedStats.temperatura?.coeficiente_variacao?.toFixed(1) ?? '-'}%`}
                    unit="variabilidade relativa"
                    icon="📐"
                    cor={COLORS.success}
                  />
                  <AnalysisCard 
                    label="Mediana"
                    value={advancedStats.temperatura?.mediana?.toFixed(1) ?? '-'}
                    unit="°C (valor central)"
                    icon="➡️"
                    cor={COLORS.info}
                  />
                </View>
                {advancedStats.temperatura?.anomalias_detectadas > 0 && (
                  <View style={[styles.anomalyAlert, { backgroundColor: COLORS.dangerLight }]}>
                    <Text style={styles.anomalyText}>
                      ⚠️ {advancedStats.temperatura.anomalias_detectadas} anomalia(s) detectada(s)
                    </Text>
                  </View>
                )}

                <Text style={[styles.analysisNote, { marginBottom: 28 }]}>
                  ℹ️ Dados processados pelo sistema de análise avançada
                </Text>
              </View>
            </>
          )}
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
  erroCard: {
    marginHorizontal: 16, marginTop: 20, padding: 24,
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center',
  },
  erroEmoji: { fontSize: 36, marginBottom: 12 },
  erroText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  
  // Advanced Analysis Styles
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
    marginHorizontal: 16,
  },
  advancedSection: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  advancedHeader: {
    marginBottom: 16,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  advancedSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  analysisSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 12,
  },
  analysisGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  analysisCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: 'flex-start',
    gap: 10,
  },
  analysisIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  analysisLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  analysisUnit: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  anomalyAlert: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  anomalyText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '500',
  },
  analysisNote: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

function RangeBar({ min, max, absMin, absMax, color }: {
  min: number; max: number; absMin: number; absMax: number; color: string;
}) {
  const range = absMax - absMin || 1;
  const left = Math.max(0, ((min - absMin) / range) * 100);
  const width = Math.max(5, ((max - min) / range) * 100);
  return (
    <View style={styles.rangeBar}>
      <View style={[styles.rangeFill, { marginLeft: `${left}%` as any, width: `${width}%` as any, backgroundColor: color }]} />
    </View>
  );
}

export default function EstatisticasScreen() {
  const insets = useSafeAreaInsets();
  // ✅ corrigido: babyId (não bebeId)
  const { babyId, estatisticas, historicoHoras, setEstatisticas, setHistoricoHoras } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!babyId) return;
    setErro(null);
    try {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const [stats, horas] = await Promise.all([
        fetchEstatisticasDia(babyId, hoje),
        fetchHistoricoHoras(babyId, 12),
      ]);
      setEstatisticas(stats);
      setHistoricoHoras(horas);
    } catch (err: any) {
      console.error('Erro estatísticas:', err?.response?.data ?? err.message);
      setErro('Sem dados para hoje. Envie coletas pelo Postman para visualizar.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [babyId]);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  // Labels formatados para o gráfico
  const horasSlice = historicoHoras.slice(-6);
  const labels = horasSlice.map((h) => {
    try { return format(new Date(h.dataHora), 'HH:mm'); } catch { return '-'; }
  });

  const bpmData = {
    labels: labels.length > 0 ? labels : ['--'],
    datasets: [{ data: horasSlice.length > 0 ? horasSlice.map((h) => h.mediaBatimentos || 0) : [0] }],
  };

  const tempData = {
    labels: labels.length > 0 ? labels : ['--'],
    datasets: [{ data: horasSlice.length > 0 ? horasSlice.map((h) => h.mediaTemperatura || 0) : [0] }],
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); carregar(); }}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerSub}>Últimas 24 horas</Text>
        <Text style={styles.headerTitle}>Resumo do dia</Text>
      </View>

      {erro ? (
        <View style={styles.erroCard}>
          <Text style={styles.erroEmoji}>📊</Text>
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="BPM médio" value={`${Math.round(estatisticas?.mediaBatimentos ?? 0)}`} sub="batimentos/min" />
            <StatCard label="Temp. média" value={`${(estatisticas?.mediaTemperatura ?? 0).toFixed(1)}°C`} sub="graus Celsius" />
            <StatCard label="Coletas" value={`${estatisticas?.totalColetas ?? 0}`} sub="registros" cor={COLORS.success} />
            <StatCard label="Alertas" value={`${(estatisticas as any)?.totalAlertas ?? 0}`} sub="últimas 24h" cor={COLORS.primaryDark} />
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

          {horasSlice.length > 0 && (
            <>
              <View style={styles.chartCard}>
                <Text style={styles.sectionTitle}>BPM por hora</Text>
                <LineChart data={bpmData} width={W - 64} height={140}
                  chartConfig={chartConfig(COLORS.primary)} bezier
                  withInnerLines={false} withOuterLines={false}
                  style={{ borderRadius: 8 }} />
              </View>
              <View style={[styles.chartCard, { marginBottom: 28 }]}>
                <Text style={styles.sectionTitle}>Temperatura por hora</Text>
                <LineChart data={tempData} width={W - 64} height={140}
                  chartConfig={chartConfig(COLORS.success)} bezier
                  withInnerLines={false} withOuterLines={false}
                  style={{ borderRadius: 8 }} />
              </View>
            </>
          )}
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
  erroCard: {
    marginHorizontal: 16, marginTop: 20, padding: 24,
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center',
  },
  erroEmoji: { fontSize: 36, marginBottom: 12 },
  erroText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
