import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import ListDropdown from '@/components/barcode/ListDropdown'
import ScanResultCard from '@/components/barcode/ScanResultCard'
import ParallaxScrollView from '@/components/ParallaxScrollView'

import globalStyles from '@/styles/global'
import { IMAGES } from '@/constants/images'
import { ROUTES } from '@/constants/routes'
import BarcodeCamera from '@/components/barcode/BarcodeCamera'
import { useListLoader } from '@/hooks/useListLoader'
import { useWellaProductLookup } from '@/hooks/useWellaBarcodeScanner'
import ErrorText from '@/components/ui/ErrorText'
import { useAddProductToList } from '@/hooks/useAddProductToList'
import CameraPermission from '@/components/barcode/CameraPermission'

export default function BarcodeScreen() {
	const prevListId = useRef<string | undefined>(undefined)
	const { listId }: { listId: string } = useLocalSearchParams()
	const router = useRouter()
	const { lists, getLists, list, getList, listLoaderError } = useListLoader()
	const { setSku, product, wellaLookupError } = useWellaProductLookup()
	const { addProductToList, addProductSuccessMessage, addProductErrorMessage } = useAddProductToList()

	const [successMessage, setSuccessMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	// Set the error message
	useEffect(() => {
		if (listLoaderError || wellaLookupError || addProductErrorMessage) {
			setErrorMessage(listLoaderError || wellaLookupError || addProductErrorMessage)
		} else {
			setErrorMessage('')
		}
	}, [listLoaderError, wellaLookupError, addProductErrorMessage])

	// Set the success message
	useEffect(() => {
		setSuccessMessage(addProductSuccessMessage)
	}, [addProductSuccessMessage])

	// Get the selected list details.
	useEffect(() => {
		if (listId !== prevListId.current) {
			prevListId.current = listId
			getList(listId)
		}
	}, [listId, lists])

	// Reset the state of the screen
	const resetState = () => {
		setSku('')
		setSuccessMessage('')
	}

	// Add product to selected list if found
	useEffect(() => {
		if (!product || !list) return
		addProductToList({ list, product })
	}, [product])

	// Triggers re-fetch and render when screen regains focus
	useFocusEffect(
		useCallback(() => {
			resetState()
			getLists()
		}, []),
	)

	return (
		<CameraPermission>
			<ParallaxScrollView
				headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
				headerImage={<Image source={IMAGES.APP_LOGO} style={styles.wellaLogo} />}
			>
				<View style={styles.barcodeScreenContainer}>
					<ThemedView style={styles.titleContainer}>
						<ThemedText type="title">Wella Product Scanner</ThemedText>
						<ListDropdown lists={lists} selectedList={list} onChange={(list) => getList(list._id)} />
					</ThemedView>
					{product && !errorMessage ? (
						<ScanResultCard
							product={product}
							message={successMessage}
							onScanNext={() => resetState()}
							onViewList={() => {
								if (list) {
									router.push(ROUTES.LIST_DETAIL(list._id))
								}
							}}
						/>
					) : !list ? (
						<>
							<ThemedText style={styles.noListSelectedStyle}>PLEASE SELECT A LIST TO CONTINUE</ThemedText>
						</>
					) : (
						<BarcodeCamera
							barcodeType={'upc_a'}
							onScan={(data) => {
								setSku(data)
							}}
						/>
					)}
					{errorMessage && <ErrorText message={errorMessage} />}
				</View>
			</ParallaxScrollView>
		</CameraPermission>
	)
}

const styles = StyleSheet.create({
	...globalStyles,
	titleContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	barcodeScreenContainer: {
		flexDirection: 'column',
		flex: 1,
	},
	pickerStyle: {
		width: '75%',
		height: 40,
		fontSize: 30,
		textAlign: 'center',
		marginVertical: 3,
	},
	noListSelectedStyle: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 15,
	},
})
