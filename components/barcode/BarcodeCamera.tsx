import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { CameraView } from 'expo-camera'
import { StyleSheet } from 'react-native'
import { useAutofocus } from '@/hooks/useAutoFocus'
import { useAudioPlayer } from 'expo-audio'

const scannerSound = require('../../assets/sounds/scanner-beep.mp3')

export default function BarcodeCamera({ barcodeType, onScan }: { barcodeType: 'upc_a' | 'qr'; onScan: (data: string) => void }) {
	const scannerSoundPlayer = useAudioPlayer(scannerSound)
	const { isRefreshing, onTap } = useAutofocus()
	const tap = Gesture.Tap().onBegin(onTap).runOnJS(true)

	return (
		<GestureDetector gesture={tap}>
			<CameraView
				style={styles.camera}
				facing={'back'}
				autofocus={isRefreshing ? 'off' : 'on'}
				barcodeScannerSettings={{
					barcodeTypes: [barcodeType],
				}}
				onBarcodeScanned={(scanningResult) => {
					scannerSoundPlayer.play()
					onScan(scanningResult.data)
					setTimeout(() => {
						scannerSoundPlayer.seekTo(0)
					}, 1000)
				}}
			/>
		</GestureDetector>
	)
}

const styles = StyleSheet.create({
	camera: {
		height: 400,
		flex: 1,
	},
})
