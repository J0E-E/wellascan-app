import contextFactory from '@/context/contextFactory'
import { Dispatch } from 'react'

export type AuthState = {
	token: string
	refreshToken: string
}

type AuthAction =
	| {type: 'set_auth', payload: {token: string; refreshToken: string}}
	| {type: 'unset_auth'}

export type SetTokensOptions = {
	token: string,
	refreshToken: string
}

const defaultState: AuthState = {
	token: '',
	refreshToken: ''
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case 'set_auth':
			return { token: action.payload.token, refreshToken: action.payload.refreshToken}
		case 'unset_auth':
		default:
			return {token: '', refreshToken: ''}
	}
}

const authActions = {
	setAuth: (dispatch: Dispatch<AuthAction>) => (options: SetTokensOptions) => {
		dispatch({type: 'set_auth', payload: {token: options.token, refreshToken: options.refreshToken}})
	},
	unsetAuth: (dispatch: Dispatch<AuthAction>) => () => {
		dispatch({type: 'unset_auth'})
	}
}

export const {Provider: AuthProvider, Context: AuthContext } = contextFactory(authReducer, authActions, defaultState)