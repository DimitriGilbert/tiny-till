# Task 2.4 Implementation Plan: Image Upload System with Client-Side Validation

## Overview
Implement a comprehensive image upload component with drag-and-drop support, strict client-side validation (MIME type checking for PNG, JPEG, WebP, dimension enforcement max 128×128px, file size limits), Base64 encoding/decoding with storage optimization, detailed error messages for validation failures, and integration with product CRUD to associate images with products.

## Current State Analysis

### Existing Implementation
Based on prior tasks:
- Basic file upload via `<input type="file">` in product forms
- MIME type validation (PNG, JPEG, WebP)
- Dimension validation (max 128×128px)
- Basic Base64 encoding via FileReader
- Image preview with URL.createObjectURL
- Product data model includes `imageData` field for Base64 strings

### Gaps to Address
1. No drag-and-drop support
2. Limited error messages (generic validation failures)
3. No storage optimization for Base64 images
4. Validation errors not sufficiently detailed
5. Image validation logic scattered across multiple files
6. No reusable image upload component

## Implementation Steps

### Step 1: Create Enhanced Image Validation Types and Utilities
**File:** `packages/types/src/utils/image.ts` (NEW)

**Actions:**
- Define `ImageValidationResult` type with specific error types
- Define `ImageDimensions` type
- Define `ImageValidationError` union type for all validation failures
- Define `ImageCompressionOptions` for storage optimization
- Export constants for validation limits

**Type Definitions:**
```typescript
export type ImageValidationError =
  | 'INVALID_MIME_TYPE'
  | 'FILE_TOO_LARGE'
  | 'DIMENSIONS_TOO_LARGE'
  | 'CORRUPT_IMAGE'
  | 'ENCODING_ERROR';

export interface ImageDimensions {
  width: number
  height: number
}

export interface ImageValidationResult {
  valid: boolean
  error?: ImageValidationError
  details?: {
    expectedMimeTypes?: string[]
    maxSize?: string
    maxDimensions?: string
    actualDimensions?: string
    actualSize?: string
  }
}

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}
```

**Constants:**
```typescript
export const MAX_IMAGE_WIDTH = 128;
export const MAX_IMAGE_HEIGHT = 128;
export const MAX_IMAGE_SIZE_BYTES = 65536; // 64KB
export const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
```

### Step 2: Create Image Processing Utilities
**File:** `packages/types/src/utils/image-processing.ts` (NEW)

**Functions:**

1. `validateImageFile(file: File): Promise<ImageValidationResult>`
   - Check MIME type against ACCEPTED_MIME_TYPES
   - Check file size against MAX_IMAGE_SIZE_BYTES
   - Load image to validate dimensions
   - Return detailed error with user-friendly details or success

2. `getImageDimensions(file: File): Promise<ImageDimensions>`
   - Create Image object in memory
   - Load file as data URL
   - Return width/height
   - Handle load errors with corrupt image detection

3. `compressImage(file: File, options?: ImageCompressionOptions): Promise<Blob>`
   - Draw to canvas
   - Resize if needed (maintain aspect ratio, max 128px)
   - Export as WebP (smaller than PNG/JPEG) or original format
   - Quality parameter (0.7-0.9 for balance)
   - Return compressed blob

4. `encodeBase64(file: File | Blob): Promise<string>`
   - FileReader to data URL
   - Strip unnecessary metadata if possible
   - Return Base64 string with proper prefix

5. `decodeBase64(base64: string): Blob | null`
   - Parse data URL
   - Convert to Blob
   - Handle decode errors

6. `calculateImageQuality(originalSize: number, targetSize: number): number`
   - Calculate compression quality needed
   - Return value between 0.5 and 1.0

7. `getImageMimeTypeFromBase64(base64: string): string | null`
   - Extract MIME type from data URL prefix
   - Support PNG, JPEG, WebP formats

8. `formatFileSize(bytes: number): string`
   - Convert bytes to human-readable format (KB, MB)

### Step 3: Update Types Package Index
**File:** `packages/types/src/index.ts`

