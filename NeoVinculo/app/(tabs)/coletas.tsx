// app/(tabs)/coletas.tsx
import { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { COLORS, VITAL_THRESHOLDS } from '../../constants';
import { useStore } from '../../hooks/useStore';
import { fetchColetasRecentes, Coleta } from '../../services/api';

function ColetaItem({ item }: { item: Coleta }) {
  const tempNormal = item.temperatura >= VITAL_THRESHOLDS.temperature.min &&
    item.temperatura <= VITAL_THRESHOLDS.temperature.max;
  const bpmNormal = item.batimentos >= VITAL_THRESHOLDS.heartRate.min &&
    item.batimentos <= VITAL_THRESHOLDS.heartRate.max;
  const normal = tempNormal && bpmNormal;

  let horaFormatada = '-';
  try {
    horaFormatada = format(new Date(item.dataHora), 'HH:mm:ss', { locale: ptBR });
  } catch {}

  return (
    <View style={styles.item}>
      <View style={[styles.dot, { backgroundColor: normal ? COLORS.success : COLORS.primary }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>
            {normal ? 'Sinais normais' : '⚠️ Fora do normal'}
          </Text>
          <Text style={styles.itemTime}>{horaFormatada}</Text>
        </View>
        <Text style={styles.itemVals}>
          🌡️ {item.temperatura?.toFixed(1)}°C  ·  💓 {item.batimentos} bpm
        </Text>
        {(!tempNormal || !bpmNormal) && (
          <Text style={styles.itemWarn}>
            {!tempNormal ? 'Temperatura anormal  ' : ''}
            {!bpmNormal ? 'BPM anormal' : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function ColetasScreen() {
  const insets = useSafeAreaInsets();
  const { babyId, coletasRecentes, adicionarColeta } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!babyId) {
      setLoading(false);
      return;
    }
    setErro(null);
    try {
      const coletas = await fetchColetasRecentes(babyId, 30);
      coletas.forEach(adicionarColeta);
    } catch (err: any) {
      console.error('Erro coletas:', err?.response?.data ?? err.message);
      setErro('Não foi possível carregar as coletas.');
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
        <Text style={styles.loadingText}>Carregando coletas...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Histórico de sinais vitais</Text>
        <Text style={styles.headerTitle}>Coletas de hoje</Text>
      </View>
      <FlatList
        data={coletasRecentes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ColetaItem item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); carregar(); }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>
              {erro ?? 'Nenhuma coleta ainda'}
            </Text>
            <Text style={styles.emptySub}>
              Envie dados via POST /vitals para visualizar as coletas aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: COLORS.textSecondary },
  header: { padding: 20, paddingBottom: 12 },
  headerSub: { fontSize: 13, color: COLORS.textSecondary },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  item: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 0.5, borderColor: COLORS.border,
    padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  itemTime: { fontSize: 11, color: COLORS.textMuted },
  itemVals: { fontSize: 12, color: COLORS.textSecondary },
  itemWarn: { fontSize: 11, color: COLORS.primaryDark, marginTop: 2 },
  emptyCard: {
    marginTop: 40, alignItems: 'center', padding: 24,
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
});
