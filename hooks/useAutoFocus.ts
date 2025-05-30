import { useEffect, useState } from 'react'
import { GestureStateChangeEvent, TapGestureHandlerEventPayload } from 'react-native-gesture-handler'

export const useAutofocus = () => {
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

	useEffect(() => {
		if (isRefreshing) {
			setIsRefreshing(false)
		}
	}, [isRefreshing])

	const onTap = (_event: GestureStateChangeEvent<TapGestureHandlerEventPayload>): void => {
		setIsRefreshing(true)
	}

	return { isRefreshing, onTap }
}