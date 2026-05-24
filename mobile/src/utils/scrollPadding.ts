import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Altura aproximada do BottomNav (ícones + labels + padding vertical). */
const BOTTOM_NAV_CONTENT_HEIGHT = 72;

/**
 * Espaço inferior para ScrollView não ficar atrás do menu fixo.
 * @param extra margem extra após o menu (px)
 */
export function useScrollPaddingBottom(extra = 24): number {
  const insets = useSafeAreaInsets();
  return BOTTOM_NAV_CONTENT_HEIGHT + Math.max(insets.bottom, 8) + 12 + extra;
}
