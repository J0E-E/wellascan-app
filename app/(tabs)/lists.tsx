import { Text, StyleSheet, View, FlatList } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Image } from 'expo-image'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import globalStyles from '@/styles/global'
import { useContext, useEffect, useState } from 'react'
import { ThemedText } from '@/components/ThemedText'
import { addList, getAPIErrorMessage, getLists } from '@/api/db'
import { AuthContext } from '@/context/AuthContext'
import { useBusy } from '@/hooks/useBusy'
import ErrorText from '@/components/ui/ErrorText'
import { useRouter } from 'expo-router'
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
	const { state: authState } = useContext(AuthContext)

	const router = useRouter()

	const handleCreatListClick = async () => {
		if (name) {
			startTimedBusy()
			try {
				await addList({ name, auth: authState })
				setReload(true)
			} catch (error) {
				setErrorText(getAPIErrorMessage(error))
				setReload(false)
			}finally {
				stopBusy()
			}
		}
	}

	useEffect(() => {
		if (reload) {
			setErrorText('')
			const listAPI = async () => {
				startTimedBusy()
				try {
					const listResponse = await getLists({ auth: authState })
					if (listResponse.data.data) {
						setLists(listResponse.data.data)
					}
					setReload(false)
				} catch (error) {
					setErrorText(getAPIErrorMessage(error))
					setReload(false)
				} finally {
					stopBusy()
				}
			}
			listAPI()
		}
	}, [reload])


	return <ParallaxScrollView
		headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
		headerImage={
			<Image
				source={require('@/assets/images/wella.png')}
				style={styles.wellaLogo}
			/>
		}
		withTabBar={false}>
		<View style={styles.newListStyle}>
			<Input
				containerStyle={styles.newListInputContainerStyle}
				inputStyle={styles.newListInputStyle}
				placeholder={'New List Name'}
				autoCapitalize={'words'}
				value={name}
				onChangeText={setName}
			/>
			<Button
				style={styles.newListButtonStyle}
				title={'+'}
				onPress={handleCreatListClick}
			/>
		</View>
		<ErrorText message={errorText} />
		{lists.length > 0
			? <FlatList
				data={lists}
				keyExtractor={(list: ListObject) => list._id || list.name}
				renderItem={({ item }) => <ListComponent
					listItem={item}
					setReload={setReload}
					setErrorText={setErrorText}
				/>}
			/>
			: <ThemedText type={'title'}>No lists found.</ThemedText>}
	</ParallaxScrollView>
}

const styles = StyleSheet.create({
	...globalStyles,
	newListStyle: {
		display: 'flex',
		flexDirection: 'row',
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
})