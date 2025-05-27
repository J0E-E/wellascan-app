import axios, { AxiosError } from 'axios'
import { AuthState } from '@/context/AuthContext'

const dbAPI = axios.create({
	baseURL: 'https://feb1-2603-9000-d801-849b-7993-adb9-1043-50f2.ngrok-free.app',
})

type AuthOptions = {
	email: string,
	password: string
}

const setAuthHeader = (options: { auth: AuthState }) => {
	return { 'Authorization': 'Bearer ' + options.auth.token }
}

export const signUp = async (options: AuthOptions) => await dbAPI.post('auth/signup', { ...options })

export const signIn = async (options: AuthOptions) => await dbAPI.post('auth/signin', { ...options })

export const getLists = async (options: { id?: string, auth: AuthState }) => await dbAPI.get(
	'reorder/list/',
	{
		params: options.id ? { id: options.id } : {},
		headers: setAuthHeader(options),
	},
)

export const addList = async (options: { name: string, auth: AuthState }) => await dbAPI.post(
	'reorder/list/',
	{ name: options.name },
	{ headers: setAuthHeader(options) },
)


export const deleteList = async (options: { id: string, auth: AuthState }) => await dbAPI.delete(
	`reorder/list/${options.id}`,
	{ headers: setAuthHeader(options) },
)

export const getAPIErrorMessage = (error: unknown) => {
	console.error(error)
	if (axios.isAxiosError(error) && error.response) {
		const data = error.response.data as { error?: string; message?: string }
		return data.error || data.message || 'Something went wrong. Try again.'
	}

	if (error instanceof Error) {
		return error.message
	}

	return 'Something went wrong. Try again.'
}