**Actions:**
- Export new image validation types from `utils/image.ts`
- Export new image processing functions from `utils/image-processing.ts`
- Update utils index to export image utilities

### Step 4: Create Reusable Image Upload Component
**File:** `apps/web/src/components/ImageUpload.tsx` (NEW)

**Component Features:**
- Drag-and-drop zone with visual feedback (drag over, drag leave, drop)
- Click to upload fallback
- Image preview display
- Remove image button
- Loading state during processing
- Error display with detailed messages
- Accessibility (keyboard navigation, ARIA labels)
- Responsive design
- Dark mode support

**Props:**
```typescript
interface ImageUploadProps {
  value?: string | null
  onChange: (value: string | null) => void
  onValidationError?: (error: ImageValidationError) => void
  disabled?: boolean
  className?: string
  label?: string
  helpText?: string
}
```

**Key Interactions:**
- Drag enter: highlight drop zone with visual cue
- Drag leave: remove highlight
- Drop: process file, show loading state, validate, compress, encode
- Click: trigger file input
- Remove image: clear value
- Keyboard: Tab to upload, Space/Enter to activate

**Validation Flow:**
1. File received (drag or click)
2. Show loading state
3. Validate MIME type, size, dimensions
4. If invalid: show error, prevent upload, call onValidationError
5. If valid: compress image
6. Encode to Base64
7. Call onChange with result
8. Show preview

**UI Elements:**
- Drag drop zone with dashed border
- Upload icon (lucide-react Upload)
- Preview image thumbnail
- Remove button (X icon)
- Loading spinner
- Error message display
- Help text below component

### Step 5: Update useProductForm Hook
**File:** `apps/web/src/hooks/use-product-form.ts`

**Actions:**
1. Import new validation and processing utilities from `@tiny-till/types`
2. Replace existing `validateImage` function with enhanced version
3. Replace `processImage` function to use new compression utilities
4. Update error handling to use new detailed error types
5. Remove redundant image dimension checking logic
6. Ensure Base64 encoding uses optimized path

**Changes:**
- Use `validateImageFile` from types package
- Use `compressImage` before encoding
- Use `encodeBase64` for final encoding
- Map validation errors to user-friendly messages
- Remove `getImageDimensions` (now in types package)

### Step 6: Update ProductForm Component
**File:** `apps/web/src/components/ProductForm.tsx`

**Actions:**
1. Import new `ImageUpload` component
2. Replace existing image upload section with `ImageUpload` component
3. Remove manual file input handling
4. Remove `handleImageChange` and `handleRemoveImage` functions
5. Update image error state handling
6. Simplify form integration

**Simplified Integration:**
```tsx
<ImageUpload
  value={form.state.value.image}
  onChange={(value) => form.setFieldValue('image', value)}
  label="Product Image (optional)"
  helpText="Max size: 128×128 pixels. Formats: PNG, JPEG, WebP"
  disabled={form.state.isSubmitting}
/>
```

### Step 7: Update Type Validation Schemas
**File:** `packages/types/src/validation/product.ts`

**Actions:**
1. Review and update `imageDataRefine` to work with optimized Base64
2. Ensure validation accepts WebP format (smaller, better for storage)
3. Update error messages to be more specific
4. Consider adding validation for minimum dimensions (e.g., 32×32)

**Note:** May need to adjust `MAX_IMAGE_SIZE_BYTES` to account for compression improvements.

### Step 8: Add Toast Notifications for Image Processing
**File:** Using existing `sonner` for toasts

**Actions:**
1. Add success toast when image uploads successfully
2. Add info toast when image is compressed (e.g., "Image optimized: 45KB → 12KB")
3. Add error toasts for each validation failure type with actionable messages

**Example Messages:**
- Success: "Image uploaded successfully"
- Compression: "Image optimized from 50KB to 15KB"
- Invalid MIME: "Please upload PNG, JPEG, or WebP images only"
- Too large: "Image is 200KB. Maximum allowed size is 64KB"
- Too big: "Image is 256×256 pixels. Maximum allowed is 128×128"
- Corrupt: "Unable to read image file. Please try a different file"

### Step 9: Storage Optimization Enhancements
**Additional Improvements:**

