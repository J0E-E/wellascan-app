import axios, { AxiosResponse, HttpStatusCode } from 'axios'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'

import { clearAuthState, getAuthState, getContextAuthHandlers, setAuthState } from '@/context/auth/authSync'
import { ROUTES } from '@/constants/routes'

const { setAuthFn, unsetAuthFn } = getContextAuthHandlers()

const dbAPI = axios.create({
	baseURL: Constants.expoConfig?.extra?.API_BASE_URL,
})

let isRefreshing = false
let failedQueue: (() => void)[] = []

export const __testHooks = {
	setIsRefreshing: (val: boolean) => {
		isRefreshing = val
	},
	flushQueue: () => {
		const queue = [...failedQueue]
		failedQueue = []
		queue.forEach((cb) => cb())
	},
}

dbAPI.interceptors.request.use((config) => {
	const auth = getAuthState()

	if (auth?.token) {
		if (config.headers && typeof (config.headers as any).set === 'function') {
			;(config.headers as any).set('Authorization', `Bearer ${auth.token}`)
		}
	}

	return config
})

dbAPI.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			const currentAuth = getAuthState()
			if (!currentAuth?.refreshToken) {
				unsetAuthFn?.()
				clearAuthState()
				return Promise.reject(error)
			}

			if (!isRefreshing) {
				isRefreshing = true
				try {
					const response = await dbAPI.post('/auth/refreshtoken', {
						refreshToken: currentAuth.refreshToken,
					})

					const newTokens = response.data.data
					setAuthFn?.({ token: newTokens.token, refreshToken: newTokens.refreshToken })
					setAuthState({ token: newTokens.token, refreshToken: newTokens.refreshToken })

					isRefreshing = false
					failedQueue.forEach((callback) => callback())
					failedQueue = []

					return dbAPI(originalRequest)
				} catch (error) {
					isRefreshing = false
					failedQueue = []
					unsetAuthFn?.()
					clearAuthState()
					return Promise.reject(error)
				}
			}

			return new Promise((resolve) => {
				failedQueue.push(() => {
					resolve(dbAPI(originalRequest))
				})
			})
		}

		return Promise.reject(error)
	},
)

export const signUp = async (options: { email: string; password: string }) => await dbAPI.post('auth/signup', options)

export const signIn = async (options: { email: string; password: string }) => await dbAPI.post('auth/signin', options)

export const getLists = async (id?: string) => await dbAPI.get(`reorder/list/${id || ''}`)

export const addList = async (name: string) => await dbAPI.post('reorder/list/', { name })

export const deleteList = async (id: string) => await dbAPI.delete(`reorder/list/${id}`)

export const addProduct = async (listId: string, sku: string, name: string, quantity: number = 1) =>
	await dbAPI.post(`reorder/product/${listId}`, { sku, name, quantity })

type AdjustQuantityParams =
	| { id: string; type: 'increase' | 'decrease' }
	| {
			id: string
			type: 'set'
			quantity: number
	  }

export const adjustProductQuantity = async (params: AdjustQuantityParams) => {
	if (params.type === 'set') {
		const { id, type, quantity } = params
		return await dbAPI.patch(`reorder/product/${id}`, { type, quantity })
	} else {
		const { id, type } = params
		return await dbAPI.patch(`reorder/product/${id}`, { type })
	}
}

export const deleteProduct = async (id: string) => {
	return await dbAPI.delete(`reorder/product/${id}`)
}

export type APIError = {
	message: string
	shouldLogOut: boolean
}

export const getAPIError = (error: unknown): APIError => {
	if (axios.isAxiosError(error) && error.response) {
		const data = error.response.data as { error?: string; message?: string }
		const isUnauthorized = error.response.status === HttpStatusCode.Unauthorized
		return {
			message: data.error || data.message || 'Something went wrong. Try again.',
			shouldLogOut: isUnauthorized,
		}
	}

	if (error instanceof Error) {
		return { message: error.message, shouldLogOut: false }
	}

	return { message: 'Something went wrong. Try again.', shouldLogOut: false }
}

export type APIHandlerOptions<T> = {
	request: () => Promise<T>
	onErrorMessage?: (message: string) => void
	router?: ReturnType<typeof useRouter>
}

export const handleAPIRequest = async <T>({ request, onErrorMessage, router }: APIHandlerOptions<AxiosResponse<T>>): Promise<T | null> => {
	try {
		onErrorMessage?.('')
		const response = await request()
		return response.data
	} catch (error) {
		const parsed = getAPIError(error)
		if (parsed.shouldLogOut) {
			unsetAuthFn?.()
			clearAuthState()
			router?.replace(ROUTES.LOGIN)
		}
		onErrorMessage?.(parsed.message)
		return null
	}
}

export default dbAPI
