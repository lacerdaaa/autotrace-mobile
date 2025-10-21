import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const getVariantStyles = (variant: ButtonVariant, scheme: 'light' | 'dark') => {
  const colors = Colors[scheme];

  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: colors.secondary,
        backgroundPressed: colors.secondaryMuted,
        textColor: colors.surface,
        borderColor: colors.secondaryMuted,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        backgroundPressed: colors.surfaceMuted,
        textColor: colors.primary,
        borderColor: colors.border,
      };
    case 'primary':
    default:
      return {
        backgroundColor: colors.primary,
        backgroundPressed: colors.primaryMuted,
        textColor: colors.surface,
        borderColor: colors.primaryMuted,
      };
  }
};

export const Button = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) => {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = getVariantStyles(variant, scheme);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? colors.backgroundPressed : colors.backgroundColor,
          borderColor: colors.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.textColor} />
      ) : (
        <Text style={[styles.label, { color: colors.textColor }, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
