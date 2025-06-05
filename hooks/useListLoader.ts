import { useEffect, useState } from 'react'
import { ListObject } from '@/types'
import { useBusy } from '@/hooks/useBusy'
import { getLists, handleAPIRequest } from '@/api/db'
import { router } from 'expo-router'

type ListLoaderReturns = {
	lists: ListObject[]
	getLists: () => void
	list: ListObject | null
	getList: (id: string) => void
	listLoaderError: string
}

/**
 * A custom hook that manages the loading and state of lists.
 *
 * This hook provides functionality to load a list of items, update the selected list,
 * and manage busy states during operations. It maintains the state for the collections
 * of lists, the currently selected list, and the ID of a list to be loaded.
 *
 * @returns {Object} An object containing the following:
 * - `lists` {Array} - The array of loaded lists.
 * - `getLists` {Function} - A function to trigger reloading of lists. Accepts a boolean value to indicate whether to reload the lists.
 * - `list` {Object|null} - The currently selected list, or null if no list is selected.
 * - `getList` {Function} - A function to set the ID of the desired list to be selected, based on its ID.
 */
export const useListLoader = (): ListLoaderReturns => {
	const { startTimedBusy, stopBusy } = useBusy()
	const [reloadLists, setReloadLists] = useState<boolean>(false)
	const [lists, setLists] = useState<ListObject[]>([])
	const [selectedList, setSelectedList] = useState<ListObject | null>(null)
	const [listId, setListId] = useState<string>('')
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		setErrorMessage('')
		if (!reloadLists) return
		;(async () => {
			startTimedBusy()
			const getListResponse = await handleAPIRequest({
				request: getLists,
				onErrorMessage: (message) => {
					setErrorMessage(message)
				},
				router,
			})
			if (getListResponse?.data) {
				setLists(getListResponse.data)
			} else {
				setErrorMessage('No lists returned from server.')
			}
			setReloadLists(false)
			stopBusy()
		})()
	}, [reloadLists])

	useEffect(() => {
		if (listId && lists.length > 0) {
			const foundList = lists.find((list: ListObject) => list._id === listId)
			if (foundList) {
				setSelectedList(foundList)
			}
		}
	}, [lists, listId])

	return {
		lists,
		getLists: () => {
			setReloadLists(true)
		},
		list: selectedList,
		getList: (id: string) => {
			console.log(id)
			setListId(id)
		},
		listLoaderError: errorMessage,
	}
}
