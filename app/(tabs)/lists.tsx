import { Text, StyleSheet, View } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Image } from 'expo-image'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import globalStyles from '@/styles/global'
import { useContext, useEffect, useState } from 'react'
import { ThemedText } from '@/components/ThemedText'
import { getAPIErrorMessage, getLists } from '@/api/db'
import { AuthContext } from '@/context/AuthContext'
import { useBusy } from '@/hooks/useBusy'
import ErrorText from '@/components/ui/ErrorText'
import { useRouter } from 'expo-router'

export default function ListsScreen() {
	const { startTimedBusy, stopBusy } = useBusy()
	const [errorText, setErrorText] = useState('')
	const [lists, setLists] = useState([])
	const [reload, setReload] = useState(false)
	const { state: authState } = useContext(AuthContext)

	const router = useRouter()

	useEffect(() => {

		if ((!lists || lists.length === 0) && !reload) {
			const listAPI = async () => {
				startTimedBusy()
				try {
					const listResponse = await getLists({ auth: authState })
					if (listResponse.data.data) {
						setLists(listResponse.data.data)
					}
				} catch (error) {
					setErrorText(getAPIErrorMessage(error))
				} finally {
					stopBusy()
				}
			}
			listAPI()
		}
	}, [])


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
			/>
			<Button
				style={styles.newListButtonStyle}
				title={'+'}
			/>
		</View>
		{lists.length > 0 ? <ThemedText>Lists found.</ThemedText> : <ThemedText>No lists found.</ThemedText>}
		<ErrorText message={errorText}/>
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