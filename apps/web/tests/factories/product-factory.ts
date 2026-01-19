import { createTestProduct } from "../utils/test-storage";

interface ProductOptions {
  name?: string;
  price?: number;
  imageData?: string;
}

export function createProduct(overrides?: ProductOptions) {
  return {
    id: crypto.randomUUID(),
    name: "Test Product",
    price: 1000,
    imageData: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function createProductWithName(name: string) {
  return createProduct({ name });
}

export function createProductWithPrice(price: number) {
  return createProduct({ price });
}

export function createProductWithImage(imageData: string) {
  return createProduct({ imageData });
}

export function createMultipleProducts(count: number, baseOptions?: ProductOptions) {
  const products = [];

  for (let i = 0; i < count; i++) {
    products.push(createProduct({
      name: baseOptions?.name || `Product ${i + 1}`,
      price: baseOptions?.price || (i + 1) * 1000,
      imageData: baseOptions?.imageData,
    }));
  }

  return products;
}

export function createProductsList(names: string[]) {
  return names.map((name, index) => createProduct({
    name,
    price: (index + 1) * 1000,
  }));
}

export function createProductWithMinimumPrice() {
  return createProduct({ price: 1 });
}

export function createProductWithMaximumPrice() {
  return createProduct({ price: 99999999 });
}

export function createProductWithDecimalPrice(price: number) {
  return createProduct({ price: Math.round(price * 100) });
}

export function createProductWithLongName(length: number = 50) {
  const name = "A".repeat(length);
  return createProduct({ name });
}
