import { useEffect, useContext } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from '@/context/auth/AuthContext';

export default function SignOut() {
	const { state: authState, unsetAuth } = useContext(AuthContext);

	useEffect(() => {
		if (authState.token) {
			unsetAuth();
		}
	}, []);

	return <Redirect href="/login" />;
}