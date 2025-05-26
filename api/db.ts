import axios, { AxiosError } from 'axios'
import { AuthState } from '@/context/AuthContext'

const dbAPI = axios.create({
	baseURL: 'https://2b33-2603-9000-d801-849b-f1a0-67ce-a3ff-42cd.ngrok-free.app',
})

type AuthOptions = {
	email: string,
	password: string
}

type ListOptions = {
	auth: AuthState
	id?: string
}

export const signUp = async (options: AuthOptions) => await dbAPI.post('auth/signup', { ...options })

export const signIn = async (options: AuthOptions) => await dbAPI.post('auth/signin', { ...options })

export const getLists = async (options: ListOptions) => await dbAPI.get(
	'reorder/list/',
	{
		params: options.id ? options.id : null,
		headers: { 'Authorization': 'Bearer ' + options.auth.token },
	},
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