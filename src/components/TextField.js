import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';

// Labeled text input with consistent styling.
export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  optional,
  autoFocus,
  onSubmitEditing,
  returnKeyType,
  style,
}) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {optional ? <Text style={styles.optional}>  (optional)</Text> : null}
        </Text>
      ) : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navySoft,
    marginBottom: 6,
  },
  optional: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.navy,
  },
});
