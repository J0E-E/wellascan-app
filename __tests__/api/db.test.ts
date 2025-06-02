import axios, { AxiosResponse } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import dbAPI, { signUp, signIn, getLists, addList, deleteList, addProduct, adjustProductQuantity, deleteProduct, getAPIError, handleAPIRequest } from '@/api/db'
import { Router } from 'expo-router'
import { ROUTES } from '@/constants/routes'
import { __testHooks } from '@/api/db'

jest.mock('@/context/auth/authSync', () => {
	const mockSetAuthState = jest.fn()
	const mockClearAuthState = jest.fn()
	const mockUnsetAuthFn = jest.fn()
	const mockSetAuthFn = jest.fn()

	return {
		getAuthState: jest.fn(() => ({ token: 'old-token', refreshToken: 'refresh-token' })),
		setAuthState: mockSetAuthState,
		clearAuthState: mockClearAuthState,
		getContextAuthHandlers: () => ({
			unsetAuthFn: mockUnsetAuthFn,
			setAuthFn: mockSetAuthFn,
		}),
	}
})

const mock = new MockAdapter(dbAPI)

// --- Tests ---
describe('API methods', () => {
	afterEach(() => mock.reset())

	it('signs up a new user', async () => {
		const payload = { email: 'test@example.com', password: 'password123' }
		const response = { success: true }
		mock.onPost('auth/signup').reply(200, response)
		const result = await signUp(payload)
		expect(result.data).toEqual(response)
	})

	it('signs in a user', async () => {
		const payload = { email: 'test@example.com', password: 'password123' }
		const response = { token: 'abc', refreshToken: 'def' }
		mock.onPost('auth/signin').reply(200, response)
		const result = await signIn(payload)
		expect(result.data).toEqual(response)
	})

	it('gets lists from the API', async () => {
		const fakeData = [{ _id: '123', name: 'Test List' }]
		mock.onGet('reorder/list/').reply(200, fakeData)
		const result = await getLists()
		expect(result.data).toEqual(fakeData)
	})

	it('adds a list', async () => {
		const response = { success: true }
		mock.onPost('reorder/list/').reply(200, response)
		const result = await addList('Groceries')
		expect(result.data).toEqual(response)
	})

	it('deletes a list', async () => {
		mock.onDelete('reorder/list/123').reply(200)
		const result = await deleteList('123')
		expect(result.status).toBe(200)
	})

	it('adds a product', async () => {
		const response = { success: true }
		mock.onPost('reorder/product/1').reply(200, response)
		const result = await addProduct('1', 'sku123', 'Product Name', 2)
		expect(result.data).toEqual(response)
	})

	it('adjusts quantity (increase)', async () => {
		const response = { success: true }
		mock.onPatch('reorder/product/1').reply(200, response)
		const result = await adjustProductQuantity({ id: '1', type: 'increase' })
		expect(result.data).toEqual(response)
	})

	it('adjusts quantity (set)', async () => {
		const response = { success: true }
		mock.onPatch('reorder/product/1').reply(200, response)
		const result = await adjustProductQuantity({ id: '1', type: 'set', quantity: 5 })
		expect(result.data).toEqual(response)
	})

	it('deletes a product', async () => {
		mock.onDelete('reorder/product/1').reply(200)
		const result = await deleteProduct('1')
		expect(result.status).toBe(200)
	})

	it('injects Authorization header using .set()', async () => {
		const { getAuthState } = require('@/context/auth/authSync')
		getAuthState.mockReturnValue({ token: 'abc123', refreshToken: 'def456' })

		const spy = jest.fn()
		mock.onGet('/secure').reply((config) => {
			const authHeader = config.headers?.Authorization
			spy(authHeader)
			return [200, {}]
		})

		await dbAPI.get('/secure')
		expect(spy).toHaveBeenCalledWith('Bearer abc123')
	})

	it('returns early if no refresh token on 401', async () => {
		const { getAuthState, getContextAuthHandlers, clearAuthState } = require('@/context/auth/authSync')

		getAuthState.mockReturnValue({ token: 'token', refreshToken: null })

		const mockUnset = getContextAuthHandlers().unsetAuthFn as jest.Mock
		const mockClear = clearAuthState as jest.Mock

		mock.onGet('/test401').reply(401)

		await expect(dbAPI.get('/test401')).rejects.toThrow()

		expect(mockUnset).toHaveBeenCalled()
		expect(mockClear).toHaveBeenCalled()
	})

	it('queues additional requests while token is refreshing', async () => {
		const { getAuthState, setAuthState, getContextAuthHandlers } = require('@/context/auth/authSync')

		const mockSet = setAuthState as jest.Mock
		const mockSetFn = getContextAuthHandlers().setAuthFn as jest.Mock

		let resolveRefresh!: () => void
		const refreshPromise = new Promise<void>((resolve) => {
			resolveRefresh = resolve
		})

		getAuthState
			.mockReturnValueOnce({
				token: 'expired-token',
				refreshToken: 'refresh-token',
			}) // 1st call for first request
			.mockReturnValue({ token: 'new-token', refreshToken: 'new-refresh' }) // all future calls

		mock.onGet('/queue-test').replyOnce(401)
		mock.onPost('/auth/refreshtoken').reply(() =>
			refreshPromise.then(() => [
				200,
				{
					data: {
						token: 'new-token',
						refreshToken: 'new-refresh',
					},
				},
			]),
		)
		mock.onGet('/queue-test').reply(200, { ok: true })

		// Start the first request to initiate refresh
		const req1 = dbAPI.get('/queue-test')

		// While refresh is in progress, issue another request — it should get queued
		const req2 = dbAPI.get('/queue-test')

		// Now resolve the token refresh
		resolveRefresh()

		const [res1, res2] = await Promise.all([req1, req2])

		expect(res1.data).toEqual({ ok: true })
		expect(res2.data).toEqual({ ok: true })
		expect(mockSet).toHaveBeenCalledWith({ token: 'new-token', refreshToken: 'new-refresh' })
		expect(mockSetFn).toHaveBeenCalledWith({ token: 'new-token', refreshToken: 'new-refresh' })
	})

	it('retries original request after successful token refresh', async () => {
		const { getAuthState, setAuthState, getContextAuthHandlers } = require('@/context/auth/authSync')

		const mockSet = setAuthState as jest.Mock
		const mockSetFn = getContextAuthHandlers().setAuthFn as jest.Mock

		getAuthState
			.mockReturnValueOnce({ token: 'expired-token', refreshToken: 'refresh-token' })
			.mockReturnValue({ token: 'new-token', refreshToken: 'new-refresh' })

		mock.onGet('/retrytest').replyOnce(401)
		mock.onPost('/auth/refreshtoken').replyOnce(200, {
			data: {
				token: 'new-token',
				refreshToken: 'new-refresh',
			},
		})
		mock.onGet('/retrytest').replyOnce(200, { success: true })

		const response = await dbAPI.get('/retrytest')

		expect(response.data).toEqual({ success: true })
		expect(mockSet).toHaveBeenCalledWith({ token: 'new-token', refreshToken: 'new-refresh' })
		expect(mockSetFn).toHaveBeenCalledWith({ token: 'new-token', refreshToken: 'new-refresh' })
	})

	it('clears auth state if token refresh fails', async () => {
		const { getAuthState, clearAuthState, getContextAuthHandlers } = require('@/context/auth/authSync')

		const mockUnset = getContextAuthHandlers().unsetAuthFn as jest.Mock
		const mockClear = clearAuthState as jest.Mock

		getAuthState.mockReturnValue({ token: 'expired-token', refreshToken: 'bad-refresh' })

		mock.onGet('/shouldfail').replyOnce(401)
		mock.onPost('/auth/refreshtoken').replyOnce(500)

		await expect(dbAPI.get('/shouldfail')).rejects.toBeDefined()

		expect(mockUnset).toHaveBeenCalled()
		expect(mockClear).toHaveBeenCalled()
	})
})

