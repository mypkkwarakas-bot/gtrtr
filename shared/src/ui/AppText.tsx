import { Text, TextProps } from 'react-native';
import { colors } from '../theme/tokens';
import { TextVariant, typeScale } from '../theme/typography';

type Props = TextProps & { variant?: TextVariant; color?: string };

export function AppText({ variant = 'body', color = colors.ink, style, ...rest }: Props) {
  return <Text {...rest} style={[typeScale[variant], { color }, style]} />;
}
