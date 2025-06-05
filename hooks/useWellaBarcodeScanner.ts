//TODO: build a hook here to handle sku, product, success/errorMessage, reset useBarcodeScanner()

import wellaAPI from '@/api/wella'
import { useCallback, useEffect, useState } from 'react'
import { useBusy } from '@/hooks/useBusy'

export type WellaProductObject = {
	ean: string
	name: string
}

type WellaLookupReturns = {
	setSku: (sku: string) => void
	product: WellaProductObject | null
	wellaLookupError: string
}

/**
 * Custom hook for looking up Wella products by SKU (EAN code).
 *
 * This hook provides functionality to search for Wella product information
 * using an external API based on the given SKU, along with managing loading state,
 * handling errors, and responding to changes in SKU input.
 *
 * @function useWellaProductLookup
 * @returns {Object} An object containing the following properties:
 * - `setSku (Function)`: A function to update the SKU (EAN code) for which the product details are to be fetched.
 * - `product (WellaProductObject | null)`: The product details retrieved from the API. It will be `null` if no product is found or the SKU is empty.
 * - `error (string)`: The error message, if any error occurs during the API call or when the product is not found. Defaults to an empty string (`''`).
 */
export const useWellaProductLookup = (): WellaLookupReturns => {
	const { startTimedBusy, stopBusy } = useBusy()
	const [sku, setSku] = useState<string>('')
	const [product, setProduct] = useState<WellaProductObject | null>(null)
	const [errorMessage, setErrorMessage] = useState<string>('')

	useEffect(() => {
		setProduct(null)
		setErrorMessage('')

		if (!sku) return
		;(async () => {
			try {
				startTimedBusy()
				const response = await wellaAPI.get('products/searchByEan/', {
					params: {
						ean: sku,
						lang: 'en',
					},
				})
				if (response?.data) {
					setProduct(response?.data)
				} else {
					setErrorMessage('Unable to find product.')
				}
			} catch (error) {
				console.error(error)
				setErrorMessage('Something went wrong.')
			} finally {
				stopBusy()
			}
		})()
	}, [sku])

	const setSkuCallback = useCallback((value: string) => {
		setSku(value)
	}, [])

	return {
		setSku: setSkuCallback,
		product,
		wellaLookupError: errorMessage,
	}
}
