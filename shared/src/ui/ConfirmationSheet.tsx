import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './AppText';
import { PrimaryButton, SecondaryButton } from './Buttons';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Bottom sheet konfirmasi untuk tindakan penting. Back Android menutup sheet (onRequestClose). */
export function ConfirmationSheet({ visible, title, message, confirmLabel, cancelLabel = 'Batal', danger, loading, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onCancel} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={loading ? undefined : onCancel} accessibilityLabel="Tutup" />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <AppText variant="h2">{title}</AppText>
        <AppText variant="body" color={colors.inkSoft}>
          {message}
        </AppText>
        <View style={styles.actions}>
          <PrimaryButton label={confirmLabel} onPress={onConfirm} loading={loading} danger={danger} />
          <SecondaryButton label={cancelLabel} onPress={onCancel} disabled={loading} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.ivory, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.lineStrong, marginBottom: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
