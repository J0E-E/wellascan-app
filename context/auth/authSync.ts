import { AuthState, SetTokensOptions } from '@/context/auth/AuthContext'

/**
 * Provides a bridge between AuthContext and external API handlers (e.g., Axios).
 *
 * This module maintains a copy of the current AuthState and exposes handlers for setting and clearing
 * auth tokens from outside React components, such as inside Axios interceptors.
 *
 * Intended for use with `AuthProviderWrapper` to synchronize React context with non-React modules.
 */


// Local cache of the current auth state and context handlers
let authState: AuthState | null = null
let setAuthFn: ((options: SetTokensOptions) => void) | null = null
let unsetAuthFn: (() => void) | null = null

/**
 * Sets the current AuthState for external modules to use.
 */
export const setAuthState = (auth: AuthState): void => {
	authState = auth
}

/**
 * Returns the current AuthState.
 */
export const getAuthState = (): AuthState | null => authState

/**
 * Clears the current AuthState.
 */
export const clearAuthState = (): void => {
	authState = null
}

/**
 * Sets the context handlers (e.g., setAuth, unsetAuth) for external access.
 */
export const setContextAuthHandlers = ({ setAuth, unsetAuth }: {
	setAuth: (options: SetTokensOptions) => void
	unsetAuth: () => void
}): void => {
	setAuthFn = setAuth
	unsetAuthFn = unsetAuth
}

/**
 * Returns the currently set context auth handlers.
 */
export const getContextAuthHandlers = (): {
	setAuthFn: ((options: SetTokensOptions) => void) | null
	unsetAuthFn: (() => void) | null
} => ({
	setAuthFn,
	unsetAuthFn,
})
