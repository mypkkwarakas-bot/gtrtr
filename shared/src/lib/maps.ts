import Constants from 'expo-constants';

/** API key Google Maps SDK for Android yang dimasukkan saat build (app.config.ts). */
export function googleMapsKey(): string {
  const key = Constants.expoConfig?.android?.config?.googleMaps?.apiKey;
  return typeof key === 'string' ? key : '';
}

export function mapsConfigured(): boolean {
  return googleMapsKey().length > 10;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Wilayah yang memuat seluruh titik; null bila tidak ada titik (tidak ada koordinat bawaan). */
export function regionFor(points: LatLng[]): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null {
  if (points.length === 0) return null;
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.01),
  };
}

/** Tautan navigasi eksternal (membuka aplikasi peta) ke koordinat destinasi dari backend. */
export function directionsUrl(dest: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&travelmode=driving`;
}
