import { Stack } from 'expo-router';

export default function ListLayout() {
	return <Stack>
		<Stack.Screen
			name={'[id]'}
			options={{
				headerShown: false,
				title: 'List View'
			}}
		/>
		<Stack.Screen name="[id]/addtocart" options={{ title: "Add to Cart" }} />
	</Stack>;
}