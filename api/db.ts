import axios, { AxiosError } from 'axios'

const dbAPI = axios.create({
	baseURL: 'https://7dcf-2603-9000-d801-849b-5106-b26a-6225-5f66.ngrok-free.app/',
})

type AuthOptions = {
	email: string,
	password: string
}

export const signUp = async (options: AuthOptions) => await dbAPI.post('auth/signup', { ...options })

export const signIn = async (options: AuthOptions) => await dbAPI.post('auth/signin', { ...options })

export const getAPIErrorMessage = (error: unknown) => {
	console.error(error)
	if (axios.isAxiosError(error) && error.response) {
		const data = error.response.data as { error?: string; message?: string };
		return data.error || data.message || 'Something went wrong. Try again.';
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'Something went wrong. Try again.';
}