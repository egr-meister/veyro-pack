import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { duplicateTrip, getTrip } from '../storage/storage';
import { computeProgress, getPackingItems } from '../utils/helpers';
import { TRIP_TYPE_ICONS } from '../data/templates';
import TextField from '../components/TextField';
import EmptyState from '../components/EmptyState';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';

export default function DuplicateTripScreen({ navigation, route }) {
  const tripId = route?.params?.tripId ?? null;
  const [source, setSource] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const t = await getTrip(tripId);
      if (!active) return;
      setSource(t);
      // Temporary default name only.
      setName(t ? `Copy of ${t.name ?? 'Trip'}` : '');
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [tripId]);

  async function handleDuplicate() {
    if (saving || !source) return;
    setSaving(true);
    try {
      const created = await duplicateTrip(tripId, name);
      if (created?.id) {
        navigation.replace('TripDetail', { tripId: created.id });
      } else {
        setSaving(false);
      }
    } catch (e) {
      setSaving(false);
    }
  }

  if (loaded && !source) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="🧭"
          title="Trip not found"
          subtitle="This trip may have been deleted."
        >
          <SecondaryButton
            label="Back to trips"
            onPress={() => navigation.navigate('Home')}
          />
        </EmptyState>
      </View>
    );
  }

  if (!source) {
    return <View style={styles.center} />;
  }

  const packing = getPackingItems(source.items);
  const { total } = computeProgress(packing);
  const buyCount = Array.isArray(source.buyItems) ? source.buyItems.length : 0;
  const icon = TRIP_TYPE_ICONS[source.type] ?? '🧳';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sourceCard}>
          <Text style={styles.sourceIcon}>{icon}</Text>
          <View style={styles.sourceText}>
            <Text style={styles.sourceLabel}>Duplicating</Text>
            <Text style={styles.sourceName} numberOfLines={1}>
              {source.name ?? 'Trip'}
            </Text>
            <Text style={styles.sourceMeta}>
              {source.type ?? 'Weekend'} • {total} items • {buyCount} buy items
            </Text>
          </View>
        </View>

        <TextField
          label="New trip name"
          value={name}
          onChangeText={setName}
          placeholder="Name your new trip"
          autoFocus
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>The duplicate will</Text>
          <InfoLine text="Copy all categories and items" />
          <InfoLine text="Reset every item to unpacked" />
          <InfoLine text="Reset bought items in the buy list" />
          <InfoLine text="Keep your custom items" />
          <InfoLine text="Get a new date and its own progress" />
        </View>

        <PrimaryButton
          label={saving ? 'Creating…' : 'Create duplicate'}
          onPress={handleDuplicate}
          disabled={saving}
          style={styles.btn}
        />
        <SecondaryButton
          label="Cancel"
          onPress={() => navigation.goBack()}
          style={styles.cancel}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoLine({ text }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoCheck}>✓</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sand,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
  },
  sourceIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  sourceText: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.navySoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sourceName: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
    color: colors.navy,
  },
  sourceMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.navySoft,
  },
  infoBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 16,
    marginBottom: 22,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navySoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCheck: {
    color: colors.teal,
    fontSize: 15,
    fontWeight: '900',
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.navy,
  },
  btn: {
    marginBottom: 12,
  },
  cancel: {},
});
