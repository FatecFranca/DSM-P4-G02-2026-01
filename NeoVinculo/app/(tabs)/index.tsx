// app/(tabs)/index.tsx
import { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../hooks/useStore';
import { fetchUltimaColeta, fetchHistoricoHoras } from '../../services/api';
import { COLORS, VITAL_THRESHOLDS } from '../../constants';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const W = Dimensions.get('window').width;

function VitalCard({
  label, value, unit, emoji, tipo,
}: { label: string; value: number | undefined; unit: string; emoji: string; tipo: 'batimentos' | 'temperatura' }) {
  if (value === undefined) return null;
  const thresh = tipo === 'batimentos' ? VITAL_THRESHOLDS.heartRate : VITAL_THRESHOLDS.temperature;
  const normal = value >= thresh.min && value <= thresh.max;

  return (
    <View style={[styles.vitalCard, { borderColor: normal ? COLORS.border : COLORS.primaryMid }]}>
      <Text style={styles.vitalEmoji}>{emoji}</Text>
      <Text style={styles.vitalLabel}>{label}</Text>
      <Text style={[styles.vitalValue, { color: normal ? COLORS.textPrimary : COLORS.primary }]}>
        {tipo === 'temperatura' ? value.toFixed(1) : value}
        <Text style={styles.vitalUnit}> {unit}</Text>
      </Text>
      <View style={[styles.badge, { backgroundColor: normal ? COLORS.successLight : COLORS.primaryLight }]}>
        <Text style={[styles.badgeText, { color: normal ? COLORS.success : COLORS.primaryDark }]}>
          {normal ? 'Normal' : 'Atenção'}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    bebe, ultimaColeta, alertas, historicoHoras,
    babyId, setUltimaColeta, setHistoricoHoras,
  } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (!babyId) return;
    try {
      const [coleta, historico] = await Promise.all([
        fetchUltimaColeta(babyId),
        fetchHistoricoHoras(babyId, 6),
      ]);
      setUltimaColeta(coleta);
      setHistoricoHoras(historico);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bebeId]);

  useEffect(() => { carregar(); }, [carregar]);

  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const alertasRecentes = alertas.slice(0, 2);

  const chartData = {
    labels: historicoHoras.slice(-6).map((h) => h.hora),
    datasets: [{ data: historicoHoras.slice(-6).map((h) => h.mediaBatimentos || 140) }],
  };

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{saudacao()}, {bebe?.mae?.split(' ')[0] ?? 'Mamãe'} 👋</Text>
        <Text style={styles.headerTitle}>
          {bebe?.nome ? `${bebe.nome} está sendo monitorada` : 'Monitoramento ativo'}
        </Text>
        {ultimaColeta && (
          <Text style={styles.updateTime}>
            Última coleta: {format(new Date(ultimaColeta.dataHora), "HH:mm:ss", { locale: ptBR })}
          </Text>
        )}
      </View>

      {alertasRecentes.map((a) => (
        <View key={a.id} style={styles.alertCard}>
          <Text style={styles.alertEmoji}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>
              {a.tipo === 'batimentos' ? 'Alerta de Batimentos' : 'Alerta de Temperatura'}
            </Text>
            <Text style={styles.alertMsg}>{a.mensagem}</Text>
          </View>
        </View>
      ))}

      {alertasRecentes.length === 0 && (
        <View style={[styles.alertCard, styles.alertOk]}>
          <Text style={styles.alertEmoji}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.alertTitle, { color: COLORS.success }]}>Tudo normal</Text>
            <Text style={[styles.alertMsg, { color: '#3B6D11' }]}>Sinais vitais dentro dos limites esperados</Text>
          </View>
        </View>
      )}

      <View style={styles.vitalsRow}>
        <VitalCard label="Batimentos" value={ultimaColeta?.batimentos} unit="bpm" emoji="💓" tipo="batimentos" />
        <VitalCard label="Temperatura" value={ultimaColeta?.temperatura} unit="°C" emoji="🌡️" tipo="temperatura" />
      </View>

      {historicoHoras.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>BPM — últimas 6 horas</Text>
          <LineChart
            data={chartData}
            width={W - 64}
            height={140}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: () => COLORS.primary,
              labelColor: () => COLORS.textMuted,
              propsForDots: { r: '3', strokeWidth: '1', stroke: COLORS.primary },
              decimalPlaces: 0,
            }}
            bezier
            withInnerLines={false}
            withOuterLines={false}
            style={{ borderRadius: 8 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  updateTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  alertCard: {
    marginHorizontal: 16, marginBottom: 10, padding: 12,
    backgroundColor: COLORS.primaryLight, borderRadius: 12,
    borderWidth: 0.5, borderColor: COLORS.primaryMid,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  alertOk: { backgroundColor: COLORS.successLight, borderColor: COLORS.successMid },
  alertEmoji: { fontSize: 18, marginTop: 1 },
  alertTitle: { fontSize: 12, fontWeight: '500', color: COLORS.primaryDark, marginBottom: 2 },
  alertMsg: { fontSize: 11, color: COLORS.primaryDark },
  vitalsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  vitalCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, padding: 14, alignItems: 'flex-start',
  },
  vitalEmoji: { fontSize: 20, marginBottom: 6 },
  vitalLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  vitalValue: { fontSize: 22, fontWeight: '600', color: COLORS.textPrimary },
  vitalUnit: { fontSize: 12, fontWeight: '400', color: COLORS.textMuted },
  badge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  chartCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: COLORS.border, padding: 14, marginBottom: 20,
  },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 10 },
});
