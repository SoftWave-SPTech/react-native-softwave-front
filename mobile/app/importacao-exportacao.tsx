import { useRouter } from 'expo-router';
import { useNavigate } from '../src/utils/useNavigate';
import { ImportacaoExportacaoScreen } from '../src/screens/ImportacaoExportacaoScreen';

export default function ImportacaoExportacaoPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <ImportacaoExportacaoScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
