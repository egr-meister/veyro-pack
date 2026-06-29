import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

// Compact horizontal packing strip used in cards and category rows.
export default function ProgressBar({ percentage = 0, height = 8, color }) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${pct}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: color || colors.teal,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    minWidth: 2,
  },
});
