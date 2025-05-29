import { Tabs } from 'expo-router'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/auth/AuthContext'
import { useRouter } from 'expo-router'
import { View, ActivityIndicator, Platform } from 'react-native'
import { useColorScheme } from 'react-native'
import { HapticTab } from '@/components/HapticTab'
import { Colors } from '@/constants/Colors'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function ProtectedTabsLayout() {
	const { state: authState } = useContext(AuthContext)
	const router = useRouter()
	const [mounted, setMounted] = useState(false)
	const colorScheme = useColorScheme()

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 0)
		return () => clearTimeout(timer)
	}, [])

	useEffect(() => {
		if (mounted && !authState.token) {
			router.replace('/login')
		}
	}, [authState.token, mounted])

	if (!authState.token) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator />
			</View>
		)
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: { position: 'absolute' },
					default: {},
				}),
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="lists"
				options={{
					title: 'Lists',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.text" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="barcode"
				options={{
					title: 'Barcode',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="barcode.viewfinder" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="signout"
				options={{
					title: 'Sign-Out',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="x.circle" color={color} />,
				}}
			/>
		</Tabs>
	)
}
