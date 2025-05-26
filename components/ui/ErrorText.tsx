import { Text, StyleSheet } from 'react-native'

export default function ErrorText({ message }: { message: string }) {
	return (message ? <Text style={styles.errorTextStyle}>{message}</Text> : null)
}

const styles = StyleSheet.create({
	errorTextStyle: {
		color: '#ff0000',
		textAlign: 'center',
		fontSize: 18,
	},
})