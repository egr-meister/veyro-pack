import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';

import { colors } from './src/theme/colors';
import { loadSettings } from './src/storage/storage';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateTripScreen from './src/screens/CreateTripScreen';
import TripDetailScreen from './src/screens/TripDetailScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import BuyBeforeTripScreen from './src/screens/BuyBeforeTripScreen';
import DuplicateTripScreen from './src/screens/DuplicateTripScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Extend the built-in DefaultTheme so theme.fonts (incl. fonts.regular) always
// exists. Never build a navigation theme from scratch.
const VeyroTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.teal,
    background: colors.background,
    card: colors.background,
    text: colors.navy,
    border: colors.divider,
    notification: colors.skyBlue,
  },
};

// Keep the native splash visible while we read settings.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Home');

  useEffect(() => {
    let active = true;
    (async () => {
      let onboardingCompleted = false;
      try {
        const settings = await loadSettings();
        onboardingCompleted = settings?.onboardingCompleted ?? false;
      } catch (e) {
        onboardingCompleted = false;
      }
      if (!active) return;
      setInitialRoute(onboardingCompleted ? 'Home' : 'Onboarding');
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer theme={VeyroTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.navy, fontWeight: '700' },
            headerTintColor: colors.navy,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateTrip"
            component={CreateTripScreen}
            options={{ title: 'New Trip' }}
          />
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={{ title: 'Trip' }}
          />
          <Stack.Screen
            name="Category"
            component={CategoryScreen}
            options={{ title: 'Category' }}
          />
          <Stack.Screen
            name="BuyBeforeTrip"
            component={BuyBeforeTripScreen}
            options={{ title: 'Buy Before Trip' }}
          />
          <Stack.Screen
            name="DuplicateTrip"
            component={DuplicateTripScreen}
            options={{ title: 'Duplicate Trip' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