1. **Format Preference:**
   - Prefer WebP for new uploads (better compression)
   - Maintain original format for compatibility if needed

2. **Quality Settings:**
   - Default quality: 0.8 for lossy formats
   - Minimum quality: 0.6 (before switching format)
   - Maximum size target: 32KB (well under 64KB limit)

3. **Cache Management:**
   - Revoke blob URLs to free memory
   - Clear temporary objects after processing

4. **Progressive Loading:**
   - Show placeholder during processing
   - Smooth transitions between states

### Step 10: Testing and Validation
**Manual Testing Checklist:**
- [ ] Drag and drop works on desktop
- [ ] Click to upload works
- [ ] Preview displays correctly
- [ ] Remove image clears state
- [ ] Invalid MIME type shows error
- [ ] Oversized image (dimensions) shows error
- [ ] Oversized image (file size) shows error
- [ ] Corrupt image shows error
- [ ] Valid PNG uploads successfully
- [ ] Valid JPEG uploads successfully
- [ ] Valid WebP uploads successfully
- [ ] 128×128 image uploads
- [ ] Smaller images upload (e.g., 64×64)
- [ ] Image compression works (check console or info toast)
- [ ] Dark mode styling correct
- [ ] Keyboard navigation works (tab to upload, space to activate)
- [ ] Screen reader announcements work
- [ ] Multiple rapid uploads handled gracefully
- [ ] Form can be submitted with image
- [ ] Form can be submitted without image
- [ ] Edit mode shows existing image
- [ ] Edit mode can replace image
- [ ] Edit mode can remove image

## File Changes Summary

### New Files
1. `packages/types/src/utils/image.ts` - Image validation types and constants
2. `packages/types/src/utils/image-processing.ts` - Image processing utilities
3. `apps/web/src/components/ImageUpload.tsx` - Reusable drag-and-drop upload component

### Modified Files
1. `packages/types/src/index.ts` - Export new utilities
2. `apps/web/src/hooks/use-product-form.ts` - Use new validation/processing
3. `apps/web/src/components/ProductForm.tsx` - Integrate new component
4. `packages/types/src/validation/product.ts` - Update validation rules

## Technical Notes

### Performance Considerations
- Image loading happens asynchronously
- Compression adds ~100-300ms processing time
- Use canvas in memory, not DOM
- Revoke blob URLs immediately after use
- Consider web workers for heavy processing (not needed for 128×128)

### Browser Compatibility
- Canvas API: All modern browsers
- WebP: Chrome 23+, Firefox 65+, Safari 14+
- Fallback to JPEG if WebP not supported

### Storage Strategy
- Target: 10-20KB per image (vs 64KB limit)
- Allows ~1000-2000 products in 20MB storage quota
- Format: `data:image/webp;base64,{encoded_data}`

### Error Recovery
- Show specific, actionable error messages
- Allow retry without reloading form
- Preserve valid form data on image error
- Don't block form submission if image is optional

## Dependencies

No new dependencies required. Using:
- Canvas API (built-in)
- FileReader API (built-in)
- Existing shadcn/ui components (Card, Button)
- Existing lucide-react icons
- Existing sonner for toasts

## Integration Points

1. **Product CRUD:** Images stored as Base64 in `imageData` field
2. **Product Form:** Uses `ImageUpload` component
3. **Validation:** Centralized in types package
4. **Storage:** Persisted via Zustand + IndexedDB (already working)

## Success Criteria

1. ✓ Drag-and-drop interface functional
2. ✓ Click to upload fallback works
3. ✓ All validation rules enforced with specific errors
4. ✓ Images compressed before storage
5. ✓ Base64 encoding optimized
6. ✓ Detailed error messages displayed
7. ✓ Product CRUD integration working
8. ✓ TypeScript compilation passes
9. ✓ No LSP errors
10. ✓ All manual tests pass

## Post-Implementation Tasks (Not Part of 2.4)

- Add unit tests for image validation utilities
- Add unit tests for image processing functions
- Performance benchmark for large catalogs
- Accessibility audit
- Cross-browser testing (different OSes)
