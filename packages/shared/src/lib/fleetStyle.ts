import { ImageSourcePropType } from 'react-native';

/** Delapan ilustrasi armada. Admin yang memilih ikon tiap armada (kolom fleets.icon_key). */
export const BUS_ICON_KEYS = ['bus-1', 'bus-2', 'bus-3', 'bus-4', 'bus-5', 'bus-6', 'bus-7', 'bus-8'] as const;
export type BusIconKey = (typeof BUS_ICON_KEYS)[number];

const BUS_IMAGES: Record<BusIconKey, ImageSourcePropType> = {
  'bus-1': require('../../assets/buses/bus-1.png'),
  'bus-2': require('../../assets/buses/bus-2.png'),
  'bus-3': require('../../assets/buses/bus-3.png'),
  'bus-4': require('../../assets/buses/bus-4.png'),
  'bus-5': require('../../assets/buses/bus-5.png'),
  'bus-6': require('../../assets/buses/bus-6.png'),
  'bus-7': require('../../assets/buses/bus-7.png'),
  'bus-8': require('../../assets/buses/bus-8.png'),
};

export function isBusIconKey(value: unknown): value is BusIconKey {
  return typeof value === 'string' && (BUS_ICON_KEYS as readonly string[]).includes(value);
}

/** Ikon armada dari pilihan Admin. Belum dipilih/tidak dikenal -> null (tampilkan ikon netral, bukan tebakan). */
export function busImageFor(iconKey: string | null | undefined): ImageSourcePropType | null {
  return isBusIconKey(iconKey) ? BUS_IMAGES[iconKey] : null;
}

export const logoImage: ImageSourcePropType = require('../../assets/logo.png');
