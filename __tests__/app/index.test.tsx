import React from 'react'
import { render } from '@testing-library/react-native'
import Index from '../../app/index'
import { AuthContext } from '@/context/auth/AuthContext'
import { ROUTES } from '@/constants/routes'

// mock the return of Redirect for testing purposes
jest.mock('expo-router', () => {
	const { Text } = require('react-native')
	return {
		Redirect: jest.fn(({ href }) => <Text>Redirected to {href}</Text>),
	}
})

// test redirection occurs as expected.
describe('Index screen redirection', () => {
	it('redirects to /login when no token is present', () => {
		const authState = { token: '', refreshToken: '' }

		const { getByText } = render(
			<AuthContext.Provider value={{ state: authState, setAuth: () => {}, unsetAuth: () => {} }}>
				<Index />
			</AuthContext.Provider>,
		)

		expect(getByText(`Redirected to ${ROUTES.LOGIN}`)).toBeTruthy()
	})

	it('redirects to /tabs when token is present', () => {
		const authState = { token: 'mock-token', refreshToken: 'mock-refresh-token' }

		const { getByText } = render(
			<AuthContext.Provider value={{ state: authState, setAuth: () => {}, unsetAuth: () => {} }}>
				<Index />
			</AuthContext.Provider>,
		)

		expect(getByText(`Redirected to ${ROUTES.TABS}`)).toBeTruthy()
	})
})
