export const ROUTES = {
	LOGIN: '/login',
	TABS: '/(tabs)',
	LISTS: '/lists',
	BARCODE: '/(tabs)/barcode',
	LIST_DETAIL: (id: string): `/list/${string}` => `/list/${id}`,
	ADD_TO_CART: (id: string): `/list/${string}/addtocart` => `/list/${id}/addtocart`,
} as const
