import { Image } from 'expo-image'
import { Input, Button } from 'react-native-elements'
import { StyleSheet, Pressable, Text } from 'react-native'
import { useContext, useEffect, useState } from 'react'

import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { AuthContext } from '@/context/AuthContext'
import { useRouter } from 'expo-router'
import Spacer from '@/components/ui/Spacer'
import { signUp, signIn, getAPIErrorMessage } from '@/api/db'
import { useBusy } from '@/hooks/useBusy'
import ErrorText from '@/components/ui/ErrorText'
import globalStyles from '@/styles/global'

export default function LoginScreen() {
	const { startTimedBusy, stopBusy } = useBusy()
	const [isSignUp, setIsSignUp] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errorText, setErrorText] = useState('')
	const router = useRouter()
	const { state: authState, setAuth, unsetAuth } = useContext(AuthContext)

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
		setErrorText('')

		if (!email || !password) {
			// TODO: add email field validation.
			setErrorText('Email and password are required.');
			stopBusy();
			return;
		}

		const authFn = isSignUp ? signUp : signIn
		try {
			const authResponse = await authFn({ email, password })
			if (authResponse.data.data) {
				setAuth({ ...authResponse.data.data })
			}
		} catch (error: unknown) {
			setErrorText(getAPIErrorMessage(error))
			unsetAuth()
		} finally {
			stopBusy()
		}
	}

	useEffect(() => {
		if (authState.token) {
			console.log(authState.token)
			router.replace('/(tabs)')
		}
	}, [authState])

	return <ParallaxScrollView
		headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
		headerImage={
			<Image
				source={require('@/assets/images/wella.png')}
				style={styles.wellaLogo}
			/>
		}
		withTabBar={false}>
		<ThemedView>
			<ThemedText type={'title'}>{isSignUp ? 'Sign-Up' : 'Login'}</ThemedText>
			<Spacer />
			<Input
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
				inputStyle={styles.inputStyle}
				label={'Password'}
				autoCapitalize={'none'}
				autoCorrect={false}
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			<Spacer />
			<Button
				title={(isSignUp ? 'Sign-Up' : 'Login')}
				onPress={handleAuth}
				disabled={!email || !password}
			/>
			<Spacer />
			<Pressable
				onPress={handleSwitchLoginState}
			>
				<Text style={styles.switchButtonStyle}>{isSignUp ? 'Login' : 'Sign-Up'}</Text>
			</Pressable>
			<Spacer />
			<ErrorText message={errorText}/>
		</ThemedView>
	</ParallaxScrollView>
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
	inputStyle: {
		color: '#ffffff',
	},
	switchButtonStyle: {
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 20,
		color: '#000fff',
	},
})