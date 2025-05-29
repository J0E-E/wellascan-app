import React, { useContext, useEffect } from 'react'
import { AuthProvider, AuthContext } from './AuthContext'
import { setAuthState, setContextAuthHandlers } from '@/context/auth/authSync'


/**
 * Component that wraps its children with authentication-related providers.
 * It ensures that authentication context is available and synchronizes it with the API handler.
 *
 * Props:
 * @property {React.ReactNode} children - The child components to be rendered inside the wrapper.
 */
export const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<AuthProvider>
			<SyncAuthWithAPIRequestHandler />
			{children}
		</AuthProvider>
	)
}

/**
 * SyncAuthWithAPIRequestHandler synchronizes authentication context methods
 * and state with the API handler. It ensures the API handler has up-to-date
 * authentication tokens and methods for managing authentication.
 */
const SyncAuthWithAPIRequestHandler = () => {
	const { state: authState, setAuth, unsetAuth } = useContext(AuthContext)

	useEffect(() => {
		// This syncs context methods with the API handler.
		setContextAuthHandlers({ setAuth, unsetAuth })

		// This ensures the API handler always has the latest token for requests
		setAuthState(authState)
	}, [authState, setAuth, unsetAuth])

	return null
}