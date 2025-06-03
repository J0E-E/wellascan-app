import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { BarcodeScanningResult, CameraView } from 'expo-camera'
import { StyleSheet } from 'react-native'
import { useAutofocus } from '@/hooks/useAutoFocus'

export default function BarcodeCamera({ barcodeType, onScan }: { barcodeType: 'upc_a' | 'qr'; onScan: (data: string) => void }) {
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
					onScan(scanningResult.data)
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
