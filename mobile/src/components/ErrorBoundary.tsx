import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const message = this.state.error.message || String(this.state.error);

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Erro ao abrir o app</Text>
        <Text style={styles.hint}>
          Copie a mensagem abaixo e envie para suporte. No PC, o Metro também mostra o erro em vermelho.
        </Text>
        <ScrollView style={styles.box}>
          <Text style={styles.msg}>{message}</Text>
        </ScrollView>
        <Pressable style={styles.btn} onPress={() => this.setState({ error: null })}>
          <Text style={styles.btnText}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, paddingTop: 56, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8 },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 16, lineHeight: 20 },
  box: { flex: 1, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginBottom: 16 },
  msg: { fontSize: 13, color: '#b91c1c', fontFamily: 'monospace' },
  btn: {
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
