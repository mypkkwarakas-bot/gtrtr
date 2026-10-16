import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, elevation, radius, spacing, tones } from '../theme/tokens';
import { AppText } from './AppText';

type Kind = 'success' | 'error' | 'info';
interface ToastState { id: number; kind: Kind; message: string }
const Ctx = createContext<(kind: Kind, message: string) => void>(() => undefined);

/** Tampilkan toast sukses HANYA setelah backend mengonfirmasi. */
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((kind: Kind, message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), kind, message });
    timer.current = setTimeout(() => setToast(null), kind === 'error' ? 5000 : 3000);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const t = toast ? tones[toast.kind === 'success' ? 'success' : toast.kind === 'error' ? 'danger' : 'info'] : null;
  const icon = toast?.kind === 'success' ? 'checkmark-circle' : toast?.kind === 'error' ? 'alert-circle' : 'information-circle';
  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && t ? (
        <View pointerEvents="none" style={[styles.wrap, { top: insets.top + spacing.sm }]} accessibilityLiveRegion="polite">
          <View style={[styles.toast, elevation.e3, { backgroundColor: t.bg }]}>
            <Ionicons name={icon} size={20} color={t.fg} />
            <AppText variant="bodyStrong" color={t.fg} style={{ flex: 1 }}>
              {toast.message}
            </AppText>
          </View>
        </View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  toast: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
