import { ThemedText } from '@/components/ThemedText'
import { ListObject } from '@/app/(tabs)/lists'
import React, { Dispatch, useContext } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import { deleteList, getAPIErrorMessage } from '@/api/db'
import { AuthContext } from '@/context/AuthContext'

export default function ListComponent({ listItem, setReload, setErrorText }: {
	listItem: ListObject,
	setReload: Dispatch<React.SetStateAction<boolean>>,
	setErrorText: Dispatch<React.SetStateAction<string>>
}) {
	const {state: authState} = useContext(AuthContext)
	const color = useThemeColor({ light: 'black', dark: 'white' }, 'text')

	const handleDelete = async () => {
		try {
			await deleteList({ id: listItem._id, auth: authState })
			setReload(true)
		} catch (error) {
			setErrorText(getAPIErrorMessage(error))
			setReload(false)
		}
	}

	return <View style={styles.containerStyle}>
		<ThemedText type={'default'}>{listItem.name}</ThemedText>
		<Pressable onPress={handleDelete}>
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
		padding: 8,
	},
})