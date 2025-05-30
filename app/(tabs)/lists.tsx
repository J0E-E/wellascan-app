import { StyleSheet, View, FlatList } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Image } from 'expo-image'
import globalStyles from '@/styles/global'
import { useCallback, useEffect, useState } from 'react'
import { ThemedText } from '@/components/ThemedText'
import { addList, getLists, handleAPIRequest } from '@/api/db'
import { useBusy } from '@/hooks/useBusy'
import ErrorText from '@/components/ui/ErrorText'
import { useFocusEffect, useRouter } from 'expo-router'
import ListComponent from '@/components/list/ListComponent'
import { ListObject } from '@/types'

export default function ListsScreen() {
	const { startTimedBusy, stopBusy } = useBusy()
	const router = useRouter()

	const [errorText, setErrorText] = useState('')	// UI error message
	const [lists, setLists] = useState([])			// Fetched list data
	const [reload, setReload] = useState(true)		// Triggers re-fetch and render when true
	const [name, setName] = useState('')			// Input value for new list


	const handleCreateListClick = async () => {
		// Handles the creation of a new list.
		setErrorText('')

		if (!name) {
			setErrorText('Please enter a New List Name')
			return
		}

		startTimedBusy()
		// ADD new list to DB
		const addListResponse = await handleAPIRequest({
			request: () => addList(name),
			onErrorMessage: setErrorText,
			router,
		})
		stopBusy()

		if (addListResponse) {
			setReload(true)
			setName('')
		}
	}

	useFocusEffect(
		// Triggers re-fetch and render when screen regains focus.
		useCallback(() => {
			setReload(true)
			return
		}, []),
	)

	useEffect(() => {
		// Re-fetch Re-render trigger for the screen.
		if (!reload) return

		setErrorText('')

		const listAPI = async () => {

			startTimedBusy()
			// GET list data
			const getListResponse = await handleAPIRequest({
				request: getLists,
				onErrorMessage: setErrorText,
				router,
			})
			if (getListResponse?.data) {
				setLists(getListResponse.data)
			}
			stopBusy()

			setReload(false)
		}

		listAPI()
	}, [reload])


	return <View style={{ flex: 1 }}>
		<View style={styles.headerComponentStyle}>
			<View style={styles.wellaImageContainer}>
				<Image
					source={require('@/assets/images/wella.png')}
					style={styles.wellaLogoLocal}
				/>
			</View>
			<View style={styles.inputRow}>
				<Input
					placeholder="Add New List"
					autoCapitalize="words"
					value={name}
					onChangeText={setName}
					onSubmitEditing={handleCreateListClick}
					placeholderTextColor="#888"
					inputStyle={styles.input}
					containerStyle={styles.inputContainer}
				/>
				<Button
					title="+"
					onPress={handleCreateListClick}
					buttonStyle={styles.addButton}
				/>
			</View>
			<ErrorText message={errorText} />
		</View>
		<FlatList
			style={styles.flatListContainerStyle}
			data={lists}
			keyExtractor={(list: ListObject) => list._id || list.name}
			renderItem={({ item }) => (
				<ListComponent
					listItem={item}
					setReload={setReload}
					setErrorText={setErrorText}
				/>
			)}
			contentContainerStyle={styles.flatListContentContainerStyle}
			ListEmptyComponent={
				<ThemedText type={'title'}>No lists found.</ThemedText>
			}
		/>
	</View>
}

const styles = StyleSheet.create({
	...globalStyles,
	newListStyle: {
		display: 'flex',
		flexDirection: 'row',
		paddingRight: 15,
		paddingTop: 25,
	},
	newListInputContainerStyle: {
		width: '90%',
	},
	newListInputStyle: {
		color: '#ffffff',
	},
	newListButtonStyle: {
		width: 50,
	},
	headerComponentStyle: {
		height: 375,
		flexDirection: 'column',
	},
	wellaImageContainer: {
		height: 250,
		justifyContent: 'flex-end',
		backgroundColor: 'rgb(29, 61, 71)',
	},
	wellaLogoLocal: {
		height: 180,
	},
	flatListContainerStyle: {
		flex: 1,
		borderColor: '#494949',
		borderWidth: 1,
		marginBottom: 100,
		marginHorizontal: 10,
	},
	flatListContentContainerStyle: {
		backgroundColor: '#191919',
		padding: 10,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		marginTop: 16,
	},
	inputContainer: {
		flex: 1,
		marginRight: 10,
	},
	input: {
		color: 'white',
		fontSize: 16,
	},
	addButton: {
		backgroundColor: '#cc1a1a',
		borderRadius: 8,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	// flatListContainerStyle: {
	// 	flex: 1,
	// },
	// flatListContentContainerStyle: {
	// 	padding: 16,
	// 	backgroundColor: '#121212',
	// 	gap: 12, // adds spacing between list items
	// },
})