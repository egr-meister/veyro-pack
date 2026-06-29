import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { createTrip } from '../storage/storage';
import {
  TRIP_TYPES,
  TRIP_TYPE_ICONS,
  TRIP_TYPE_INFO,
  categoriesForType,
} from '../data/templates';
import TextField from '../components/TextField';
import Chip from '../components/Chip';
import { PrimaryButton } from '../components/Buttons';

export default function CreateTripScreen({ navigation }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Weekend');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const previewCategories = categoriesForType(type);

  async function handleCreate() {
    if (saving) return;
    setSaving(true);
    try {
      const trip = await createTrip({
        name,
        type,
        destination,
        startDate,
        endDate,
      });
      // Replace this screen with the new trip detail.
      navigation.replace('TripDetail', { tripId: trip.id });
    } catch (e) {
      setSaving(false);
    }
  }

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
        <TextField
          label="Trip name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Spain Beach Trip"
          autoFocus
        />

        <Text style={styles.sectionLabel}>Trip type</Text>
        <View style={styles.chipWrap}>
          {TRIP_TYPES.map((t) => (
            <Chip
              key={t}
              label={t}
              icon={TRIP_TYPE_ICONS[t]}
              selected={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </View>
        <Text style={styles.typeInfo}>{TRIP_TYPE_INFO[type] ?? ''}</Text>

        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Starter checklist includes</Text>
          <View style={styles.previewChips}>
            {previewCategories.map((cat) => (
              <Chip key={cat} label={cat} style={styles.previewChip} />
            ))}
          </View>
        </View>

        <TextField
          label="Destination"
          optional
          value={destination}
          onChangeText={setDestination}
          placeholder="Where are you going?"
        />

        <View style={styles.dateRow}>
          <TextField
            label="Start date"
            optional
            value={startDate}
            onChangeText={setStartDate}
            placeholder="Start date"
            style={styles.dateField}
          />
          <View style={styles.dateGap} />
          <TextField
            label="End date"
            optional
            value={endDate}
            onChangeText={setEndDate}
            placeholder="End date"
            style={styles.dateField}
          />
        </View>

        <Text style={styles.hint}>
          You can create a trip even without a destination or dates.
        </Text>

        <PrimaryButton
          label={saving ? 'Creating…' : 'Create trip'}
          onPress={handleCreate}
          disabled={saving}
          style={styles.createBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navySoft,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeInfo: {
    fontSize: 13,
    color: colors.teal,
    fontWeight: '600',
    marginBottom: 16,
  },
  previewBox: {
    backgroundColor: colors.sand,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navySoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewChip: {
    backgroundColor: colors.white,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateField: {
    flex: 1,
  },
  dateGap: {
    width: 12,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 22,
    lineHeight: 19,
  },
  createBtn: {
    marginTop: 4,
  },
});
