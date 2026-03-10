import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
  );
}
