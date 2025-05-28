import { StyleSheet, View, FlatList } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Image } from 'expo-image'
import globalStyles from '@/styles/global'
import { useCallback, useContext, useEffect, useState } from 'react'
import { ThemedText } from '@/components/ThemedText'
import { addList, getLists, handleAPIRequest } from '@/api/db'
import { AuthContext } from '@/context/AuthContext'
import { useBusy } from '@/hooks/useBusy'
import ErrorText from '@/components/ui/ErrorText'
import { useFocusEffect, useRouter } from 'expo-router'
import ListComponent from '@/components/list/ListComponent'

export type ListObject = {
	_id: string
	name: string
}

export default function ListsScreen() {
	const { startTimedBusy, stopBusy } = useBusy()
	const [errorText, setErrorText] = useState('')
	const [lists, setLists] = useState([])
	const [reload, setReload] = useState(true)
	const [name, setName] = useState('')
	const router = useRouter()

	const handleCreateListClick = async () => {
		setErrorText('')

		if (!name) {
			setErrorText('Please enter a New List Name')
			return
		}

		startTimedBusy()

		const addListResponse = await handleAPIRequest({
			request: () => addList(name), // <-- simplified: no auth needed
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
		useCallback(() => {
			setReload(true)
			return
		}, []),
	)

	useEffect(() => {
		if (!reload) return

		setErrorText('')

		const listAPI = async () => {
			startTimedBusy()

			const getListResponse = await handleAPIRequest({
				request: getLists, // no params needed unless you're filtering by ID
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
			<View style={styles.newListStyle}>
				<Input
					containerStyle={styles.newListInputContainerStyle}
					inputStyle={styles.newListInputStyle}
					placeholder={'New List Name'}
					autoCapitalize={'words'}
					value={name}
					onChangeText={setName}
					onSubmitEditing={handleCreateListClick}
				/>
				<Button
					style={styles.newListButtonStyle}
					title={'+'}
					onPress={handleCreateListClick}
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
})