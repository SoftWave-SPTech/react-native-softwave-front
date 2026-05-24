import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { infoCardStyles } from '../styles/infoCard';
import { useScrollPaddingBottom } from '../utils/scrollPadding';

type Props = {
  onBack: () => void;
};

const ITENS = [
  {
    icon: 'email-outline' as const,
    titulo: 'E-mail de suporte',
    descricao: 'suporte@softwave.com.br',
    action: () => Linking.openURL('mailto:suporte@softwave.com.br'),
  },
  {
    icon: 'whatsapp' as const,
    titulo: 'WhatsApp',
    descricao: 'Atendimento em horário comercial',
    action: () => Linking.openURL('https://wa.me/5511999999999'),
  },
  {
    icon: 'book-open-variant' as const,
    titulo: 'Perguntas frequentes',
    descricao: 'Dúvidas sobre transações, pagamentos e perfil',
    action: undefined,
  },
];

export function AjudaSuporteScreen({ onBack }: Props) {
  const scrollPad = useScrollPaddingBottom();

  return (
    <View style={styles.container}>
      <Header title="Ajuda e Suporte" showBack onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <MaterialCommunityIcons name="lifebuoy" size={40} color="#0d9488" />
          <Text style={styles.introTitle}>Como podemos ajudar?</Text>
          <Text style={styles.introText}>
            Entre em contato com nossa equipe ou consulte os tópicos abaixo sobre o uso do
            SoftWave Finance.
          </Text>
        </View>

        <View style={styles.card}>
          {ITENS.map((item, index) => (
            <Pressable
              key={item.titulo}
              style={[styles.row, index < ITENS.length - 1 && styles.rowBorder]}
              onPress={item.action}
              disabled={!item.action}
            >
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#0d9488" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.titulo}</Text>
                <Text style={styles.rowDesc}>{item.descricao}</Text>
              </View>
              {item.action ? (
                <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={infoCardStyles.card}>
          <Text style={infoCardStyles.title}>Locais Seguros</Text>
          <Text style={infoCardStyles.text}>
            Ative em Perfil → Configurações → Locais Seguros. Fora de um local cadastrado, valores
            financeiros e ações sensíveis ficam ocultos para proteger seus dados.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  intro: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 12 },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  introText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
