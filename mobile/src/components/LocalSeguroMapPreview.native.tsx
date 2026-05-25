import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  hasValidCoords,
  mapPreviewStyles as styles,
  type LocalSeguroMapPreviewProps,
} from './localSeguroMapPreviewShared';

/**
 * Expo Go: mapa nativo (react-native-maps) instável — preview + link externo.
 * Mapa embutido ficará para build de produção (dev client / loja).
 */
export function LocalSeguroMapPreview({
  latitude,
  longitude,
  raioMetros,
  height = 160,
}: LocalSeguroMapPreviewProps) {
  if (!hasValidCoords(latitude, longitude)) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <MaterialCommunityIcons name="map-marker-outline" size={32} color="#9ca3af" />
        <Text style={styles.placeholderText}>Defina o endereço ou use o GPS para ver o mapa</Text>
      </View>
    );
  }

  const abrirMaps = () => {
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    );
  };

  return (
    <View style={[styles.placeholder, { height }]}>
      <MaterialCommunityIcons name="map-marker-radius" size={36} color="#14b8a6" />
      <Text style={styles.placeholderText}>
        Prévia do mapa no app publicado. Toque abaixo para abrir no Google Maps.
      </Text>
      <Text style={metaText}>
        Raio {raioMetros} m · {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
      <Pressable style={btn} onPress={abrirMaps}>
        <Text style={btnText}>Abrir no Google Maps</Text>
      </Pressable>
    </View>
  );
}

const metaText = {
  marginTop: 6,
  fontSize: 12,
  color: '#9ca3af',
  textAlign: 'center' as const,
};

const btn = {
  marginTop: 12,
  paddingHorizontal: 16,
  paddingVertical: 10,
  backgroundColor: '#0d9488',
  borderRadius: 10,
};

const btnText = {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600' as const,
};
