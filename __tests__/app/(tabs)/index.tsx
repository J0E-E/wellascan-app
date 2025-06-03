import React from 'react'
import { render } from '@testing-library/react-native'
import HomeScreen from '@/app/(tabs)'
import { NavigationContainer } from '@react-navigation/native'

describe('HomeScreen', () => {
	it('matches snapshot', () => {
		const { toJSON } = render(
			<NavigationContainer>
				<HomeScreen />
			</NavigationContainer>,
		)
		expect(toJSON()).toMatchSnapshot()
	})
})
