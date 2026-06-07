// app/(tabs)/perfil.tsx
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { COLORS, VITAL_THRESHOLDS } from '../../constants';
import { useStore } from '../../hooks/useStore';

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{icon} {label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ToggleRow({ label, icon, value, onChange }: {
  label: string; icon: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{icon} {label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primaryMid }}
        thumbColor={value ? COLORS.primary : '#f4f3f4'}
      />
    </View>
  );
}

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { bebe, babyId, isConectado, logout } = useStore();
  const [notifTemp, setNotifTemp] = useState(true);
  const [notifBpm, setNotifBpm] = useState(true);
  const [notifPush, setNotifPush] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Configurações</Text>
        <Text style={styles.headerTitle}>Meu bebê</Text>
      </View>

      <View style={styles.babyCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 28 }}>🍼</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.babyName}>{bebe?.nome ?? 'Bebê'}</Text>
          <Text style={styles.babySub}>ID: {babyId ?? '-'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>UTI Neonatal</Text>
          </View>
        </View>
        <View style={[styles.connDot, { backgroundColor: isConectado ? COLORS.success : COLORS.textMuted }]} />
      </View>

      <Text style={styles.sectionTitle}>Limites vitais monitorados</Text>
      <View style={styles.card}>
        <InfoRow label="BPM normal" value={`${VITAL_THRESHOLDS.heartRate.min}–${VITAL_THRESHOLDS.heartRate.max} bpm`} icon="💓" />
        <InfoRow label="Temp. normal" value={`${VITAL_THRESHOLDS.temperature.min}–${VITAL_THRESHOLDS.temperature.max}°C`} icon="🌡️" />
        <InfoRow label="ID do bebê" value={babyId ?? '-'} icon="🏷️" />
      </View>

      <Text style={styles.sectionTitle}>Notificações</Text>
      <View style={styles.card}>
        <ToggleRow label="Alertas de temperatura" icon="🌡️" value={notifTemp} onChange={setNotifTemp} />
        <ToggleRow label="Alertas de BPM" icon="💓" value={notifBpm} onChange={setNotifBpm} />
        <ToggleRow label="Notificações push" icon="📱" value={notifPush} onChange={setNotifPush} />
      </View>

      <Text style={styles.sectionTitle}>Conexão IoT</Text>
      <View style={styles.card}>
        <View style={[styles.row, { paddingVertical: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.connDot, { backgroundColor: isConectado ? COLORS.success : COLORS.primary }]} />
            <Text style={styles.rowLabel}>
              {isConectado ? 'Sensor conectado' : 'Aguardando sensor...'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingBottom: 12 },
  headerSub: { fontSize: 13, color: COLORS.textSecondary },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  babyCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: COLORS.border, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20,
  },
  avatar: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  babyName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  babySub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  badge: {
    backgroundColor: COLORS.successLight, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 20, marginTop: 4, alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 10, color: COLORS.success, fontWeight: '500' },
  connDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, paddingHorizontal: 16, marginBottom: 8 },
  card: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 20, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary },
  rowValue: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  logoutBtn: {
    marginHorizontal: 16, padding: 14, borderRadius: 12,
    borderWidth: 0.5, borderColor: COLORS.primaryMid, alignItems: 'center',
  },
  logoutText: { fontSize: 14, color: COLORS.primaryDark, fontWeight: '500' },
});
