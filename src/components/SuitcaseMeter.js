import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

// A travel-specific progress visual: a suitcase that fills from the bottom
// as packing progresses. Built entirely from lightweight React Native shapes
// (no external SVG / image assets).
export default function SuitcaseMeter({ percentage = 0, size = 96 }) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const bodyHeight = size;
  const bodyWidth = size * 0.88;
  const fillHeight = Math.round((bodyHeight - 8) * (pct / 100));

  return (
    <View style={[styles.wrap, { width: bodyWidth, height: bodyHeight + 14 }]}>
      {/* Handle */}
      <View style={styles.handleRow}>
        <View
          style={[
            styles.handle,
            { width: bodyWidth * 0.4, borderColor: colors.navy },
          ]}
        />
      </View>

      {/* Suitcase body */}
      <View
        style={[
          styles.body,
          { width: bodyWidth, height: bodyHeight, borderColor: colors.navy },
        ]}
      >
        {/* Fill (rises from bottom) */}
        <View
          style={[
            styles.fill,
            { height: fillHeight, backgroundColor: colors.teal },
          ]}
        />
        {/* Center latch line */}
        <View style={styles.latch} />
        {/* Percentage label */}
        <View style={styles.labelWrap} pointerEvents="none">
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  handleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
  },
  handle: {
    height: 12,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  body: {
    borderWidth: 3,
    borderRadius: 14,
    backgroundColor: colors.sand,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    opacity: 0.85,
  },
  latch: {
    position: 'absolute',
    top: '46%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.navy,
    opacity: 0.25,
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
  },
});
