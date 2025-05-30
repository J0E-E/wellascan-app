export type ProductObject = {
	_id: string
	sku: string
	name: string
	reorderQuantity: number
	listId: string
}

export type ListObject = {
	_id: mongoose.Schema.Types.ObjectId
	userId: mongoose.Schema.Types.ObjectId
	name: string
	productsToReorder: ProductObject[]
}