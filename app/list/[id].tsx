import { View, StyleSheet, FlatList, Pressable } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from 'react-native-elements'

import { ThemedText } from '@/components/ThemedText'
import { IconSymbol } from '@/components/ui/IconSymbol'
import ProductComponent from '@/components/product/ProductComponent'

import { useThemeColor } from '@/hooks/useThemeColor'

import { getLists, handleAPIRequest } from '@/api/db'

import { ProductObject } from '@/types'

export default function ListScreen() {
	const { id } = useLocalSearchParams() as { id: string }
	const [reload, setReload] = useState(true)
	const [listName, setListName] = useState('')
	const [products, setProducts] = useState<ProductObject[]>([])
	const [errorMessage, setErrorMessage] = useState('')
	const router = useRouter()

	const color = useThemeColor({ light: 'black', dark: 'white' }, 'text')

	// Reload lists on focus of screen
	useFocusEffect(
		useCallback(() => {
			setReload(true)
			return
		}, []),
	)

	// Pull lists from DB
	useEffect(() => {
		if (!reload) return

		const getListDetail = async () => {
			const listResponse = await handleAPIRequest({
				request: () => getLists(id),
				router,
			})

			if (listResponse?.data.name) {
				setListName(listResponse.data.name)
			}
			if (listResponse?.data.productsToReorder) {
				setProducts(listResponse.data.productsToReorder)
			}

			setReload(false)
		}

		getListDetail()
	}, [reload])

	return (
		<View style={styles.container}>
			<View style={styles.titleRow}>
				<ThemedText type="title" style={styles.titleText}>
					{listName}
				</ThemedText>
				<Pressable style={styles.editButton} onPress={() => console.log('EDIT')}>
					{/* TODO: Add list name editing feature. */}
					<IconSymbol size={20} name="pencil" color={color} />
				</Pressable>
			</View>
			{errorMessage ? (
				<ThemedText style={styles.errorMessage} type="default">
					{errorMessage}
				</ThemedText>
			) : null}
			<View style={styles.productsContainer}>
				<FlatList
					data={products}
					keyExtractor={(product: ProductObject) => product._id}
					renderItem={({ item }) => (
						<View style={styles.productCard}>
							<ProductComponent
								product={item}
								reloadCallback={() => setReload(true)}
								onSetErrorMessage={setErrorMessage}
							/>
						</View>
					)}
					ListEmptyComponent={
						<ThemedText type="subtitle" style={styles.emptyText}>
							No products in this list.
						</ThemedText>
					}
				/>
			</View>

			<Button
				title="Scan Products To List"
				onPress={() => {
					router.navigate({
						pathname: '/(tabs)/barcode',
						params: { listId: id, listName },
					})
				}}
				buttonStyle={styles.scanButton}
				titleStyle={styles.scanButtonTitle}
			/>

			<Button
				title="Send to Wella Shopping Cart"
				onPress={() => router.replace(`/list/${id}/addtocart`)}
				containerStyle={{ marginTop: 20 }}
				buttonStyle={styles.scanButton}
				titleStyle={styles.scanButtonTitle}
			/>

			<View style={styles.footerSpacing} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
		paddingHorizontal: 20,
		paddingTop: 40,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginBottom: 20,
	},
	titleText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
	},
	editButton: {
		backgroundColor: '#2a2a2a',
		padding: 8,
		borderRadius: 6,
	},
	productsContainer: {
		flex: 1,
		width: '100%',
		borderWidth: 1,
		borderColor: '#393939',
		borderRadius: 12,
		padding: 10,
		marginBottom: 20,
	},
	productCard: {
		backgroundColor: '#1e1e1e',
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
	},
	emptyText: {
		color: '#777',
		textAlign: 'center',
		fontSize: 18,
		marginTop: 100,
	},
	scanButton: {
		backgroundColor: '#cc1a1a',
		borderRadius: 10,
		paddingVertical: 14,
	},
	scanButtonTitle: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	footerSpacing: {
		height: 30,
	},
	errorMessage: {
		color: '#ff5c5c',
		marginBottom: 10,
		textAlign: 'center',
		fontSize: 14,
	},
})
