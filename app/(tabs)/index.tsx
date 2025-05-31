import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import globalStyles from '@/styles/global'
import { IMAGES } from '@/constants/images'

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={IMAGES.APP_LOGO}
          style={styles.wellaLogo}
        />
      }>
        <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Welcome to the Wella App!</ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Step 1: Create a List</ThemedText>
            <ThemedText>
                Go to the Lists tab and create at least one list. This is where your scanned products will go.
            </ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Step 2: Select Your List</ThemedText>
            <ThemedText>
                Open the list and tap "Scan Products to List" — or go to the Barcode tab and pick a list to start scanning into.
            </ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Step 3: Start Scanning!</ThemedText>
            <ThemedText>
                Scan Wella products as you use them to keep your reorder list up to date.
            </ThemedText>
        </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
    ...globalStyles,
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
});