describe('API interceptor queue logic', () => {
	beforeEach(() => {
		mock.reset()
		__testHooks.setIsRefreshing(false)
		__testHooks.flushQueue()
	})

	it('pushes a request to the queue when isRefreshing is true', async () => {
		const { getAuthState } = require('@/context/auth/authSync')

		getAuthState.mockReturnValue({
			token: 'expired-token',
			refreshToken: 'refresh-token',
		})

		// First call responds with 401 (so it triggers the interceptor retry logic)
		mock.onGet('/queued-path').replyOnce(401)

		// Second call (retry) returns 200 after token refresh
		mock.onGet('/queued-path').reply(200, { ok: true })

		// Keep isRefreshing true to queue the request instead of refreshing
		__testHooks.setIsRefreshing(true)

		const req = dbAPI.get('/queued-path')

		// Wait a tick to allow request to enter queue
		await new Promise((res) => setImmediate(res))

		// Now simulate the refresh completing
		__testHooks.setIsRefreshing(false)
		__testHooks.flushQueue()

		const res = await req

		expect(res.data).toEqual({ ok: true })
	})
})

describe('handleAPIRequest', () => {
	it('returns data on success', async () => {
		const mockResponse: AxiosResponse<{ success: boolean }> = {
			data: { success: true },
			status: 200,
			statusText: 'OK',
			headers: {},
			config: { headers: new axios.AxiosHeaders() },
		}
		const result = await handleAPIRequest({ request: () => Promise.resolve(mockResponse) })
		expect(result).toEqual({ success: true })
	})

	it('calls onErrorMessage and redirects to login on 401', async () => {
		const router: Router = {
			replace: jest.fn(),
			back: jest.fn(),
			canGoBack: jest.fn(),
			push: jest.fn(),
			prefetch: jest.fn(),
			navigate: jest.fn(),
			reload: jest.fn(),
		} as unknown as Router

		const spy = jest.fn()
		const axiosError = {
			isAxiosError: true,
			response: { status: 401, data: { message: 'Unauthorized' } },
		}
		const result = await handleAPIRequest({
			request: () => Promise.reject(axiosError),
			onErrorMessage: spy,
			router,
		})
		expect(spy).toHaveBeenCalledWith('Unauthorized')
		expect(router.replace).toHaveBeenCalledWith(ROUTES.LOGIN)
		expect(result).toBeNull()
	})

	it('calls onErrorMessage with generic error', async () => {
		const spy = jest.fn()
		const result = await handleAPIRequest({ request: () => Promise.reject(new Error('Oops')), onErrorMessage: spy })
		expect(spy).toHaveBeenCalledWith('Oops')
		expect(result).toBeNull()
	})
})

describe('getAPIError', () => {
	it('handles axios error with message', () => {
		const error = getAPIError({ isAxiosError: true, response: { status: 401, data: { message: 'Unauthorized' } } })
		expect(error).toEqual({ message: 'Unauthorized', shouldLogOut: true })
	})

	it('handles native Error', () => {
		const error = getAPIError(new Error('Failure'))
		expect(error).toEqual({ message: 'Failure', shouldLogOut: false })
	})

	it('handles unknown error shape', () => {
		const error = getAPIError('weird')
		expect(error).toEqual({ message: 'Something went wrong. Try again.', shouldLogOut: false })
	})
})
