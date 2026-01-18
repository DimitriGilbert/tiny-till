/**
 * Represents a tally item (product in cart).
 *
 * @interface TallyItem
 *
 * @property {string} productId - UUID v4 identifier of the product
 * @property {number} quantity - Quantity of the product (always positive integer)
 * @property {number} price - Price in integer cents (snapshot at time of add, e.g., 1050 = $10.50)
 *
 * @example
 * const tallyItem: TallyItem = {
 *   productId: '123e4567-e89b-12d3-a456-426614174000',
 *   quantity: 3,
 *   price: 450
 * }
 */
export interface TallyItem {
  productId: string
  quantity: number
  price: number
}

export type TallyState = Map<string, TallyItem>

export type TallyEntry = [string, TallyItem]

export interface TallySummary {
  total: number
  itemCount: number
  productCount: number
}
