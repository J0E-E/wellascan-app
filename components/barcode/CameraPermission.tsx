import { StyleSheet, View } from 'react-native'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { Image } from 'expo-image'
import { IMAGES } from '@/constants/images'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { Button } from 'react-native-elements'
import { useCameraPermissions } from 'expo-camera'
import globalStyles from '@/styles/global'
import { ReactNode } from 'react'

type CameraPermissionProps = {
	children: ReactNode
}

export default function CameraPermission({ children }: CameraPermissionProps) {
	const [permission, requestPermission] = useCameraPermissions()

	if (!permission) {
		// Camera permissions are still loading.
		return <View />
	}

	if (!permission.granted) {
		// Camera permissions are not granted.
		return (
			<ParallaxScrollView
				headerBackgroundColor={{ light: 'rgb(21, 23, 24)', dark: 'rgb(21, 23, 24)' }}
				headerImage={<Image source={IMAGES.APP_LOGO} style={styles.wellaLogo} />}
			>
				<ThemedView style={styles.titleContainer}>
					<ThemedText type="title">Wella Product Scanner</ThemedText>
				</ThemedView>
				<ThemedView style={styles.stepContainer}>
					<ThemedText type="subtitle">{'Please allow camera permissions to app in order to continue.'}</ThemedText>
				</ThemedView>
				<ThemedView style={styles.stepContainer}>
					<Button title={'grant permission'} onPress={requestPermission} />
				</ThemedView>
			</ParallaxScrollView>
		)
	}

	return <>{children}</>
}

const styles = StyleSheet.create({
	...globalStyles,
	titleContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
})
