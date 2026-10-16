import { TextStyle } from 'react-native';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

/** Satu keluarga font (Plus Jakarta Sans) dengan empat bobot. */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  // Bila font gagal dimuat, aplikasi tetap dibuka dengan font sistem.
  return loaded || error != null;
}

export type TextVariant =
  | 'display'
  | 'title'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'stat'
  | 'statLarge'
  | 'value';

export const typeScale: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  title: { fontFamily: fontFamily.extrabold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h2: { fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 24 },
  h3: { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  stat: { fontFamily: fontFamily.extrabold, fontSize: 28, lineHeight: 32, fontVariant: ['tabular-nums'] },
  statLarge: { fontFamily: fontFamily.extrabold, fontSize: 44, lineHeight: 48, fontVariant: ['tabular-nums'] },
  value: { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
};
