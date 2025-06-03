import { useEffect, useContext } from 'react'
import { Redirect } from 'expo-router'
import { AuthContext } from '@/context/auth/AuthContext'
import { ROUTES } from '@/constants/routes'

export default function SignOut() {
	const { state: authState, unsetAuth } = useContext(AuthContext)

	useEffect(() => {
		if (authState.token) {
			unsetAuth()
		}
	}, [])

	return <Redirect href={ROUTES.LOGIN} />
}
