import type { PropsWithChildren, ReactElement } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset,
} from 'react-native-reanimated'

import { ThemedView } from '@/components/ThemedView'
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground'
import { useColorScheme } from '@/hooks/useColorScheme'

const HEADER_HEIGHT = 250
const screenHeight = Dimensions.get('window').height

type Props = PropsWithChildren<{
	headerImage: ReactElement;
	headerBackgroundColor: { dark: string; light: string };
	withTabBar?: boolean
}>;

export default function ParallaxScrollView(
	{
		children,
		headerImage,
		headerBackgroundColor,
		withTabBar = true,
	}: Props) {

	const colorScheme = useColorScheme() ?? 'light'
	const scrollRef = useAnimatedRef<Animated.ScrollView>()
	const scrollOffset = useScrollViewOffset(scrollRef)
	const bottom = withTabBar ? useBottomTabOverflow() : 0
	const headerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
						[-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
					),
				},
				{
					scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
				},
			],
		}
	})

	return (
		<ThemedView style={styles.container}>
			<Animated.ScrollView
				ref={scrollRef}
				scrollEventThrottle={16}
				scrollIndicatorInsets={{ bottom }}
				contentContainerStyle={{ paddingBottom: bottom }}
			>
				<View style={styles.contentContainerStyle}>
					<Animated.View
						style={[
							styles.header,
							{ backgroundColor: headerBackgroundColor[colorScheme] },
							headerAnimatedStyle,
						]}>
						{headerImage}
					</Animated.View>
					<ThemedView style={styles.content}>{children}</ThemedView>
				</View>
			</Animated.ScrollView>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainerStyle: {
		height: screenHeight - 90,
	},
	header: {
		height: HEADER_HEIGHT,
		overflow: 'hidden',
	},
	content: {
		flex: 1,
		padding: 15,
		gap: 16,
		overflow: 'hidden',
		flexDirection: 'column',
	},
})
