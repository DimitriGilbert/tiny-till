# Task 2.2 Implementation Plan: Core CRUD Operations and API Integration

## Task Overview
Implement complete create, read, update, delete operations for products with proper validation, error handling, optimistic UI updates, and state synchronization.

## Current State Analysis

### What's Already Implemented
- ✅ Catalog store with basic add/update/delete actions
- ✅ Product types: Product, ProductInput, ProductUpdate, ProductList
- ✅ Zod validation schemas for products
- ✅ Data integrity checks in `packages/types/src/validation/consistency.ts`
- ✅ Currency utilities: toCents, toDollars, formatPrice, parsePrice
- ✅ IndexedDB persistence layer with idb-keyval
- ✅ UI components: Button, Dialog, Input, Card, Label, Skeleton, Sonner (toast)
- ✅ TanStack Form available for form handling
- ✅ UUID generation utilities

### What's Missing
- ❌ Form validation integration with store actions
- ❌ Optimistic UI updates with rollback capability
- ❌ Comprehensive error handling and user feedback
- ❌ Product list UI with inline edit/delete
- ❌ Add/Edit product forms with validation
- ❌ Confirmation dialogs for destructive operations
- ❌ Loading states and empty state handling
- ❌ Reactivity improvements for real-time updates

## Implementation Plan

### Phase 1: Enhance Store Actions with Validation (Backend Layer)

**File: `apps/web/src/stores/catalog-store.ts`**

**1.1 Import validation utilities**
```typescript
import { productInputSchema, productUpdateSchema } from '@tiny-till/types'
import { checkProductIntegrity, validateProductList } from '@tiny-till/types'
import { toast } from 'sonner'
```

**1.2 Add validation to addProduct action**
- Validate ProductInput against Zod schema before creation
- Run integrity checks after product creation
- Return Promise for async operations
- Add optimistic update flag for rollback capability
- Error handling with toast notifications

**1.3 Enhance updateProduct action**
- Validate ProductUpdate against Zod schema
- Check if product exists before update
- Validate updated product integrity after merge
- Add optimistic update with rollback
- Implement partial update handling

**1.4 Improve deleteProduct action**
- Validate product ID format (UUID)
- Check if product exists before deletion
- Add confirmation check (optional, can be UI layer)
- Add optimistic delete with rollback

**1.5 Add bulk actions**
- addProducts (bulk import)
- updateProducts (bulk update)
- deleteProducts (bulk delete)
- Import validation using validateProductList
- Error recovery with partial success handling

**1.6 Add computed selectors**
- getProductCount
- getProductById (existing, improve error handling)
- searchProducts (by name)
- getProductsByPriceRange

### Phase 2: Create Form Validation Hook

**File: `apps/web/src/hooks/use-product-form.ts`**

**2.1 Implement TanStack Form integration**
- Create form instance with Zod validation
- Set up field validation rules
- Handle currency input (dollars → cents conversion)
- Image data handling (base64 validation)

**2.2 Add form error handling**
- Field-level error display
- Form-level validation on submit
- Debounced validation for real-time feedback
- Reset form functionality

**2.3 Create form submission handlers**
- onSubmitAdd: Create new product
- onSubmitUpdate: Update existing product
- Optimistic UI updates with rollback
- Success/error toast notifications

### Phase 3: Create Product List Component

**File: `apps/web/src/components/product-list.tsx`**

**3.1 Component structure**
```typescript
interface ProductListProps {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}
```

**3.2 Implement list view**
- Render products in responsive grid layout
- Display product card with: image, name, formatted price
- Empty state component when no products
- Loading skeleton when hydrating/processing
- Search/filter bar for product lookup

**3.3 Add inline actions**
- Edit button triggers edit mode
- Delete button triggers confirmation dialog
- Optimistic updates on delete (immediate removal)
- Rollback on error

**3.4 Accessibility features**
- Keyboard navigation (arrow keys)
- ARIA labels for buttons
- Focus management after actions
- Screen reader announcements

### Phase 4: Create Add/Edit Product Form Component

**File: `apps/web/src/components/product-form.tsx`**

**4.1 Component props**
```typescript
interface ProductFormProps {
  product?: Product  // undefined = add mode, defined = edit mode
  onSuccess: () => void
  onCancel: () => void
}
```

**4.2 Form fields**
- Name input (1-50 chars, required)
- Price input with currency symbol ($)
  - Parse "$10.50" → 1050 cents
  - Format display from cents
- Image upload (optional)
  - Drag-and-drop support
  - MIME type validation
  - Size validation (128x128 max)
  - Preview image

**4.3 Form validation**
- Real-time field validation
- Zod schema integration
- Currency parsing/validation
- Image validation
- Submit button disabled until valid

**4.4 Submit handling**
- Optimistic UI update (add to list immediately)
- Rollback on error
- Success toast notification
- Form reset on success

### Phase 5: Create Confirmation Dialog Component

**File: `apps/web/src/components/confirmation-dialog.tsx`**

**5.1 Reusable dialog for destructive actions**
- Generic title/message props
- Confirm button (destructive variant)
- Cancel button
- Backdrop click handling

**5.2 Integration with delete actions**
- Show product details being deleted
- Warning message about permanent deletion
- Optimistic delete with confirmation
- Error recovery if deletion fails

