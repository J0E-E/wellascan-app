import { Image } from 'expo-image'
import { Input } from 'react-native-elements'
import { StyleSheet, Pressable, Text } from 'react-native'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'

import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import ErrorText from '@/components/ui/ErrorText'
import Spacer from '@/components/ui/Spacer'

import { AuthContext } from '@/context/auth/AuthContext'

import { signUp, signIn, handleAPIRequest } from '@/api/db'

import { useBusy } from '@/hooks/useBusy'

import { IMAGES } from '@/constants/images'
import globalStyles from '@/styles/global'
import { ROUTES } from '@/constants/routes'

export default function LoginScreen() {
	const { startTimedBusy, stopBusy } = useBusy()
	const [isSignUp, setIsSignUp] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errorText, setErrorText] = useState('')
	const router = useRouter()
	const { state: authState, setAuth } = useContext(AuthContext)

	/**
	 * Toggles the login state between sign-up and sign-in modes.
	 */
	const handleSwitchLoginState = () => {
		setIsSignUp(!isSignUp)
	}

	/**
	 * Handles authentication logic for signing up or signing in a user.
	 */
	const handleAuth = async () => {
		startTimedBusy()

		if (!email || !password) {
			// TODO: add email field validation.
			setErrorText('Email and password are required.')
			stopBusy()
			return
		}

		const authFn = isSignUp ? signUp : signIn

		const loginResponse = await handleAPIRequest({
			request: () => authFn({ email, password }), // no params needed unless you're filtering by ID
			onErrorMessage: setErrorText,
			router,
		})

		if (loginResponse?.data) {
			setAuth(loginResponse.data)
		}

		stopBusy()
	}

	useEffect(() => {
		if (authState.token) {
			router.replace(ROUTES.TABS)
		}
	}, [authState])

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
			headerImage={<Image source={IMAGES.APP_LOGO} style={styles.wellaLogo} />}
			withTabBar={false}
		>
			<ThemedView style={styles.authContainer}>
				<ThemedText type={'title'}>{isSignUp ? 'Sign-Up' : 'Login'}</ThemedText>
				<Spacer />
				<Input
					testID={'emailInput'}
					inputStyle={styles.inputStyle}
					label={'Email'}
					autoCapitalize={'none'}
					autoCorrect={false}
					value={email}
					onChangeText={setEmail}
					autoFocus
				/>
				<Spacer />
				<Input
					testID={'passwordInput'}
					inputStyle={styles.inputStyle}
					label={'Password'}
					autoCapitalize={'none'}
					autoCorrect={false}
					secureTextEntry
					value={password}
					onChangeText={setPassword}
					onSubmitEditing={handleAuth}
				/>
				<Spacer />
				<Pressable
					onPress={handleAuth}
					testID={'submitButton'}
					style={{
						backgroundColor: '#cc1a1a',
						borderRadius: 8,
						paddingVertical: 12,
					}}
				>
					<Text
						style={{
							color: '#ffffff',
							fontWeight: 'bold',
							fontSize: 16,
							textAlign: 'center',
						}}
						testID={'submitButtonText'}
					>
						{isSignUp ? 'Sign-Up' : 'Login'}
					</Text>
				</Pressable>
				<Spacer />
				<Pressable onPress={handleSwitchLoginState} testID={'switchStateButton'}>
					<Text style={styles.switchButtonStyle} testID={'switchStateButtonText'}>
						{isSignUp ? 'Login' : 'Sign-Up'}
					</Text>
				</Pressable>
				<Spacer />
				<ErrorText message={errorText} />
			</ThemedView>
		</ParallaxScrollView>
	)
}

const styles = StyleSheet.create({
	...globalStyles,

	authContainer: {
		backgroundColor: '#1e1e1e',
		paddingHorizontal: 24,
		paddingVertical: 40,
		marginHorizontal: 16,
		marginTop: 32,
		borderRadius: 12,
	},

	inputStyle: {
		color: '#ffffff',
	},

	switchButtonStyle: {
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 16,
		color: '#cc1a1a',
		marginTop: 12,
	},
})
