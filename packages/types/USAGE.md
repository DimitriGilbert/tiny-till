# Tiny-Till Types Usage Guide

This guide demonstrates common usage patterns for the Tiny-Till type system, including product data models, validation, state management, and storage operations.

## Table of Contents

- [Product Data Model](#product-data-model)
- [UUID Utilities](#uuid-utilities)
- [Currency Utilities](#currency-utilities)
- [Type Guards](#type-guards)
- [Zod Validation](#zod-validation)
- [Data Consistency](#data-consistency)
- [State Management](#state-management)
- [Storage Operations](#storage-operations)

## Product Data Model

### Creating a Product

```typescript
import type { Product, ProductInput } from '@tiny-till/types'
import { generateUUID } from '@tiny-till/types'

const now = Date.now()

const product: Product = {
  id: generateUUID(),
  name: 'Coffee',
  price: 450, // $4.50 in cents
  imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
  createdAt: now,
  updatedAt: now,
}
```

### Creating Product Input

```typescript
import type { ProductInput } from '@tiny-till/types'

const productInput: ProductInput = {
  name: 'Bread',
  price: 250, // $2.50
  imageData: undefined, // Optional
}

// Add to store (auto-generates id, timestamps)
catalogStore.addProduct(productInput)
```

### Updating a Product

```typescript
import type { ProductUpdate } from '@tiny-till/types'

const updates: ProductUpdate = {
  name: 'Artisan Bread',
  price: 350, // Update to $3.50
}

catalogStore.updateProduct('uuid-here', updates)
```

## UUID Utilities

### Generating UUIDs

```typescript
import { generateUUID } from '@tiny-till/types'

const productId = generateUUID()
console.log(productId) // '550e8400-e29b-41d4-a716-446655440000'
```

### Validating UUIDs

```typescript
import { isValidUUID } from '@tiny-till/types'

const id = '550e8400-e29b-41d4-a716-446655440000'

if (isValidUUID(id)) {
  console.log('Valid UUID v4')
} else {
  console.log('Invalid UUID')
}
```

### Type Guard Usage

```typescript
function processProductId(id: unknown): string {
  if (isValidUUID(id)) {
    return id // TypeScript knows this is a string
  }
  throw new Error('Invalid product ID')
}
```

## Currency Utilities

### Converting Dollars to Cents

```typescript
import { toCents } from '@tiny-till/types'

const dollars = 10.50
const cents = toCents(dollars)
console.log(cents) // 1050
```

### Converting Cents to Dollars

```typescript
import { toDollars } from '@tiny-till/types'

const cents = 1050
const dollars = toDollars(cents)
console.log(dollars) // 10.50
```

### Formatting Prices for Display

```typescript
import { formatPrice } from '@tiny-till/types'

const cents = 1050
const formatted = formatPrice(cents)
console.log(formatted) // '$10.50'

// With different locale
const formattedGBP = formatPrice(cents, 'en-GB')
console.log(formattedGBP) // '£10.50'
```

### Parsing Price Strings

```typescript
import { parsePrice } from '@tiny-till/types'

const price1 = parsePrice('$10.50')
console.log(price1) // 1050

const price2 = parsePrice('$1,234.56')
console.log(price2) // 123456

const price3 = parsePrice('10')
console.log(price3) // 1000
```

### Handling Price Input

```typescript
import { toCents, parsePrice } from '@tiny-till/types'

// From user input string
const userInput = '$5.99'
const price = parsePrice(userInput)

// Direct number input (with rounding)
const price2 = toCents(5.995) // Rounds to 600
```

## Type Guards

### Checking Product Validity

```typescript
import { isProduct } from '@tiny-till/types'

const data = JSON.parse(jsonString)

if (isProduct(data)) {
  console.log(data.name) // TypeScript knows this is Product
  console.log(data.price) // TypeScript knows this is number
}
```

### Validating Product Input

```typescript
import { isProductInput } from '@tiny-till/types'

const formData = {
  name: 'Coffee',
  price: 450,
  imageData: 'data:image/jpeg;base64,...',
}

if (isProductInput(formData)) {
  catalogStore.addProduct(formData)
} else {
  console.error('Invalid product input')
}
```

### Field Validation

```typescript
import { isValidPrice, isValidProductName, isValidImageData } from '@tiny-till/types'

const price = 450
const name = 'Coffee'
const imageData = 'data:image/jpeg;base64,...'

console.log(isValidPrice(price)) // true
console.log(isValidProductName(name)) // true
console.log(isValidImageData(imageData)) // true
```

### Comprehensive Validation

```typescript
import { validateProduct } from '@tiny-till/types'

const result = validateProduct({ name: '', price: -50 })

if (!result.isValid) {
  console.error('Validation errors:', result.errors)
  // Output: ['Name is required', 'Price must be positive']
}
```

## Zod Validation

### Using Product Schema

```typescript
import { productSchema } from '@tiny-till/types'

const product = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Coffee',
  price: 450,
  imageData: 'data:image/jpeg;base64,...',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const result = productSchema.safeParse(product)

if (result.success) {
  console.log('Valid product:', result.data)
} else {
  console.error('Validation errors:', result.error.errors)
}
```

### Using Product Input Schema

```typescript
import { productInputSchema } from '@tiny-till/types'

const input = {
  name: 'Coffee',
  price: 450,
  imageData: 'data:image/jpeg;base64,...',
}

const result = productInputSchema.safeParse(input)

if (result.success) {
  catalogStore.addProduct(result.data)
}
```

## Data Consistency

### Checking Timestamp Consistency

```typescript
import { checkTimestampConsistency } from '@tiny-till/types'

const product = {
  id: 'uuid',
  name: 'Coffee',
  price: 450,
  createdAt: 1640995200000,
  updatedAt: 1640995300000,
}

if (!checkTimestampConsistency(product)) {
  console.warn('Timestamp inconsistency detected')
}
```

### Checking Product Integrity

```typescript
import { checkProductIntegrity } from '@tiny-till/types'

const result = checkProductIntegrity(product)

if (!result.isValid) {
  console.error('Integrity issues:', result.errors)
}
```

### Validating Product Lists

```typescript
import { validateProductList } from '@tiny-till/types'

const products = [product1, product2, product3]

const result = validateProductList(products, { checkUniqueNames: true })

if (!result.isValid) {
  console.error('Invalid products at indices:', result.invalidIndices)
  console.error('Errors:', result.errors)
}
```

### Detecting Data Anomalies

```typescript
import { detectDataAnomalies } from '@tiny-till/types'

const anomalies = detectDataAnomalies(products)

anomalies.forEach((anomaly) => {
  console.warn(`${anomaly.type}: ${anomaly.message}`)
  // Output: "high_price: Price exceeds $10000"
  //         "missing_image: Product has no image data"
})
```

### Generating Checksums

```typescript
import { generateProductChecksum } from '@tiny-till/types'

const checksum = generateProductChecksum(product)

// Later verification
if (generateProductChecksum(product) !== checksum) {
  console.warn('Product data may have been modified')
}
```

## State Management

### Using the Catalog Store

```typescript
import { useCatalogStore } from '@/stores/catalog-store'

// In a component
function ProductManager() {
  const products = useCatalogStore((state) => state.products)
  const addProduct = useCatalogStore((state) => state.addProduct)
  const updateProduct = useCatalogStore((state) => state.updateProduct)
  const deleteProduct = useCatalogStore((state) => state.deleteProduct)

  const handleAddProduct = () => {
    addProduct({
      name: 'New Product',
      price: 500,
      imageData: undefined,
    })
  }

  return <div>...</div>
}
```

### Getting a Single Product

```typescript
const getProduct = useCatalogStore((state) => state.getProduct)

const product = getProduct('product-uuid-here')
if (product) {
  console.log(product.name)
}
```

### Handling Errors

```typescript
function CatalogManager() {
  const error = useCatalogStore((state) => state.error)
  const clearError = useCatalogStore((state) => state.clearError)

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={clearError}>Dismiss</button>
      </div>
    )
  }

  return <div>...</div>
}
```

### Checking Hydration Status

```typescript
function App() {
  const hasHydrated = useCatalogStore((state) => state.hasHydrated)

  if (!hasHydrated) {
    return <div>Loading catalog...</div>
  }

  return <MainApp />
}
```

## Storage Operations

### Getting Storage Info

```typescript
import { getStorageInfo } from '@/lib/storage'

async function checkStorage() {
  const info = await getStorageInfo()

  if (info) {
    console.log(`Used: ${info.quotaUsed} bytes`)
    console.log(`Limit: ${info.quotaLimit} bytes`)
    console.log(`Percentage: ${info.percentage}%`)

    if (info.isNearLimit) {
      console.warn('Approaching storage limit!')
    }
  }
}
```

### Custom Storage Operations

```typescript
import { safeGet, safeSet, safeDelete } from '@/lib/storage'

// Get a value
const value = await safeGet<string>('my-key')
if (value !== undefined) {
  console.log('Retrieved:', value)
}

// Set a value
const success = await safeSet('my-key', 'my-value')
if (success) {
  console.log('Stored successfully')
}

// Delete a value
const deleted = await safeDelete('my-key')
```

### Handling Storage Errors

```typescript
import { safeSet } from '@/lib/storage'

try {
  await safeSet('large-data', hugeImageBlob)
} catch (error) {
  if (error instanceof Error) {
    console.error('Storage failed:', error.message)
    // Handle quota exceeded
  }
}
```

## Complete Workflow Example

Here's a complete example showing the full product lifecycle:

```typescript
import { generateUUID, toCents, formatPrice } from '@tiny-till/types'
import { validateProduct } from '@tiny-till/types'
import { useCatalogStore } from '@/stores/catalog-store'

function createAndValidateProduct(name: string, priceDollars: number) {
  // Convert price to cents
  const price = toCents(priceDollars)

  // Create product input
  const productInput = {
    name,
    price,
  }

  // Validate input
  const validationResult = validateProduct({
    ...productInput,
    id: generateUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  if (!validationResult.isValid) {
    console.error('Validation failed:', validationResult.errors)
    return
  }

  // Add to store
  const addProduct = useCatalogStore.getState().addProduct
  addProduct(productInput)

  console.log(`Product "${name}" added with price ${formatPrice(price)}`)
}

// Usage
createAndValidateProduct('Coffee', 4.50)
// Output: Product "Coffee" added with price $4.50
```

## Best Practices

1. **Always store prices as cents** to avoid floating-point errors
2. **Use type guards** when validating data from external sources
3. **Validate user input** with Zod schemas before state updates
4. **Check storage quota** before storing large image data
5. **Use generateUUID()** for all new product IDs
6. **Handle hydration** before rendering product-dependent UI
7. **Check timestamp consistency** after importing data
8. **Use formatPrice()** for all price displays
9. **Use toCents()** for all price inputs/calculations
10. **Validate images** are within 128×128px before storage
