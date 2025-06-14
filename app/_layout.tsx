import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { BusyProvider } from '@/context/busy/BusyContext'
import BusyOverlay from '@/components/busy/BusyOverlay'
import { useColorScheme } from '@/hooks/useColorScheme'
import { AuthProviderWrapper } from '@/context/auth/AuthProviderWrapper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	})

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	return (
		<GestureHandlerRootView>
			<AuthProviderWrapper>
				<BusyProvider>
					<BusyOverlay />
					<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
						<Stack>
							<Stack.Screen name={'login'} options={{ headerShown: false }} />
							<Stack.Screen name={'list'} options={{ title: 'Lists' }} />
							<Stack.Screen name={'(tabs)'} options={{ headerShown: false, title: 'Back' }} />
							<Stack.Screen name={'+not-found'} />
						</Stack>
						<StatusBar style="auto" />
					</ThemeProvider>
				</BusyProvider>
			</AuthProviderWrapper>
		</GestureHandlerRootView>
	)
}
