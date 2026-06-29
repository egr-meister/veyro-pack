import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { updateSettings } from '../storage/storage';
import { PrimaryButton, TextButton } from '../components/Buttons';
import SuitcaseMeter from '../components/SuitcaseMeter';

export default function OnboardingScreen({ navigation }) {
  async function complete(goToCreate) {
    await updateSettings({ onboardingCompleted: true });
    if (goToCreate) {
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'CreateTrip' }],
      });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <SuitcaseMeter percentage={68} size={120} />
        </View>

        <Text style={styles.brand}>Veyro Pack</Text>
        <Text style={styles.headline}>Pack faster for every trip.</Text>
        <Text style={styles.body}>
          Create a trip, check your bag, and keep a small list of things to buy.
        </Text>

        <View style={styles.points}>
          <Bullet text="Ready-made checklists for every trip type" />
          <Bullet text="Track packing progress at a glance" />
          <Bullet text="Works offline. No account needed." />
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Start Packing" onPress={() => complete(true)} />
        <TextButton
          label="Skip"
          onPress={() => complete(false)}
          style={styles.skip}
        />
      </View>
    </SafeAreaView>
  );
}

function Bullet({ text }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.dot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brand: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.teal,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  headline: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '900',
    color: colors.navy,
    textAlign: 'center',
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    color: colors.navySoft,
    textAlign: 'center',
    lineHeight: 23,
  },
  points: {
    marginTop: 28,
    alignSelf: 'stretch',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.skyBlue,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: colors.navy,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 12,
  },
  skip: {
    alignSelf: 'center',
    marginTop: 6,
  },
});
