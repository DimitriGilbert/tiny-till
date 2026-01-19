interface TallyItem {
  productId: string;
  quantity: number;
  price: number;
}

export function createTallyItem(overrides?: Partial<TallyItem>) {
  return {
    productId: crypto.randomUUID(),
    quantity: 1,
    price: 1000,
    ...overrides,
  };
}

export function createTallyItemWithQuantity(quantity: number) {
  return createTallyItem({ quantity });
}

export function createTallyItemWithPrice(price: number) {
  return createTallyItem({ price });
}

export function createMultipleTallyItems(count: number, baseOptions?: Partial<TallyItem>) {
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push(createTallyItem({
      productId: crypto.randomUUID(),
      quantity: baseOptions?.quantity || 1,
      price: baseOptions?.price || (i + 1) * 1000,
    }));
  }

  return items;
}

export function createEmptyTally(): TallyItem[] {
  return [];
}

export function createSingleItemTally(): TallyItem[] {
  return [createTallyItem()];
}

export function createLargeTally(count: number = 100): TallyItem[] {
  return createMultipleTallyItems(count);
}

export function createTallyWithZeroQuantity(): TallyItem[] {
  return [createTallyItem({ quantity: 0 })];
}

export function createTallyWithHighQuantity(quantity: number = 1000): TallyItem[] {
  return [createTallyItem({ quantity })];
}

export function createTallyForProducts(productIds: string[]): TallyItem[] {
  return productIds.map((productId, index) => createTallyItem({
    productId,
    quantity: 1,
    price: (index + 1) * 1000,
  }));
}

export function calculateTotal(tallyItems: TallyItem[]): number {
  return tallyItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateItemCount(tallyItems: TallyItem[]): number {
  return tallyItems.reduce((sum, item) => sum + item.quantity, 0);
}
