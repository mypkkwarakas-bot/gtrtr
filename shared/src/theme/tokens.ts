import { Platform, ViewStyle } from 'react-native';

/**
 * Design tokens FAMILY GATHERING KLKM JAKARTA UTARA.
 * Satu-satunya sumber warna, spacing, radius dan elevation. Lihat docs/FRONTEND_DESIGN_SYSTEM.md
 */
export const colors = {
  // Base: ivory hangat (bukan putih menyilaukan)
  ivory: '#FAF6EC',
  ivorySunken: '#F2ECDC',
  surface: '#FFFDF8',
  white: '#FFFFFF',

  // Primary: deep emerald
  emerald900: '#0A3328',
  emerald800: '#0E4536',
  emerald700: '#135C46',
  emerald600: '#1A7358',
  emerald500: '#2A8F70',
  emerald100: '#D6EADF',
  emerald50: '#ECF5F0',

  // Accent: champagne gold (terbatas)
  gold700: '#7A5C12',
  gold500: '#C9A24B',
  gold300: '#E4CD8F',
  gold100: '#F6ECCD',

  // Teks: deep navy / charcoal
  ink: '#14202B',
  inkSoft: '#34414E',
  inkMuted: '#5B6672',
  inkFaint: '#8A94A0',

  // Garis
  line: '#E5DDC9',
  lineStrong: '#D3C9AE',

  // Status (selalu dipasangkan dengan ikon + label)
  success: '#1D7F52',
  successBg: '#DCF0E4',
  warning: '#9A6410',
  warningBg: '#FBEDCB',
  danger: '#B3261E',
  dangerBg: '#F9DDD9',
  neutral: '#5F6670',
  neutralBg: '#ECE9E0',
  info: '#1F5F8B',
  infoBg: '#DCEAF4',

  scrim: 'rgba(10, 20, 25, 0.48)',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

export const radius = {
  small: 10,
  button: 14,
  input: 14,
  card: 20,
  dialog: 24,
  sheet: 28,
  hero: 28,
  chip: 999,
} as const;

/** Target sentuh minimum untuk interaksi utama (dp). */
export const HIT = 48;

export const iconSize = { sm: 18, md: 22, lg: 26, xl: 32 } as const;

const shadow = (offsetY: number, opacity: number, blur: number, elev: number): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation: elev, shadowColor: '#0A3328' },
    default: {
      shadowColor: '#0A3328',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
  }) ?? {};

export const elevation = {
  none: {} as ViewStyle,
  e1: shadow(2, 0.08, 6, 1),
  e2: shadow(6, 0.12, 14, 4),
  e3: shadow(12, 0.18, 24, 8),
} as const;

export type ToneName = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export const tones: Record<ToneName, { fg: string; bg: string }> = {
  success: { fg: colors.success, bg: colors.successBg },
  warning: { fg: colors.warning, bg: colors.warningBg },
  danger: { fg: colors.danger, bg: colors.dangerBg },
  neutral: { fg: colors.neutral, bg: colors.neutralBg },
  info: { fg: colors.info, bg: colors.infoBg },
};
