import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

// Selectable chip used for trip type selection and category tags.
export default function Chip({ label, icon, selected, onPress, style }) {
  const content = (
    <View style={[styles.inner]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </View>
  );

  if (!onPress) {
    return (
      <View style={[styles.chip, selected && styles.chipSelected, style]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navySoft,
  },
  labelSelected: {
    color: colors.tealDark,
  },
});
