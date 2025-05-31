import { Dropdown } from 'react-native-element-dropdown'
import { StyleSheet, Text, View } from 'react-native'
import { ListObject } from '@/types'

interface ListDropdownProps {
	lists: ListObject[]
	selectedList: ListObject | undefined
	onChange: (item: any) => void
}

export default function ListDropdown({ lists, selectedList, onChange }: ListDropdownProps) {
	return (
		<View style={styles.dropdownContainerStyle}>
			<Text style={styles.label}>Product List</Text>
			<Dropdown
				style={[styles.dropdown, { width: '100%' }]}
				placeholder={'Select A List'}
				placeholderStyle={styles.placeholderStyle}
				containerStyle={styles.containerStyle}
				itemTextStyle={styles.itemTextStyle}
				itemContainerStyle={styles.itemContainerStyle}
				selectedTextStyle={styles.selectedTextStyle}
				activeColor={'#cc1a1a'}
				data={lists}
				onChange={(item) => onChange(item)}
				value={selectedList}
				labelField={'name'}
				valueField={'_id'}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	placeholderStyle: {
		fontSize: 16,
		color: 'white',
	},
	dropdown: {
		height: 50,
		borderColor: 'gray',
		borderWidth: 0.5,
		borderRadius: 8,
		paddingHorizontal: 8,
		color: 'white',
	},
	containerStyle: {
		backgroundColor: 'black',
		fontWeight: 'bold',
	},
	itemTextStyle: {
		textAlign: 'center',
		color: 'white',
		fontSize: 20,
	},
	itemContainerStyle: {
		backgroundColor: '#332e2e',
	},
	selectedTextStyle: {
		color: 'white',
		textAlign: 'center',
	},
	dropdownContainerStyle: {
		padding: 16,
		width: '75%',
	},
	label: {
		backgroundColor: 'rgb(21, 23, 24)',
		position: 'absolute',
		left: 22,
		top: 8,
		zIndex: 999,
		paddingHorizontal: 8,
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
	},
})
