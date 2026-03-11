import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onBack?: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

export function ClienteHomeScreen({ onBack, onNavigate }: Props) {
  return (
    <LinearGradient colors={['#2563eb', '#1e3a8a']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
            </Pressable>
          )}
          <View>
          <Text style={styles.ola}>Olá,</Text>
          <Text style={styles.nome}>João Silva</Text>
          </View>
        </View>
        <View style={styles.headerBtns}>
          <Pressable onPress={() => onNavigate('ClienteNotificacoes')} style={styles.bellBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
            <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
          </Pressable>
          <Pressable onPress={() => onNavigate('ClientePerfil')} style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapGreen}><MaterialCommunityIcons name="cash" size={22} color="#16a34a" /></View>
            <Text style={styles.cardLabel}>Total Pago</Text>
          </View>
          <Text style={styles.cardValor}>R$ 15.000,00</Text>
          <Text style={styles.cardSub}>60% do total</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapYellow}><MaterialCommunityIcons name="clock-outline" size={22} color="#d97706" /></View>
            <Text style={styles.cardLabel}>Total Pendente</Text>
          </View>
          <Text style={styles.cardValor}>R$ 10.000,00</Text>
          <Text style={styles.cardSub}>3 parcelas restantes</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapBlue}><MaterialCommunityIcons name="file-document" size={22} color="#2563eb" /></View>
            <Text style={styles.cardLabel}>Última Cobrança</Text>
          </View>
          <View style={styles.ultimaRow}>
            <View>
              <Text style={styles.ultimaParcela}>Parcela 3/4</Text>
              <Text style={styles.ultimaVenc}>Vencimento: 15/03/2026</Text>
            </View>
            <Text style={styles.ultimaValor}>R$ 6.000,00</Text>
          </View>
        </View>
        <Pressable onPress={() => onNavigate('ClienteCobrancas')} style={styles.btn}>
          <Text style={styles.btnText}>Minhas Cobranças</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  ola: { fontSize: 14, color: '#93c5fd', marginBottom: 4 },
  nome: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerBtns: { flexDirection: 'row', gap: 12 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  content: { flex: 1, backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  iconWrapGreen: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  iconWrapYellow: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  iconWrapBlue: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 14, color: '#6b7280' },
  cardValor: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  cardSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  ultimaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  ultimaParcela: { fontSize: 16, fontWeight: '600', color: '#111827' },
  ultimaVenc: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  ultimaValor: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  btn: { backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
