import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { colors } from '../theme/colors';
import {
  clearAllPackedStates,
  resetAllData,
  updateSettings,
} from '../storage/storage';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  function confirmReset() {
    Alert.alert(
      'Reset all data',
      'This permanently deletes all trips, checklists and settings on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset everything',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          },
        },
      ]
    );
  }

  function confirmClearPacked() {
    Alert.alert(
      'Clear packed states',
      'Mark every item in every trip as unpacked? Your trips and items are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear packed',
          onPress: async () => {
            await clearAllPackedStates();
            Alert.alert('Done', 'All items were marked as unpacked.');
          },
        },
      ]
    );
  }

  async function showOnboarding() {
    await updateSettings({ onboardingCompleted: false });
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.groupTitle}>Trips</Text>
      <View style={styles.card}>
        <Row
          icon="🧺"
          title="Clear packed states"
          subtitle="Mark all items in all trips as unpacked"
          onPress={confirmClearPacked}
        />
        <Divider />
        <Row
          icon="👋"
          title="Show onboarding again"
          subtitle="Replay the welcome screens"
          onPress={showOnboarding}
        />
      </View>

      <Text style={styles.groupTitle}>Data</Text>
      <View style={styles.card}>
        <Row
          icon="🗑"
          title="Reset all local data"
          subtitle="Delete every trip, checklist and setting"
          danger
          onPress={confirmReset}
        />
      </View>

      <Text style={styles.groupTitle}>About</Text>
      <View style={styles.card}>
        <Row icon="📦" title="Veyro Pack" subtitle={`Version ${APP_VERSION}`} />
        <Divider />
        <Row
          icon="✈"
          title="Offline travel utility"
          subtitle="Plan, pack and check your bag without internet"
        />
      </View>

      <View style={styles.privacy}>
        <Text style={styles.privacyTitle}>Privacy</Text>
        <Text style={styles.privacyText}>
          Veyro Pack stores trips and checklists only on this device. No account,
          no ads, no analytics, no internet connection.
        </Text>
      </View>
    </ScrollView>
  );
}

function Row({ icon, title, subtitle, onPress, danger }) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Text style={styles.rowChevron}>›</Text> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
      {content}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navySoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  rowSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.navySoft,
  },
  rowChevron: {
    fontSize: 24,
    color: colors.muted,
    marginLeft: 8,
  },
  dangerText: {
    color: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 54,
  },
  privacy: {
    marginTop: 24,
    backgroundColor: colors.sand,
    borderRadius: 14,
    padding: 16,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 14,
    color: colors.navySoft,
    lineHeight: 20,
  },
});
