import { Linking, StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Camera, CameraView, useCameraPermissions } from 'expo-camera'
import { Image } from 'expo-image'
import { ThemedView } from '@/components/ThemedView'
import { Button } from 'react-native-elements'
import globalStyles from '@/styles/global'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useAutofocus } from '@/hooks/useAutoFocus'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { deleteList, getLists, handleAPIRequest } from '@/api/db'
import { useBusy } from '@/hooks/useBusy'
import { ListObject, ProductObject } from '@/types'
import wellaAPI from '@/api/wella'
import { IMAGES } from '@/constants/images'
import * as ImagePicker from 'expo-image-picker';
import { AxiosError } from 'axios'

export default function AddToCartScreen() {
	const router = useRouter()
	const { startTimedBusy, stopBusy } = useBusy()
	const { id } = useLocalSearchParams<{ id: string }>()
	const [permission, requestPermission] = useCameraPermissions()
	const { isRefreshing, onTap } = useAutofocus()
	const tap = Gesture.Tap().onBegin(onTap).runOnJS(true)
	const [qr, setQR] = useState('')
	const [lists, setLists] = useState<ListObject[]>([])
	const [productsToReorder, setProductsToReorder] = useState<ProductObject[]>([])
	const [completed, setCompleted] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		(async () => {
			startTimedBusy()
			const getListResponse = await handleAPIRequest({
				request: getLists,
				router,
			})
			if (getListResponse?.data) {
				setLists(getListResponse.data)
			}
			stopBusy()
		})()
	}, [])

	useEffect(() => {
		if (id && lists.length > 0) {
			const foundList = lists.find((list: ListObject) => list._id === id)
			if (!foundList) return

			(async () => {
				startTimedBusy()
				const getListResponse = await handleAPIRequest({
					request: () => getLists(foundList._id),
					router,
				})
				if (getListResponse?.data) {
					setProductsToReorder(getListResponse.data.productsToReorder)
				}
				stopBusy()
			})()
		}
	}, [id, lists])

	const handlePickImageAndDecode = async (): Promise<void> => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: false,
				quality: 1,
			})

			if (result.canceled || result.assets.length === 0) return

			const uri = result.assets[0].uri
			const scanned = await Camera.scanFromURLAsync(uri, ['qr'])

			if (scanned.length > 0) {
				setQR(scanned[0].data)
			} else {
				setErrorMessage('No QR code found in image')
			}
		} catch (err) {
			setErrorMessage('Failed to scan QR from image.')
			console.error('Failed to scan QR from image:', err)
		}
	}

	const handleSendToCart = async (): Promise<void> => {
		if (!qr || !productsToReorder) {
			setErrorMessage('Missing QR code or product data.')
			return
		}

		for (const product of productsToReorder) {
			startTimedBusy()

			try {
				const searchResponse = await wellaAPI.get('products/searchByEan/', {
					params: { ean: product.sku, lang: 'en' },
				})
				const productCode = searchResponse?.data?.code
				if (!productCode) {
					setErrorMessage('Some product codes could not be found.')
					continue
				}

				const cartResponse = await wellaAPI.get('users/current/carts', {
					headers: { Authorization: `Bearer ${qr}` },
				})

				const cartCode = cartResponse?.data?.carts?.[0]?.code
				if (!cartCode) {
					setErrorMessage('No cart found for the user.')
					return
				}

				const addResponse = await wellaAPI.post(
					`users/current/carts/${cartCode}/entries`,
					{ product: { code: productCode }, quantity: product.reorderQuantity },
					{
						params: { fields: 'FULL' },
						headers: {
							Authorization: `Bearer ${qr}`,
							Cookie: 'ROUTE=.api-75fbd89c5-ldw5n',
							'Content-Type': 'application/json'
						}
					}
				)

				if (addResponse.status !== 200) {
					setErrorMessage('Some products could not be added to the cart.')
				}
			} catch (err) {
				const error = err as AxiosError
				setErrorMessage('An error occurred while adding products to the cart.')
				console.error('Error details:', error?.response?.data)
			} finally {
				stopBusy()
			}
		}
		setCompleted(true)
	}

	const handleDeleteAndClose = async (): Promise<void> => {
		if (!id) return
		startTimedBusy()
		try {
			await handleAPIRequest({
				request: () => deleteList(id),
				router,
			})
		} catch (error) {
			console.error('Error deleting list:', error)
			setErrorMessage('Could not delete list.')
		} finally {
			stopBusy()
			router.replace('/lists')
		}
	}

	if (!permission) return <View />

	if (!permission.granted) {
		return <View>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Wella Product Uploader</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Please allow camera permissions to app in order to continue.</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<Button title={'grant permission'} onPress={requestPermission} />
			</ThemedView>
		</View>
	}

	return (
		<View style={styles.mainViewStyle}>
			<View style={styles.headerComponentStyle}>
				<View style={styles.wellaImageContainer}>
					<Image source={IMAGES.APP_LOGO} style={styles.wellaLogoLocal} />
				</View>
			</View>
			<ThemedText type={'title'} style={styles.titleStyle}>Wella Product Uploader</ThemedText>
			{errorMessage ? <ThemedText type={'default'} style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</ThemedText> : null}
			{!qr
				? <View>
					<ThemedText type={'subtitle'} style={styles.titleStyle}>Please scan the QR code for Wella Login Info</ThemedText>
					<View style={styles.cameraContainerStyle}>
						<GestureDetector gesture={tap}>
							<CameraView
								style={styles.camera}
								facing={'back'}
								autofocus={isRefreshing ? 'off' : 'on'}
								barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
								onBarcodeScanned={(scanningResult) => setQR(scanningResult.data)}
							/>
						</GestureDetector>
					</View>
					<Button title="Go to Wella Site to get QR Image" onPress={() => Linking.openURL('https://us.wella.professionalstore.com/')} containerStyle={{ marginTop: 20 }} buttonStyle={styles.scanButton} />
					<Button title="Upload QR Image" onPress={handlePickImageAndDecode} containerStyle={{ marginTop: 20 }} buttonStyle={styles.scanButton} />
				</View>
				: <View>
					{!completed
						? <View>
							<ThemedText type={'title'} style={styles.titleStyle}>QR Code Scanned and ready.</ThemedText>
							<Button title="Send to Wella Cart" onPress={handleSendToCart} containerStyle={{ marginTop: 50 }} buttonStyle={styles.scanButton} />
						</View>
						: <View>
							<ThemedText type={'title'} style={styles.titleStyle}>Wella Cart Updated.</ThemedText>
							<Button title="Delete List and Return" onPress={handleDeleteAndClose} containerStyle={{ marginTop: 50 }} buttonStyle={styles.scanButton} />
						</View>}
				</View>}
		</View>
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
	camera: {
		flex: 1,
		borderWidth: 1,
		borderColor: 'red',
	},
	cameraContainerStyle: {
		height: 300,
	},
	mainViewStyle: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	headerComponentStyle: {
		height: 180,
		flexDirection: 'column',
	},
	wellaImageContainer: {
		height: 180,
	},
	wellaLogoLocal: {
		height: 180,
	},
	titleStyle: {
		textAlign: 'center',
		marginVertical: 10,
	},
	scanButton: {
		backgroundColor: '#cc1a1a',
		borderRadius: 10,
		paddingVertical: 14,
	},
})
