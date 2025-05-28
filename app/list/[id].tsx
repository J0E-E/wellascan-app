import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { getLists, handleAPIRequest } from '@/api/db'
import { AuthContext } from '@/context/AuthContext'
import { useThemeColor } from '@/hooks/useThemeColor'
import { Button } from 'react-native-elements'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function ListScreen() {
	const { id }: { id: string } = useLocalSearchParams()
	const [reload, setReload] = useState(true)
	const [listName, setListName] = useState('')
	const [products, setProducts] = useState([])
	const router = useRouter()

	const color = useThemeColor({ light: 'black', dark: 'white' }, 'text')

	useFocusEffect(
		useCallback(() => {
			setReload(true)
			return
		}, []),
	)

	useEffect(() => {
		if (!reload) return

		const getListDetail = async () => {
			const listResponse = await handleAPIRequest({
				request: () => getLists(id),
				router,
				// optionally add this if you're managing error UI
				// onErrorMessage: setErrorText,
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
		<View style={styles.containerStyle}>
			<ThemedText type={'title'} style={styles.titleStyle}>
				{listName + '  '}
				<Pressable onPress={() => {
					console.log('EDIT')
				}}>
					<IconSymbol
						size={25}
						name="pencil"
						color={color}
					/>
				</Pressable>
			</ThemedText>
			<View style={styles.productsContainer}>
				<FlatList
					data={products}
					keyExtractor={(product: { _id: string, name: string, reorderQuantity: number }) => product._id || product.name}
					renderItem={({ item }) => {
						return <View style={styles.itemContainerStyle}>
							<Text style={styles.itemNameStyle}>{item.name}</Text>
							<Text style={styles.quantityStyle}>{item.reorderQuantity}</Text>
						</View>
					}}
					ListEmptyComponent={<View>
						<ThemedText type={'title'} style={{ textAlign: 'center', paddingVertical: 100 }}>NO PRODUCTS IN LIST</ThemedText>
					</View>
					}
				/>
			</View>
			<Button
				title={'Scan Products To List'}
				onPress={() => {
					router.navigate({ pathname: `/(tabs)/barcode`, params: { listId: id, listName } })
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	containerStyle: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 30,
	},
	productsContainer: {
		flex: 1,
		width: '100%',
		borderWidth: 1,
		borderColor: '#393939',
		margin: 20,
	},
	titleStyle: {
		marginVertical: 10,
	},
	productsStyle: {
		marginTop: 20,
		textAlign: 'center',
	},
	itemContainerStyle: {
		color: 'white',
		height: 100,
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	itemNameStyle: {
		width: '80%',
		color: 'white',
		borderColor: '#404040',
		borderWidth: 1,
		textAlign: 'left',
		fontSize: 25,
		paddingHorizontal: 20,
	},
	quantityStyle: {
		color: 'white',
		fontSize: 30,
		borderColor: '#404040',
		borderWidth: 1,
		width: 50,
		textAlign: 'center',
		alignContent: 'center',
		justifyContent: 'center',
	},
})