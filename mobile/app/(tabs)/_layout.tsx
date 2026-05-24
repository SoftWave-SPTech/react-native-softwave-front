import { Tabs } from 'expo-router';
import { AuthGuard } from '../../src/components/AuthGuard';

/**
 * Tabs layout for the main authenticated area.
 * The default tab bar is hidden — navigation is handled by the custom BottomNav component
 * that uses useRouter() and usePathname() from expo-router internally.
 */
export default function TabsLayout() {
  return (
    <AuthGuard>
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="transacoes" />
      <Tabs.Screen name="pagamentos" />
      <Tabs.Screen name="honorarios" />
      <Tabs.Screen name="relatorios" />
    </Tabs>
    </AuthGuard>
  );
}
