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
