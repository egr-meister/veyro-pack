import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

// A single clean packing row with a checkbox and an overflow action button.
export default function ChecklistRow({ item, onToggle, onMore }) {
  const safe = item ?? {};
  const packed = safe.packed === true;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.left, pressed && { opacity: 0.7 }]}
        hitSlop={6}
      >
        <View style={[styles.checkbox, packed && styles.checkboxOn]}>
          {packed ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <View style={styles.textWrap}>
          <Text
            style={[styles.title, packed && styles.titleDone]}
            numberOfLines={2}
          >
            {safe.title ?? 'Item'}
          </Text>
          {safe.custom ? <Text style={styles.customTag}>Custom</Text> : null}
        </View>
      </Pressable>

      {onMore ? (
        <Pressable
          onPress={onMore}
          hitSlop={10}
          style={({ pressed }) => [styles.more, pressed && { opacity: 0.5 }]}
          accessibilityLabel="Item options"
        >
          <Text style={styles.moreGlyph}>⋯</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.skyBlueDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  check: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  titleDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  customTag: {
    marginTop: 2,
    fontSize: 11,
    color: colors.skyBlueDark,
    fontWeight: '700',
  },
  more: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  moreGlyph: {
    fontSize: 22,
    color: colors.muted,
    fontWeight: '900',
  },
});
