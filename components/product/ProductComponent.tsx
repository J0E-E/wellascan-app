import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ProductObject } from '@/types'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from '@/components/ThemedText'
import * as Haptics from 'expo-haptics'
import { adjustProductQuantity, deleteProduct, handleAPIRequest } from '@/api/db'
import { useBusy } from '@/hooks/useBusy'

export default function ProductComponent({
											 product,
											 reloadCallback,
										 }: {
	product: ProductObject
	reloadCallback: () => void
}) {
	const color = useThemeColor({ light: 'black', dark: 'white' }, 'text')
	const { startTimedBusy, stopBusy } = useBusy()
	const [errorMessage, setErrorMessage] = useState('')
	const [productQuantity, setProductQuantity] = useState(product.reorderQuantity)

	const handleDeletePress = async () => {
		startTimedBusy()
		await handleAPIRequest({
			request: () => deleteProduct(product._id),
			onErrorMessage: setErrorMessage,
		})
		stopBusy()
		reloadCallback()
	}

	const handleAdjustPress = async (type: 'increase' | 'decrease') => {
		const adjustmentResponse = await handleAPIRequest({
			request: () => adjustProductQuantity({ id: product._id, type }),
			onErrorMessage: setErrorMessage,
		})

		if (adjustmentResponse.data?.reorderQuantity !== undefined) {
			setProductQuantity(adjustmentResponse.data.reorderQuantity)
		} else {
			reloadCallback()
		}
	}

	return (
		<View style={styles.componentContainerStyle}>
			<View style={styles.quantityContainerStyle}>
				<Pressable
					style={styles.adjustmentButton}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
						handleAdjustPress('decrease')
					}}>
					<ThemedText style={styles.adjustmentButtonText} type="title">−</ThemedText>
				</Pressable>

				<View style={styles.quantityValueContainerStyle}>
					<Text style={[styles.quantityStyle, { color }]}>{productQuantity}</Text>
				</View>

				<Pressable
					style={styles.adjustmentButton}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
						handleAdjustPress('increase')
					}}>
					<ThemedText style={styles.adjustmentButtonText} type="title">+</ThemedText>
				</Pressable>
			</View>

			<View style={styles.detailsContainerStyle}>
				<Text style={styles.productNameStyle}>{product.name}</Text>
				<Text style={styles.productSkuStyle}>SKU: {product.sku}</Text>
			</View>

			<View style={styles.deleteContainerStyle}>
				<Pressable
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
						handleDeletePress()
					}}>
					<IconSymbol size={22} name="trash" color="white" />
				</Pressable>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	componentContainerStyle: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#2b2b2b',
		borderRadius: 8,
		paddingVertical: 6,
		paddingHorizontal: 8,
		marginBottom: 8,
		borderColor: '#3a3a3a',
		borderWidth: 1,
	},

	quantityContainerStyle: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 2,
		justifyContent: 'space-evenly',
	},

	adjustmentButton: {
		backgroundColor: '#cc1a1a',
		width: 28,
		height: 28,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	},

	adjustmentButtonText: {
		color: 'white',
		fontSize: 18,
	},

	quantityValueContainerStyle: {
		backgroundColor: '#151515',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
	},

	quantityStyle: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
	},

	detailsContainerStyle: {
		flex: 4,
		paddingLeft: 10,
	},

	productNameStyle: {
		color: 'white',
		fontSize: 15,
		fontWeight: '600',
	},

	productSkuStyle: {
		color: '#a8a8a8',
		fontSize: 12,
		marginTop: 2,
	},

	deleteContainerStyle: {
		flex: 1,
		alignItems: 'flex-end',
	},
})
