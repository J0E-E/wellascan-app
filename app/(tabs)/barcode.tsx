import { Button, StyleSheet, View } from 'react-native'
import { useAudioPlayer } from 'expo-audio'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { Image } from 'expo-image'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useEffect, useState } from 'react'

import wellaAPI from '@/api/wella'
import { useBusy } from '@/hooks/useBusy'
import globalStyles from '@/styles/global'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { addProduct, handleAPIRequest } from '@/api/db'

const scannerSound = require('../../assets/sounds/scanner-beep.mp3')


export default function BarcodeScreen() {
	const router = useRouter()
	const { startTimedBusy, stopBusy } = useBusy()
	const [sku, setSku] = useState<string>('')
	const [product, setProduct] = useState<string>('')
	const [permission, requestPermission] = useCameraPermissions()
	const { listId, listName }: { listId: string, listName: string } = useLocalSearchParams()
	const [successMessage, setSuccessMessage] = useState('')

	const scannerSoundPlayer = useAudioPlayer(scannerSound)

	const resetState = () => {
		setProduct('')
		setSku('')
		setSuccessMessage('')
		scannerSoundPlayer.seekTo(0)
	}

	useEffect(() => {
		if (!sku) return

		const getUPCDetails = async () => {
			try {
				startTimedBusy()
				const response = await wellaAPI.get('searchByEan/', {
					params: {
						ean: sku,
						lang: 'en',
					},
				})
				if (response?.data?.name) {
					setProduct(response?.data?.name)
				}
			} catch (error) {
				console.log(error)
			} finally {
				stopBusy()
			}

		}
		getUPCDetails()
		// no need to trigger on startTimedBusy or stopBusy.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sku])

	useEffect(() => {
		if (!product) return

		const addProductToList = async () => {
			const response = await handleAPIRequest({
				request: () => addProduct(listId, sku, product, 1),
				router,
			})

			if (response) {
				setSuccessMessage('Product Successfully Added')
			}
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
			headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
			headerImage={
				<Image
					source={require('@/assets/images/wella.png')}
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
					source={require('@/assets/images/wella.png')}
					style={styles.wellaLogo}
				/>
			}>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Wella Product Scanner</ThemedText>
				<ThemedText type="subtitle">For List: {listName}</ThemedText>
			</ThemedView>
			{
				sku
					? (<>
							<ThemedText type="subtitle">{sku}</ThemedText>
							<ThemedText type="subtitle">{product}</ThemedText>
							<ThemedText type={'subtitle'}>{successMessage}</ThemedText>
							<Button
								title={'Next Product'}
								onPress={resetState}
							/>
						</>
					)
					: (
						<>
							<Button
								title={'Simulate Barcode Scan'}
								onPress={() => {
									setSku('4064666230160')
								}}
							/>
							<CameraView
								style={styles.camera}
								facing={'back'}
								autofocus={'on'}
								barcodeScannerSettings={{
									barcodeTypes: ['upc_a'],
								}}
								onBarcodeScanned={(scanningResult) => {
									scannerSoundPlayer.play()
									setSku(scanningResult.data)
								}}
							/>
						</>
					)
			}
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
})
