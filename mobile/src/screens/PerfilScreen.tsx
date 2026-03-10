import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
};

export function PerfilScreen({ onBack, onNavigate, onLogout }: Props) {
  const [nome, setNome] = useState('Silva & Associados');
  const [email, setEmail] = useState('contato@silvaassociados.com.br');
  const [telefone, setTelefone] = useState('(11) 3456-7890');
  const [oab, setOab] = useState('OAB/SP 123.456');
  const [endereco, setEndereco] = useState('Av. Paulista, 1000 - São Paulo/SP');

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Meu Perfil" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>SA</Text></View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.oab}>{oab}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados do Escritório</Text>
          <InputField icon="domain" label="Nome do Escritório" value={nome} onChangeText={setNome} />
          <InputField icon="email" label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputField icon="phone" label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
          <InputField icon="file-document" label="OAB" value={oab} onChangeText={setOab} />
          <InputField icon="map-marker" label="Endereço" value={endereco} onChangeText={setEndereco} />
          <Pressable style={styles.saveBtn}><Text style={styles.saveBtnText}>Salvar Alterações</Text></Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configurações</Text>
          <MenuItem icon="bell-outline" label="Notificações" onPress={() => onNavigate('Notificacoes')} />
          <MenuItem icon="lock-outline" label="Segurança" onPress={() => {}} />
          <MenuItem icon="shield-check-outline" label="Privacidade" onPress={() => {}} />
          <MenuItem icon="help-circle-outline" label="Ajuda e Suporte" onPress={() => {}} />
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={22} color="#dc2626" />
          <Text style={styles.logoutBtnText}>Sair do Aplicativo</Text>
        </Pressable>
        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

function InputField({ icon, label, value, onChangeText, keyboardType }: { icon: string; label: string; value: string; onChangeText: (t: string) => void; keyboardType?: string }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <MaterialCommunityIcons name={icon as any} size={22} color="#9ca3af" style={styles.inputIcon} />
        <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType as any} style={styles.input} />
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <MaterialCommunityIcons name={icon as any} size={22} color="#6b7280" />
      <Text style={styles.menuItemText}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  avatarCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  nome: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 4 },
  oab: { fontSize: 14, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#111827' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuItemText: { flex: 1, fontSize: 16, color: '#111827', marginLeft: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fee2e2', borderRadius: 12, paddingVertical: 14 },
  logoutBtnText: { fontSize: 16, fontWeight: '500', color: '#dc2626' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
