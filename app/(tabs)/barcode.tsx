import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-elements'
import { useAudioPlayer } from 'expo-audio'
import { Image } from 'expo-image'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Gesture, GestureDetector, } from 'react-native-gesture-handler'

import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

import ListDropdown from '@/components/barcode/ListDropdown'
import ScanResultCard from '@/components/barcode/ScanResultCard'
import ParallaxScrollView from '@/components/ParallaxScrollView'

import { useBusy } from '@/hooks/useBusy'
import { useAutofocus } from '@/hooks/useAutoFocus'

import wellaAPI from '@/api/wella'
import { addProduct, getLists, handleAPIRequest } from '@/api/db'

import { ListObject } from '@/types'
import globalStyles from '@/styles/global'
import { IMAGES } from '@/constants/images'

const scannerSound = require('../../assets/sounds/scanner-beep.mp3')

export default function BarcodeScreen() {
	const { listId }: {listId: string} = useLocalSearchParams()
	const router = useRouter()
	const { startTimedBusy, stopBusy } = useBusy()
	const [permission, requestPermission] = useCameraPermissions()
	const scannerSoundPlayer = useAudioPlayer(scannerSound)
	const { isRefreshing, onTap } = useAutofocus()
	const prevListId = useRef<string | undefined>(undefined)

	const [sku, setSku] = useState<string>('')
	const [product, setProduct] = useState<string>('')
	const [successMessage, setSuccessMessage] = useState('')
	const [selectedList, setSelectedList] = useState<ListObject | undefined>()
	const [reload, setReload] = useState(true)
	const [lists, setLists] = useState<ListObject[]>([])

	const tap = Gesture.Tap().onBegin(onTap).runOnJS(true)

	// Re-fetch Re-render trigger for the screen.
	useEffect(() => {
		if (!reload) return

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
			setReload(false)
		})()
	}, [reload])

	// Set selected list if passed in params or previously selected.
	useEffect(() => {
		if (
			listId &&
			listId !== prevListId.current &&
			lists.length > 0
		) {
			const foundList = lists.find((list: ListObject) => list._id === listId)
			if (foundList) {
				setSelectedList(foundList)
				prevListId.current = listId
			}
		}
	}, [listId, lists])

	// Triggers re-fetch and render when screen regains focus
	useFocusEffect(
		useCallback(() => {
			setReload(true)
			resetState()
			return
		}, []),
	)

	// Reset the state of the screen
	const resetState = () => {
		setProduct('')
		setSku('')
		setSuccessMessage('')
		scannerSoundPlayer.seekTo(0)
	}

	// Get wella product information from the scanned sku
	useEffect(() => {
		if (!sku) return

		const getUPCDetails = async () => {
			try {
				startTimedBusy()
				const response = await wellaAPI.get('products/searchByEan/', {
					params: {
						ean: sku,
						lang: 'en',
					},
				})
				if (response?.data?.name) {
					setProduct(response?.data?.name)
				}
				else {
					stopBusy()
				}
			} catch (error) {
				console.error(error)
				stopBusy()
			}

		}
		getUPCDetails()
	}, [sku])

	// Add product to selected list if found
	useEffect(() => {
		if (!product || !selectedList) return

		const addProductToList = async () => {
			startTimedBusy()
			const response = await handleAPIRequest({
				request: () => addProduct(selectedList._id, sku, product, 1),
				router,
			})

			if (response) {
				setSuccessMessage(`Product Successfully Added to ${selectedList.name}`)
			} else {
				setSuccessMessage(`Something went wrong. Try Again`)
			}
			stopBusy()
		}

		addProductToList()
	}, [product])

	if (!permission) {
		// Camera permissions are still loading.
		return <View />
	}

	if (!permission.granted) {
		// Camera permissions are not granted.
		return <ParallaxScrollView
			headerBackgroundColor={{ light: 'rgb(21, 23, 24)', dark: 'rgb(21, 23, 24)' }}
			headerImage={
				<Image
					source={IMAGES.APP_LOGO}
					style={styles.wellaLogo}
				/>
			}>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Wella Product Scanner</ThemedText>
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
		</ParallaxScrollView>
	}

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
			headerImage={
				<Image
					source={IMAGES.APP_LOGO}
					style={styles.wellaLogo}
				/>
			}>
			<View style={styles.barcodeScreenContainer}>
				<ThemedView style={styles.titleContainer}>
					<ThemedText type="title">Wella Product Scanner</ThemedText>
					<ListDropdown
						lists={lists}
						selectedList={selectedList}
						onChange={setSelectedList}
					/>
				</ThemedView>
				{
					sku
						? (<ScanResultCard
							sku={sku}
							product={product}
							message={successMessage}
							onScanNext={()=> resetState()}
							onViewList={() => {
								if (selectedList) {
									router.push(`/list/${selectedList._id}`)
								}
							}}
						/>)
						: !selectedList
							? (<><ThemedText style={styles.noListSelectedStyle}>PLEASE SELECT A LIST TO
								CONTINUE</ThemedText></>)
							: (
								<>
									<GestureDetector gesture={tap}>
										<CameraView
											style={styles.camera}
											facing={'back'}
											autofocus={isRefreshing ? 'off' : 'on'}
											barcodeScannerSettings={{
												barcodeTypes: ['upc_a'],
											}}
											onBarcodeScanned={(scanningResult) => {
												scannerSoundPlayer.play()
												setSku(scanningResult.data)
											}}
										/>
									</GestureDetector>
								</>
							)
				}
			</View>

		</ParallaxScrollView>
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
		height: 400,
		flex: 1,
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
