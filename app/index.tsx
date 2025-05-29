import { Redirect } from 'expo-router';
import { useContext } from 'react'
import { AuthContext } from '@/context/auth/AuthContext'

export default function Index() {
	const {state: authState} = useContext(AuthContext)

	if (authState.token) {
		return <Redirect href="/(tabs)" />
	}
	else {
		return <Redirect href="/login" />;
	}
}