### Phase 6: Create Product Card Component

**File: `apps/web/src/components/product-card.tsx`**

**6.1 Display product information**
- Product image (or placeholder)
- Product name
- Formatted price (e.g., "$10.50")
- Action buttons (Edit, Delete)

**6.2 Interactive features**
- Hover effects
- Focus states
- Loading states (during updates)
- Error states

### Phase 7: Integrate CRUD Components into Catalog Route

**File: `apps/web/src/routes/settings.catalog.tsx`**

**7.1 Route component structure**
```typescript
function CatalogPage() {
  const products = useCatalogStore(state => state.products)
  const hasHydrated = useCatalogStore(state => state.hasHydrated)
  const isLoading = useCatalogStore(state => state.isLoading)

  // State for edit mode
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  // CRUD handlers
  const handleAdd = ...
  const handleEdit = ...
  const handleDelete = ...
}
```

**7.2 Layout sections**
- Header with "Add Product" button
- Product list section
- Add form modal/dialog
- Edit form modal/dialog
- Delete confirmation dialog

**7.3 Loading states**
- Show skeleton while hydrating from IndexedDB
- Disable actions during loading
- Show progress indicator for bulk operations

**7.4 Empty state**
- Show message when no products exist
- Call-to-action to add first product
- Helpful tips/instructions

### Phase 8: Error Handling and User Feedback

**8.1 Global error handling**
- Wrap store actions in try-catch
- Log errors to console with context
- Display user-friendly toast messages
- Error recovery suggestions

**8.2 Specific error scenarios**
- Storage quota exceeded → Show upgrade prompt
- Invalid UUID → Show validation error
- Duplicate name → Show conflict message
- Corrupted data → Show recovery options

**8.3 Toast notifications**
- Success: "Product added successfully"
- Success: "Product updated"
- Success: "Product deleted"
- Error: "Failed to add product: [details]"
- Error: "Failed to update product: [details]"
- Error: "Failed to delete product: [details]"

### Phase 9: State Synchronization and Optimistic Updates

**9.1 Optimistic update pattern**
```typescript
// In store actions
function updateProduct(id: string, updates: ProductUpdate) {
  const previousState = get().products

  // Optimistic update
  set(state => ({
    products: state.products.map(p => ...)
  }))

  try {
    // Validation and persistence (async)
    // ...
  } catch (error) {
    // Rollback on error
    set({ products: previousState })
    throw error
  }
}
```

**9.2 Hydration tracking**
- Display loading state while hydrating
- Show cached data during rehydration
- Handle hydration errors gracefully

**9.3 Real-time updates**
- React to store changes automatically
- Debounced search/filter
- Debounced form validation

## Testing Strategy

### Unit Tests
- Store actions with valid/invalid inputs
- Validation schema compliance
- Currency conversion utilities
- Integrity check functions

### Integration Tests
- Form submission flow
- CRUD operations end-to-end
- Persistence across page reloads
- Error recovery scenarios

### Manual Testing Checklist
- [ ] Add product with valid data
- [ ] Add product with invalid data (validation errors)
- [ ] Edit product name
- [ ] Edit product price
- [ ] Delete product (confirm dialog)
- [ ] Delete product (cancel)
- [ ] Search/filter products
- [ ] Empty state display
- [ ] Loading states
- [ ] Error states
- [ ] Toast notifications
- [ ] Persistence after reload

## Implementation Order

1. Phase 1: Enhance store with validation (foundation)
2. Phase 2: Create form validation hook
3. Phase 5: Create confirmation dialog (reusable)
4. Phase 6: Create product card component
5. Phase 3: Create product list component
6. Phase 4: Create product form component
7. Phase 7: Integrate into catalog route
8. Phase 8: Error handling and feedback
9. Phase 9: Optimistic updates and sync

## Success Criteria

- ✅ All CRUD operations working with validation
- ✅ Optimistic UI updates with rollback on error
- ✅ User-friendly error messages
- ✅ Loading states displayed appropriately
- ✅ Empty state handling
- ✅ Toast notifications for all operations
- ✅ State persists across page reloads
- ✅ Data integrity checks pass
- ✅ TypeScript compilation passes
- ✅ No console errors in production
- ✅ Accessibility requirements met

## File Changes Summary

### New Files to Create
1. `apps/web/src/hooks/use-product-form.ts`
2. `apps/web/src/components/confirmation-dialog.tsx`
3. `apps/web/src/components/product-card.tsx`
4. `apps/web/src/components/product-list.tsx`
5. `apps/web/src/components/product-form.tsx`

### Files to Modify
1. `apps/web/src/stores/catalog-store.ts` - Add validation, optimistic updates, bulk actions
2. `apps/web/src/routes/settings.catalog.tsx` - Integrate all CRUD components

### No Changes Required
- All existing type definitions
- Validation schemas
- Persistence layer
- UI primitives (already sufficient)

## Notes

- All UI will use shadcn/ui components
- TanStack Form will handle form state and validation
- Sonner will provide toast notifications
- Optimistic updates improve perceived performance
- Rollback ensures data integrity
- No backend required (client-side only)
- IndexedDB provides persistent storage
