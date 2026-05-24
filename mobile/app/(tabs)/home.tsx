import { useNavigate } from '../../src/utils/useNavigate';
import { HomeScreen } from '../../src/screens/HomeScreen';

export default function HomePage() {
  const { navigateTo } = useNavigate();
  return <HomeScreen onNavigate={navigateTo} />;
}
