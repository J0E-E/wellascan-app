import { addProduct, handleAPIRequest } from '@/api/db'
import { ListObject } from '@/types'
import { WellaProductObject } from '@/hooks/useWellaBarcodeScanner'
import { useState } from 'react'
import { router } from 'expo-router'
import { useBusy } from '@/hooks/useBusy'

type AddProductParams = {
	list: ListObject
	product: WellaProductObject
}

type AddProductReturns = {
	addProductToList: ({ list, product }: AddProductParams) => void
	addProductSuccessMessage: string
	addProductErrorMessage: string
}

/**
 * A custom hook that provides functionality for adding a product to a list.
 *
 * This hook manages the state for success and error messages and integrates a loading
 * indicator during the process of adding a product to the specified list.
 *
 * @returns {AddProductReturns} An object containing the following properties:
 * - addProductToList: A function to handle adding a product to a list.
 * - success: A success message string indicating the operation's status.
 * - error: An error message string indicating any issues during the operation.
 */
export const useAddProductToList = (): AddProductReturns => {
	const [successMessage, setSuccessMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const { startTimedBusy, stopBusy } = useBusy()

	const addProductToList = async ({ list, product }: AddProductParams) => {
		setErrorMessage('')
		setSuccessMessage('')

		if (!list || !product) {
			setErrorMessage('Invalid product or list.')
			return
		}
		startTimedBusy()

		const response = await handleAPIRequest({
			request: () => addProduct(list._id, product.ean, product.name, 1),
			onErrorMessage: (message) => {
				setErrorMessage(message)
				return
			},
			router,
		})

		if (response) {
			setSuccessMessage(`Product Successfully Added to ${list.name}`)
		} else if (!errorMessage) {
			setErrorMessage(`Something went wrong. Try Again`)
		}
		stopBusy()
	}
	return { addProductToList, addProductSuccessMessage: successMessage, addProductErrorMessage: errorMessage }
}
