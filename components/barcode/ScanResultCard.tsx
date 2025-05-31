import { ThemedText } from '../ThemedText'
import { Button } from 'react-native-elements'
import { StyleSheet, View } from 'react-native'

type ScanResultCardProps = {
	sku: string
	product: string
	message: string
	onScanNext: () => void
	onViewList: () => void
}

export default function ScanResultCard({ sku, product, message, onScanNext, onViewList }: ScanResultCardProps) {
	return (
		<View style={styles.card}>
			<View style={styles.textContainer}>
				<ThemedText type="subtitle" style={styles.label}>
					SKU:
				</ThemedText>
				<ThemedText style={styles.value}>{sku}</ThemedText>

				<ThemedText type="subtitle" style={styles.label}>
					Product:
				</ThemedText>
				<ThemedText style={styles.value}>{product || 'No product found with that SKU'}</ThemedText>

				<ThemedText type="subtitle" style={styles.label}>
					Status:
				</ThemedText>
				<ThemedText style={styles.value}>{message}</ThemedText>
			</View>

			<View style={styles.buttonContainer}>
				<Button title="Scan Next Product" onPress={onScanNext} buttonStyle={styles.button} />
				<Button title="View List Details" onPress={onViewList} buttonStyle={styles.button} />
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#1e1e1e',
		borderRadius: 12,
		padding: 20,
		margin: 20,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	textContainer: {
		marginBottom: 20,
	},
	label: {
		fontWeight: 'bold',
		marginTop: 10,
		color: 'white',
	},
	value: {
		fontSize: 16,
		color: 'white',
	},
	buttonContainer: {
		flexDirection: 'column',
		gap: 12,
	},
	button: {
		backgroundColor: '#cc1a1a',
		borderRadius: 8,
		paddingVertical: 12,
	},
})
