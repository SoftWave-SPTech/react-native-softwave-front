import React, { createElement, useMemo } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  hasValidCoords,
  mapPreviewStyles as styles,
  type LocalSeguroMapPreviewProps,
} from './localSeguroMapPreviewShared';

function buildOsmEmbedUrl(latitude: number, longitude: number, raioMetros: number): string {
  const delta = Math.max(raioMetros / 111_000, 0.002);
  const minLon = longitude - delta;
  const minLat = latitude - delta;
  const maxLon = longitude + delta;
  const maxLat = latitude + delta;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
  const marker = `${latitude},${longitude}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
}

export function LocalSeguroMapPreview({
  latitude,
  longitude,
  raioMetros,
  height = 160,
}: LocalSeguroMapPreviewProps) {
  const embedUrl = useMemo(
    () => buildOsmEmbedUrl(latitude, longitude, raioMetros),
    [latitude, longitude, raioMetros],
  );

  if (!hasValidCoords(latitude, longitude)) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <MaterialCommunityIcons name="map-marker-outline" size={32} color="#9ca3af" />
        <Text style={styles.placeholderText}>Defina o endereço ou use o GPS para ver o mapa</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapWrap, { height }]}>
      {createElement('iframe', {
        title: 'Mapa do local seguro',
        src: embedUrl,
        style: {
          border: 0,
          width: '100%',
          height: '100%',
          borderRadius: 14,
        },
      })}
    </View>
  );
}
