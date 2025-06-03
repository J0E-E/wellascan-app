import { AuthContext } from '@/context/auth/AuthContext'
import { BusyProvider } from '@/context/busy/BusyContext'
import { ListObject } from '@/types'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import ListsScreen from '@/app/(tabs)/lists'
import * as db from '@/api/db'
import { NavigationContainer } from '@react-navigation/native'

jest.mock('@/api/db', () => ({
	__esModule: true,
	addList: jest.fn(),
	getLists: jest.fn(),
	handleAPIRequest: jest.fn(),
}))

const mockPush = jest.fn()
const mockSetParams = jest.fn()

jest.mock('expo-router', () => {
	return {
		__esModule: true,
		useRouter: () => ({
			replace: jest.fn(),
			navigate: jest.fn(),
			push: mockPush,
			setParams: mockSetParams,
		}),
		useFocusEffect: (cb: any) => {
			const React = require('react')
			React.useEffect(cb, [])
		},
	}
})

describe('ListsScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		;(db.handleAPIRequest as jest.Mock).mockReset()
	})

	const noListsResponse: { data: ListObject[] } = { data: [] }

	const listName = 'New List'
	const listName2 = 'List 1'
	const listId = '12345'
	const addListResponse: ListObject = { _id: listId, name: listName, productsToReorder: [], userId: '098765' }

	const listResponse: { data: ListObject[] } = {
		data: [
			{ _id: listId, name: listName, productsToReorder: [], userId: '098765' },
			{ _id: '2', name: listName2, productsToReorder: [], userId: '098765' },
		],
	}

	const renderScreen = () =>
		render(
			<NavigationContainer>
				<AuthContext.Provider
					value={{
						state: { token: 'test-token', refreshToken: 'test-refresh' },
						setAuth: jest.fn(),
						unsetAuth: jest.fn(),
					}}
				>
					<BusyProvider>
						<ListsScreen />
					</BusyProvider>
				</AuthContext.Provider>
			</NavigationContainer>,
		)

	it('renders list screen when no lists returned', async () => {
		;(db.handleAPIRequest as jest.Mock).mockResolvedValue(noListsResponse)

		const { getByText } = renderScreen()

		await waitFor(() => {
			expect(db.handleAPIRequest).toHaveBeenCalled()
			expect(getByText('No lists found.')).toBeTruthy()
		})
	})

	it('renders multiple lists when returned', async () => {
		;(db.handleAPIRequest as jest.Mock).mockResolvedValue(listResponse)

		const { getByText } = renderScreen()

		await waitFor(() => {
			expect(getByText(listName)).toBeTruthy()
			expect(getByText(listName2)).toBeTruthy()
		})
	})

	it('shows error text when no list name entered', async () => {
		;(db.handleAPIRequest as jest.Mock).mockResolvedValue(noListsResponse)

		const { getByTestId } = renderScreen()

		fireEvent.press(getByTestId('createListButton'))

		await waitFor(() => {
			expect(db.handleAPIRequest).toHaveBeenCalled()
			expect(getByTestId('errorText').props.children).toBe('Please enter a New List Name')
		})
	})

	it('adds a new list', async () => {
		;(db.getLists as jest.Mock).mockResolvedValue(listResponse)
		;(db.addList as jest.Mock).mockResolvedValue(addListResponse)
		;(db.handleAPIRequest as jest.Mock)
			// First call: addList
			.mockImplementationOnce(({ request }) => request())
			// Second call: getLists
			.mockImplementationOnce(({ request }) => request())

		const { getByTestId, findByTestId } = renderScreen()

		fireEvent.changeText(getByTestId('newListInput'), listName)
		fireEvent.press(getByTestId('createListButton'))

		// Wait for new list to appear
		const listComponent = await findByTestId(`listComponent-${listId}`)
		expect(listComponent).toBeTruthy()
	})

	it('navigates to detail screen with correct list id on press', async () => {
		;(db.handleAPIRequest as jest.Mock).mockResolvedValue(listResponse)

		const { getByTestId } = renderScreen()

		// Wait for the list to render
		await waitFor(() => {
			expect(getByTestId(`listComponent-${listId}`)).toBeTruthy()
		})

		fireEvent.press(getByTestId(`listComponentPressable-${listId}`))

		expect(mockSetParams).toHaveBeenCalledWith({ listName })
		expect(mockPush).toHaveBeenCalledWith(`/list/${listId}`)
	})
})
