import { render } from '@testing-library/react-native'
import { AuthContext } from '@/context/auth/AuthContext'
import React, { useContext } from 'react'
import SignOut from '@/app/(tabs)/signout'
import { ROUTES } from '@/constants/routes'

// mock the return of Redirect for testing purposes
jest.mock('expo-router', () => {
	const { Text } = require('react-native')
	return {
		Redirect: jest.fn(({ href }) => <Text testID={'mockRedirect'}>{`Redirected to ${href}`}</Text>),
	}
})

const mockUnsetAuth = jest.fn()
const mockSetAuth = jest.fn()

describe('SignOut', () => {
	it('unsets auth and routes to login', () => {
		const authState = { token: 'someToken', refreshToken: 'someRefreshToken' }

		const { getByTestId } = render(
			<AuthContext.Provider value={{ state: authState, setAuth: mockSetAuth, unsetAuth: mockUnsetAuth }}>
				<SignOut />
			</AuthContext.Provider>,
		)

		expect(mockUnsetAuth).toHaveBeenCalled()
		expect(getByTestId('mockRedirect').props.children).toBe(`Redirected to ${ROUTES.LOGIN}`)
	})
})
