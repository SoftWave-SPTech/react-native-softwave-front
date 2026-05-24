import { useRouter, usePathname } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useNavigate } from '../../src/utils/useNavigate';
import { HonorariosScreen } from '../../src/screens/HonorariosScreen';

export default function HonorariosPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  const isFocused = useIsFocused();
  const routePath = usePathname() ?? '';
  return (
    <HonorariosScreen
      isFocused={isFocused}
      routePath={routePath}
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
