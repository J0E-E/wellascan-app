import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import LoginScreen from '@/app/login'
import { AuthContext } from '@/context/auth/AuthContext'
import * as db from '@/api/db'
import { useRouter } from 'expo-router'
import { BusyProvider } from '@/context/busy/BusyContext'
import { within } from '@testing-library/dom'

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}))
jest.mock('@/api/db')

describe('LoginScreen', () => {
	const mockReplace = jest.fn()
	const mockSetAuth = jest.fn()

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })

		jest.clearAllMocks()
	})

	const renderScreen = () =>
		render(
			<AuthContext.Provider
				value={{
					state: { token: '', refreshToken: '' },
					setAuth: mockSetAuth,
					unsetAuth: () => {},
				}}
			>
				<BusyProvider>
					<LoginScreen />
				</BusyProvider>
			</AuthContext.Provider>,
		)

	it('renders login mode initially', () => {
		const { getByTestId } = renderScreen()
		expect(getByTestId('submitButtonText').props.children).toBe('Login')
		expect(getByTestId('switchStateButtonText').props.children).toBe('Sign-Up')
	})

	it('toggles to sign-up mode', () => {
		const { getByTestId } = renderScreen()
		fireEvent.press(getByTestId('switchStateButton'))
		expect(getByTestId('submitButtonText').props.children).toBe('Sign-Up')
		expect(getByTestId('switchStateButtonText').props.children).toBe('Login')
	})

	it('shows error if email or password is empty', async () => {
		const { getByTestId } = renderScreen()
		fireEvent.press(getByTestId('submitButton'))
		await waitFor(() => {
			expect(getByTestId('errorText').props.children).toBe('Email and password are required.')
		})
	})

	it('calls signIn and sets auth on login success', async () => {
		;(db.handleAPIRequest as jest.Mock).mockResolvedValue({ data: { token: 'abc', refreshToken: 'def' } })

		const { getByTestId } = renderScreen()
		fireEvent.changeText(getByTestId('emailInput'), 'test@example.com')
		fireEvent.changeText(getByTestId('passwordInput'), 'password123')
		fireEvent.press(getByTestId('submitButton'))

		await waitFor(() => {
			expect(db.handleAPIRequest).toHaveBeenCalled()
			expect(mockSetAuth).toHaveBeenCalledWith({ token: 'abc', refreshToken: 'def' })
		})
	})
})
