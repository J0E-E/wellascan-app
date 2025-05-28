import React, { useContext, useEffect } from 'react'
import { AuthProvider, AuthContext } from './AuthContext'
import { setContextAuthHandlers, setAuthState } from '@/api/db'

export const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<AuthProvider>
			<SyncAuthWithAxios />
			{children}
		</AuthProvider>
	)
}

const SyncAuthWithAxios = () => {
	const { state: authState, setAuth, unsetAuth } = useContext(AuthContext)

	useEffect(() => {
		// This syncs context methods with Axios
		setContextAuthHandlers({ setAuth, unsetAuth })

		// This ensures Axios always has the latest token for requests
		setAuthState(authState)
	}, [authState, setAuth, unsetAuth])

	return null
}