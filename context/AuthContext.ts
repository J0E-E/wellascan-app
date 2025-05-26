import contextFactory from '@/context/contextFactory'
import { Dispatch } from 'react'

export type AuthState = {
	token: string
	refreshtoken: string
}

type AuthAction =
	| {type: 'set_auth', payload: {token: string; refreshToken: string}}
	| {type: 'unset_auth'}

type SetTokensOptions = {
	token: string,
	refreshToken: string
}

const defaultState: AuthState = {
	token: '',
	refreshtoken: ''
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case 'set_auth':
			return { token: action.payload.token, refreshtoken: action.payload.refreshToken}
		case 'unset_auth':
		default:
			return {token: '', refreshtoken: ''}
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