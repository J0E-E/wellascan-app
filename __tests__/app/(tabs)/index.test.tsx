import React from 'react'
import { render } from '@testing-library/react-native'
import HomeScreen from '@/app/(tabs)'

// Mock Bottom Tab Height
jest.mock('@react-navigation/bottom-tabs', () => ({
	useBottomTabBarHeight: () => 50,
}))

// ParralaxScrollView is not compatable with snapshots. Too Complex.
jest.mock('@/components/ParallaxScrollView', () => {
	const { View } = require('react-native')
	return ({ children }: { children: React.ReactNode }) => <View>{children}</View>
})

// Mock expo-image
jest.mock('expo-image', () => {
	const { View } = require('react-native')
	return {
		Image: View,
	}
})

describe('HomeScreen', () => {
	it('renders and matches snapshot (safe subset)', () => {
		const { toJSON } = render(<HomeScreen />)

		// SAFER than snapshotting container or screen.toJSON() when errors occur
		expect(toJSON()).toMatchSnapshot()
	})
})
