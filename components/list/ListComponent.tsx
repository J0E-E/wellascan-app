import { ThemedText } from '@/components/ThemedText'
import React, { Dispatch } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import { deleteList, handleAPIRequest } from '@/api/db'
import { useRouter } from 'expo-router'
import { ListObject } from '@/types'

export default function ListComponent({ listItem, setReload, setErrorText }: {
	listItem: ListObject,
	setReload: Dispatch<React.SetStateAction<boolean>>,
	setErrorText: Dispatch<React.SetStateAction<string>>
}) {
	const color = useThemeColor({ light: 'black', dark: 'white' }, 'text')
	const router = useRouter()

	const handleDelete = async () => {

		const deleteResponse = await handleAPIRequest({
			request: () => deleteList(listItem._id),
			onErrorMessage: (message) => setErrorText(message),
			router
		})

		setReload(!!deleteResponse)
	}

	return <View style={styles.containerStyle}>
		<Pressable
			style={styles.detailContainerStyle}
			onPress={() => {
				router.setParams({ listName: listItem.name })
				router.push(`/list/${listItem._id}`)
			}}
		>
			<View>
				<ThemedText type={'title'}>{listItem.name}</ThemedText>
			</View>
		</Pressable>
		<Pressable
			style={styles.deleteContainerStyle}
			onPress={handleDelete}>
			<IconSymbol size={28} name="trash" color={color} />
		</Pressable>
	</View>
}

const styles = StyleSheet.create({
	containerStyle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderColor: '#434343',
		borderWidth: 1,
		marginVertical: 3,
		backgroundColor: 'black'
	},
	detailContainerStyle: {
		borderWidth: 1,
		flex: 1,
		padding: 8,
		justifyContent: 'center',
		alignContent: 'center',
	},
	deleteContainerStyle: {
		justifyContent: 'center',
		marginHorizontal: 5
	},
})