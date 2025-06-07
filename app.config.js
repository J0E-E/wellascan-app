// app.config.js

export default ({ config }) => {
	const isDev = process.env.NODE_ENV === 'development'

	return {
		...config,
		name: 'WellaScan',
		slug: 'wellascan-app',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './assets/images/icon.png',
		scheme: 'wellascanapp',
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.joeyiglesias.wellascan',
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './assets/images/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
			package: 'com.joeyiglesias.wellascan',
		},
		web: {
			bundler: 'metro',
			output: 'static',
			favicon: './assets/images/favicon.png',
		},
		plugins: [
			'expo-router',
			[
				'expo-splash-screen',
				{
					image: './assets/images/splash-icon.png',
					imageWidth: 200,
					resizeMode: 'contain',
					backgroundColor: '#ffffff',
				},
			],
			[
				'expo-camera',
				{
					cameraPermission: 'Allow WellaScan to access your camera',
					microphonePermission: 'Allow WellaScan to access your microphone',
					recordAudioAndroid: true,
				},
			],
			'expo-audio',
		],
		experiments: {
			typedRoutes: true,
		},
		extra: {
			API_BASE_URL: isDev ? 'https://9d29-185-207-249-108.ngrok-free.app' : 'https://wellascan-server-production.up.railway.app',
		},
	}
}
