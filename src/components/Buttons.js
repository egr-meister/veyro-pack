import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

// Solid primary action button (teal).
export function PrimaryButton({ label, onPress, style, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

// Outlined secondary button.
export function SecondaryButton({ label, onPress, style, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

// Small text button, e.g. for destructive or subtle actions.
export function TextButton({ label, onPress, color, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.textBtn, pressed && { opacity: 0.6 }, style]}
    >
      <Text style={[styles.textBtnLabel, color ? { color } : null]}>{label}</Text>
    </Pressable>
  );
}

// Small round icon button (text/emoji glyph), used in headers.
export function IconButton({ glyph, onPress, style, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }, style]}
    >
      <View pointerEvents="none">
        <Text style={styles.iconGlyph}>{glyph}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.teal,
  },
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.teal,
  },
  secondaryText: {
    color: colors.tealDark,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  textBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  textBtnLabel: {
    color: colors.tealDark,
    fontSize: 15,
    fontWeight: '600',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  iconGlyph: {
    fontSize: 18,
    color: colors.navy,
  },
});
