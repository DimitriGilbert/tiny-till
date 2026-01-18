# Validation Documentation

## Overview

This directory contains Zod validation schemas for all Tiny-Till entities. These schemas ensure data integrity across the application by validating inputs before storage and processing.

## Available Validation Schemas

### Product Validation

**File:** `product.ts`

#### Schemas

- **`productSchema`**: Validates complete Product objects
- **`productInputSchema`**: Validates product creation inputs (name, price, imageData)
- **`productUpdateSchema`**: Validates partial product updates
- **`productListSchema`**: Validates arrays of products
- **`productBusinessLogicSchema`**: Validates business rules for products
  - Name character restrictions (alphanumeric, spaces, and basic punctuation)
  - No leading/trailing whitespace
  - Price format rules (cents-based, with special rules for high-value items)
- **`imageValidationSchema`**: Validates image data URLs
  - Valid MIME types: PNG, JPEG, WebP
  - Size limit: 128×128 pixels (enforced via base64 length)
- **`priceValidationSchema`**: Validates price values
  - Must be integer cents
  - Minimum: 1 cent
  - Maximum: $999,999.99
  - Special rule for high-value items (>$1000)
- **`crossFieldValidationSchema`**: Validates relationships between fields
  - Items above $100 should include images
  - Expensive items (>$1000) need descriptive names (10+ characters)

### Tally Validation

**File:** `tally.ts`

#### Schemas

- **`tallyItemSchema`**: Validates individual tally items
  - UUID v4 productId validation
  - Positive integer quantity
  - Non-negative price
- **`quantitySchema`**: Validates quantity values
- **`tallyStateSchema`**: Validates tally state as a record
  - Maximum total items: 99,999
  - Safe integer overflow protection
- **`tallySummarySchema`**: Validates tally summary objects
- **`tallyItemConsistencySchema`**: Validates tally item consistency
  - Non-negative prices
  - Safe integer limits for line totals

### Settings Validation

**File:** `settings.ts`

#### Schemas

- **`themeSchema`**: Validates theme values
  - Allowed: 'light', 'dark', 'system'
- **`gridDensitySchema`**: Validates grid density settings
  - Allowed: 'normal', 'compact'
- **`columnCountSchema`**: Validates column count overrides
  - Allowed values: 2, 3, 4, 5, 6, 7, 8
- **`settingsSchema`**: Validates complete Settings objects
- **`settingsBusinessLogicSchema`**: Validates settings business rules
  - Compact view requires at least 3 columns
  - Normal view should not exceed 6 columns
  - Backup reminder: 0-365 days
- **`themeChangeValidationSchema`**: Validates theme changes
- **`gridDensityChangeValidationSchema`**: Validates grid density changes
- **`columnCountValidationSchema`**: Validates column count changes

### Consistency Validation

**File:** `consistency.ts`

#### Functions

- **`checkTimestampConsistency(product)`**: Ensures updatedAt >= createdAt
- **`checkProductIntegrity(product)`**: Comprehensive product integrity check
  - Validates all product fields
  - Checks timestamp consistency
  - Returns { isValid, errors }
- **`validateProductList(products, options?)`**: Validates product lists
  - Individual product integrity
  - Duplicate ID detection
  - Optional unique name checking
  - Returns { isValid, errors, invalidIndices }
- **`generateProductChecksum(product)`**: Creates data checksum for integrity verification
- **`detectDataAnomalies(products)`**: Analyzes products for data quality issues
  - High price warnings (>$10,000)
  - Old product warnings (created >1 year ago)
  - Missing image warnings

## Usage Examples

### Validating Product Input

```typescript
import { productInputSchema } from '@tiny-till/types'

const input = {
  name: 'Bread',
  price: 250, // $2.50 in cents
  imageData: 'data:image/png;base64,...'
}

const result = productInputSchema.safeParse(input)

if (!result.success) {
  console.error('Validation failed:', result.error.issues)
} else {
  console.log('Valid product:', result.data)
}
```

### Checking Product Integrity

```typescript
import { checkProductIntegrity } from '@tiny-till/types'

const product = { /* product object */ }
const check = checkProductIntegrity(product)

if (!check.isValid) {
  console.error('Integrity issues:', check.errors)
}
```

### Validating Settings

```typescript
import { settingsBusinessLogicSchema } from '@tiny-till/types'

const settings = {
  theme: 'dark',
  gridDensity: 'compact',
  columnCountOverride: 5,
  backupReminder: 7
}

const result = settingsBusinessLogicSchema.safeParse(settings)

if (!result.success) {
  result.error.issues.forEach(issue => {
    console.error(`${issue.path}: ${issue.message}`)
  })
}
```

## Error Message Patterns

Zod validation errors follow a consistent pattern:

```
path: error message
```

Examples:
- `name: Product name is required`
- `price: Price must be at least 1 cent`
- `imageData: Image must be PNG, JPEG, or WebP format`

## Custom Validation Rules

### Business Logic Validators

Custom business rules are implemented using Zod's `.refine()` method:

```typescript
.refine((data) => {
  return someCondition(data)
}, {
  message: 'Custom error message',
  path: ['fieldName'], // Optional: specifies which field caused the error
})
```

### Cross-Field Validation

Cross-field validations ensure data consistency across related fields:

```typescript
.refine((data) => {
  return field1.value && field2.value
}, {
  message: 'Fields must be consistent',
  path: ['field1'],
})
```

## Testing Validation

Validation schemas can be tested using Zod's safeParse method:

```typescript
const result = schema.safeParse(data)

expect(result.success).toBe(true)
if (!result.success) {
  expect(result.error.issues).toHaveLength(0)
}
```

## Integration with Stores

Validation schemas are integrated with Zustand stores:

1. **Input Validation**: Before adding/updating data
2. **Integrity Checking**: After data restoration from storage
3. **Business Logic**: Enforcing domain-specific rules
4. **Error Handling**: Providing actionable error messages

## Best Practices

1. **Always validate inputs** before storage
2. **Use specific schemas** for specific operations (input vs update)
3. **Handle validation errors** gracefully with user-friendly messages
4. **Log integrity issues** for debugging
5. **Run consistency checks** on app initialization
6. **Validate imports/exports** when transferring data

## Future Enhancements

- Add locale-specific validation (currency formats, number formats)
- Support custom validation rules per user configuration
- Add validation rules for product categorization (when implemented)
- Support batch validation for performance optimization
