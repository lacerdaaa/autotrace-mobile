/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const palette = {
  slate950: '#020617',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569', // primary
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  red500: '#ef4444', // secondary
  red300: '#fca5a5',
  red100: '#fee2e2',
  white: '#ffffff',
};

export const Colors = {
  light: {
    background: palette.slate50,
    surface: palette.white,
    surfaceMuted: palette.slate100,
    text: palette.slate900,
    textMuted: palette.slate600,
    primary: palette.slate600,
    primaryMuted: palette.slate700,
    primarySoft: palette.slate200,
    secondary: palette.red500,
    secondarySoft: palette.red100,
    secondaryMuted: palette.red300,
    border: palette.slate200,
    icon: palette.slate700,
    tint: palette.slate600,
    tabIconDefault: palette.slate600,
    tabIconSelected: palette.slate700,
  },
  dark: {
    background: palette.slate900,
    surface: palette.slate800,
    surfaceMuted: palette.slate700,
    text: palette.slate50,
    textMuted: palette.slate200,
    primary: palette.slate200,
    primaryMuted: palette.slate100,
    primarySoft: palette.slate700,
    secondary: palette.red300,
    secondarySoft: '#7f1d1d',
    secondaryMuted: palette.red500,
    border: palette.slate700,
    icon: palette.slate200,
    tint: palette.slate200,
    tabIconDefault: palette.slate200,
    tabIconSelected: palette.red300,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
