import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocaisSeguros } from '../context/LocaisSegurosContext';

export function LocaisSegurosBanner() {
  const router = useRouter();
  const { shouldRestrict, enabled, locais } = useLocaisSeguros();

  if (!shouldRestrict) return null;

  const semLocais = enabled && locais.length === 0;

  return (
    <Pressable
      style={styles.banner}
      onPress={() => router.push('/locais-seguros')}
    >
      <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#0f766e" />
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          {semLocais ? 'Cadastre um local seguro' : 'Fora de um local seguro'}
        </Text>
        <Text style={styles.subtitle}>
          {semLocais
            ? 'Valores e ações sensíveis estão ocultos até você adicionar um local.'
            : 'Valores e ações sensíveis estão ocultos. Acesse um local cadastrado ou desative a proteção.'}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color="#0d9488" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#115e59', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#0f766e', lineHeight: 17 },
});
