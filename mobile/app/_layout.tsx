import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { LocaisSegurosGate } from '../src/context/LocaisSegurosContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
    <AuthProvider>
    <LocaisSegurosGate>
    <SafeAreaProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
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
      <Stack.Screen name="locais-seguros" />
      <Stack.Screen name="ajuda-suporte" />
      <Stack.Screen name="cliente" />
    </Stack>
    </SafeAreaProvider>
    </LocaisSegurosGate>
    </AuthProvider>
    </ErrorBoundary>
  );
}
