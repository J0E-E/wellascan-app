import React from 'react'
import { act, waitFor } from '@testing-library/react-native'
import { render, fireEvent } from '@testing-library/react-native'
import BarcodeScreen from '@/app/(tabs)/barcode'
import { useListLoader } from '@/hooks/useListLoader'
import { useWellaProductLookup } from '@/hooks/useWellaBarcodeScanner'
import { useAddProductToList } from '@/hooks/useAddProductToList'
import { useRouter, useLocalSearchParams } from 'expo-router'

// Mock child components
jest.mock('@/components/ParallaxScrollView', () => {
	return ({ children }: any) => <>{children}</>
})
jest.mock('@/components/barcode/CameraPermission', () => {
	return ({ children }: any) => <>{children}</>
})
jest.mock('@/components/barcode/ListDropdown', () => (props: any) => {
	const React = require('react')
	return React.createElement(
		'Text',
		{
			testID: 'mock-list-dropdown',
			onPress: () => props.onChange({ _id: 'list-123' }), // ✅ triggers getList
		},
		'Select List',
	)
})

jest.mock('@/components/barcode/ScanResultCard', () => (props: any) => {
	const React = require('react')
	return React.createElement(
		React.Fragment,
		null,
		React.createElement('Text', {}, props.product?.name),
		React.createElement('Text', {}, props.message),
		React.createElement('Text', { testID: 'view-list-button', onPress: props.onViewList }, 'View List'),
		React.createElement('Text', { testID: 'scan-next-button', onPress: props.onScanNext }, 'Scan Next'),
	)
})

jest.mock('@/components/barcode/BarcodeCamera', () => (props: any) => {
	const React = require('react')
	return React.createElement('Text', { testID: 'camera-scan-button', onPress: () => props.onScan('mock-sku') }, 'Scan')
})

// Mocks for all hooks
jest.mock('@/hooks/useListLoader')
jest.mock('@/hooks/useWellaBarcodeScanner')
jest.mock('@/hooks/useAddProductToList')

let focusCallback: (() => void) | null = null

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
	useFocusEffect: (cb: () => void) => {
		focusCallback = cb
	},
}))

describe('BarcodeScreen', () => {
	const mockPush = jest.fn()
	const getLists = jest.fn()
	const getList = jest.fn()
	const addProductToList = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(useLocalSearchParams as jest.Mock).mockReturnValue({ listId: 'list-123' })
		;(useListLoader as jest.Mock).mockReturnValue({
			lists: [{ _id: 'list-123', name: 'Test List' }],
			list: { _id: 'list-123', name: 'Test List' },
			getLists,
			getList,
			listLoaderError: '',
		})
		;(useWellaProductLookup as jest.Mock).mockReturnValue({
			setSku: jest.fn(),
			product: null,
			wellaLookupError: '',
		})
		;(useAddProductToList as jest.Mock).mockReturnValue({
			addProductToList,
			addProductSuccessMessage: '',
			addProductErrorMessage: '',
		})
	})

	it('renders title and list dropdown', () => {
		act(() => {
			focusCallback?.()
		})
		const { getByText, getByTestId } = render(<BarcodeScreen />)
		expect(getByText('Wella Product Scanner')).toBeTruthy()
		expect(getByTestId('mock-list-dropdown')).toBeTruthy()
	})

	it('calls getList when a new list is selected from dropdown', () => {
		const { getByTestId } = render(<BarcodeScreen />)
		fireEvent.press(getByTestId('mock-list-dropdown'))
		expect(getList).toHaveBeenCalledWith('list-123')
	})

	it('renders camera scan button when list is selected and no product yet', () => {
		const { getByTestId } = render(<BarcodeScreen />)
		expect(getByTestId('camera-scan-button')).toBeTruthy()
	})

	it('renders product scan result if product is found', async () => {
		;(useWellaProductLookup as jest.Mock).mockReturnValue({
			setSku: jest.fn(),
			product: { sku: '123', name: 'Mock Product' },
			wellaLookupError: '',
		})
		;(useAddProductToList as jest.Mock).mockReturnValue({
			addProductToList,
			addProductSuccessMessage: 'Product added!',
			addProductErrorMessage: '',
		})

		const { findByText, getByTestId, queryByText } = render(<BarcodeScreen />)

		expect(await findByText('Mock Product')).toBeTruthy()
		expect(await findByText('Product added!')).toBeTruthy()

		fireEvent.press(getByTestId('view-list-button'))
		expect(mockPush).toHaveBeenCalledWith('/list/list-123')

		fireEvent.press(getByTestId('scan-next-button'))
		await waitFor(() => {
			expect(queryByText('Product added!')).toBeNull()
		})
	})

	it('shows error if product lookup fails', () => {
		;(useWellaProductLookup as jest.Mock).mockReturnValue({
			setSku: jest.fn(),
			product: null,
			wellaLookupError: 'Product not found',
		})

		const { getByText } = render(<BarcodeScreen />)
		expect(getByText('Product not found')).toBeTruthy()
	})

	it('displays message when no list is selected', () => {
		;(useListLoader as jest.Mock).mockReturnValue({
			lists: [],
			list: null,
			getLists,
			getList,
			listLoaderError: '',
		})

		const { getByText } = render(<BarcodeScreen />)
		expect(getByText('PLEASE SELECT A LIST TO CONTINUE')).toBeTruthy()
	})

	it('calls resetState and getLists on focus', () => {
		act(() => {
			focusCallback?.()
		})
		render(<BarcodeScreen />)

		expect(getLists).toHaveBeenCalled()
	})

	it('renders success message when product is added', async () => {
		const mockSetSku = jest.fn()

		;(useWellaProductLookup as jest.Mock).mockReturnValue({
			setSku: mockSetSku,
			product: { sku: 'mock-sku', name: 'Mock Product' }, // simulate already scanned
			wellaLookupError: '',
		})
		;(useAddProductToList as jest.Mock).mockReturnValue({
			addProductToList: jest.fn(),
			addProductSuccessMessage: 'Product added!',
			addProductErrorMessage: '',
		})

		const { findByText } = render(<BarcodeScreen />)
		expect(await findByText('Product added!')).toBeTruthy()
	})
})
