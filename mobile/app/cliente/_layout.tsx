import { Slot } from 'expo-router';
import { AuthGuard } from '../../src/components/AuthGuard';

/**
 * Cliente group layout using Slot — renders matched child routes
 * without adding a new navigation layer (transitions are handled
 * by the root Stack in app/_layout.tsx).
 */
export default function ClienteLayout() {
  return (
    <AuthGuard>
      <Slot />
    </AuthGuard>
  );
}
