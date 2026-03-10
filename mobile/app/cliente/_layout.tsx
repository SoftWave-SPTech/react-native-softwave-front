import { Slot } from 'expo-router';

/**
 * Cliente group layout using Slot — renders matched child routes
 * without adding a new navigation layer (transitions are handled
 * by the root Stack in app/_layout.tsx).
 */
export default function ClienteLayout() {
  return <Slot />;
}
