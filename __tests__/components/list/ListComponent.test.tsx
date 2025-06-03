import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { ListObject } from '@/types'

import * as db from '@/api/db'

jest.mock('@/api/db', () => ({
	__esModule: true,
	handleAPIRequest: jest.fn(),
	deleteList: jest.fn(),
}))

const mockPush = jest.fn()
const mockSetParams = jest.fn()

jest.mock('expo-router', () => ({
	useRouter: () => ({
		push: mockPush,
		setParams: mockSetParams,
	}),
}))

jest.mock('@/hooks/useThemeColor', () => ({
	useThemeColor: () => 'black',
}))

jest.mock('@/components/ui/IconSymbol', () => {
	const React = require('react')
	const { View } = require('react-native')
	return {
		IconSymbol: ({ name }: { name: string }) => <View testID={`icon-${name}`} />,
	}
})

import ListComponent from '@/components/list/ListComponent'

describe('ListComponent', () => {
	const mockList: ListObject = {
		_id: 'abc123',
		name: 'Test List',
		productsToReorder: [],
		userId: 'user1',
	}

	const mockSetReload = jest.fn()
	const mockSetErrorText = jest.fn()

	const setup = () => render(<ListComponent listItem={mockList} setReload={mockSetReload} setErrorText={mockSetErrorText} />)

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders the list item name and icon', () => {
		const { getByText, getByTestId } = setup()

		expect(getByText('Test List')).toBeTruthy()
		expect(getByTestId('icon-trash')).toBeTruthy()
		expect(getByTestId('listComponentPressable-abc123')).toBeTruthy()
	})

	it('navigates when the list item is pressed', () => {
		const { getByTestId } = setup()

		fireEvent.press(getByTestId('listComponentPressable-abc123'))

		expect(mockSetParams).toHaveBeenCalledWith({ listName: 'Test List' })
		expect(mockPush).toHaveBeenCalledWith('/list/abc123')
	})

	it('calls delete API and reloads on successful delete', async () => {
		;(db.deleteList as jest.Mock).mockResolvedValue({ success: true })
		;(db.handleAPIRequest as jest.Mock).mockImplementation(({ request }) => request())

		const { getByTestId } = setup()

		fireEvent.press(getByTestId('icon-trash').parent)

		await waitFor(() => {
			expect(db.deleteList).toHaveBeenCalledWith('abc123')
			expect(mockSetReload).toHaveBeenCalledWith(true)
		})
	})

	it('sets error text on delete failure', async () => {
		;(db.handleAPIRequest as jest.Mock).mockImplementation(({ onErrorMessage }) => {
			onErrorMessage('Delete failed')
			return null
		})

		const { getByTestId } = setup()

		fireEvent.press(getByTestId('icon-trash').parent)

		await waitFor(() => {
			expect(mockSetErrorText).toHaveBeenCalledWith('Delete failed')
			expect(mockSetReload).not.toHaveBeenCalled()
		})
	})
})
