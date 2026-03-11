import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="esqueci-senha" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="nova-transacao" />
      <Stack.Screen name="transacao/[id]" />
      <Stack.Screen name="contrato/[id]" />
      <Stack.Screen name="assistente-ia" />
      <Stack.Screen name="importacao-exportacao" />
      <Stack.Screen name="notificacoes" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="cliente" />
    </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
