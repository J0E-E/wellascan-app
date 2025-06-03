import { render } from '@testing-library/react-native'
import ErrorText from '@/components/ui/ErrorText'

describe('ErrorTextComponent', () => {
	it('renders error text', () => {
		const errorMessage = 'This is my error message.'

		const { getByTestId } = render(<ErrorText message={errorMessage} />)

		expect(getByTestId('errorText').props.children).toBe(errorMessage)
	})
})
