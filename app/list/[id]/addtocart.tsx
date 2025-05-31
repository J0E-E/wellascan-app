import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { CameraView, useCameraPermissions } from 'expo-camera'
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
	const [errorList, setErrorList] = useState<string[]>([])
	const [completed, setCompleted] = useState(false)

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
		if (
			id &&
			lists.length > 0
		) {
			const foundList = lists.find((list: ListObject) => list._id === id)

			if (!foundList) return

			if (foundList) {
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
		}
	}, [id, lists])

	const handleSendToCart = async (): Promise<void> => {
		if (!qr || !productsToReorder) return // TODO: show error message

		for (const product of productsToReorder) {
			startTimedBusy()

			try {
				// Step 1: Get product code by EAN
				const searchResponse = await wellaAPI.get('products/searchByEan/', {
					params: {
						ean: product.sku,
						lang: 'en',
					},
				})

				const code = searchResponse?.data?.code
				if (!code) {
					setErrorList(prev => [...prev, product.sku])
					continue
				}

				// Step 2: Add product to cart
				const addResponse = await wellaAPI.post(
					'users/current/carts/12838348/entries',
					{
						product: {
							code,

						},
						quantity: product.reorderQuantity
					},
					{
						params: {
							fields: 'FULL'
						},
						headers: {
							Authorization: `Bearer ${qr}`,
							Cookie: 'ROUTE=.api-75fbd89c5-ldw5n',
							'Content-Type': 'application/json'
						}
					}
				)
				if (addResponse.status !== 200) {
					setErrorList(prev => [...prev, product.sku])
				}
			} catch (err) {
				setErrorList(prev => [...prev, product.sku])
			} finally {
				stopBusy()
				setTimeout(()=> {
					if (errorList.length) console.error(`Some products did not update in Wella Cart: ${errorList}`)
				})
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
		} finally {
			stopBusy()
			router.replace('/lists')
		}
	}

	if (!permission) {
		// Camera permissions are still loading.
		return <View />
	}

	if (!permission.granted) {
		// Camera permissions are not granted.
		return <View>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Wella Product Uploader</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText
					type="subtitle">{'Please allow camera permissions to app in order to continue.'}</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<Button
					title={'grant permission'}
					onPress={requestPermission}
				/>
			</ThemedView>
		</View>
	}

	return (
		<View style={styles.mainViewStyle}>
			<View style={styles.headerComponentStyle}>
				<View style={styles.wellaImageContainer}>
					<Image
						source={IMAGES.APP_LOGO}
						style={styles.wellaLogoLocal}
					/>
				</View>
			</View>
			<ThemedText type={'title'} style={styles.titleStyle}> Wella Product Uploader</ThemedText>
			{!qr
				? <View>
					<ThemedText type={'subtitle'} style={styles.titleStyle}> Please scan the QR code for Wella Login
						Info</ThemedText>
					<View style={styles.cameraContainerStyle}>
						<GestureDetector gesture={tap}>
							<CameraView
								style={styles.camera}
								facing={'back'}
								autofocus={isRefreshing ? 'off' : 'on'}
								barcodeScannerSettings={{
									barcodeTypes: ['qr'],
								}}
								onBarcodeScanned={(scanningResult) => {
									setQR(scanningResult.data)
								}}
							/>
						</GestureDetector>
					</View>
				</View>
				: <View>
					{
						!completed
							? <View>
								<ThemedText type={'title'} style={styles.titleStyle}>QR Code Scanned and ready.</ThemedText>
								<Button
									title="Send to Wella Cart"
									onPress={handleSendToCart}
									containerStyle={{ marginTop: 50 }}
									buttonStyle={styles.scanButton}
								/>
						</View>
							: <View>
								<ThemedText type={'title'} style={styles.titleStyle}>Wella Cart Updated.</ThemedText>
								<Button
									title="Delete List and Return"
									onPress={handleDeleteAndClose}
									containerStyle={{ marginTop: 50 }}
									buttonStyle={styles.scanButton}
								/>
							</View>
					}
				</View>
			}
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
		height: 400,
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
		marginVertical: 25,
	},
	scanButton: {
		backgroundColor: '#cc1a1a',
		borderRadius: 10,
		paddingVertical: 14,
	},
})