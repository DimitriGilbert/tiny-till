import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type {
  Product,
  ProductInput,
  ProductUpdate,
  ProductList,
  ProductChange,
  ImportPreviewData,
  ImportExecutionResult,
  ConflictResolution,
  ImportProgress,
} from '@tiny-till/types'
import {
  generateUUID,
  productInputSchema,
  productUpdateSchema,
  validateProductList,
  checkProductIntegrity,
  checkTimestampConsistency,
  executeImportAtomic,
} from '@tiny-till/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { createIndexedDBStorage } from '@/lib/persist-middleware'
import { toast } from 'sonner'
import { checkAllDataIntegrity } from '@/lib/data-integrity'
import {
  validateProductAdd,
  validateProductUpdate,
  validateProductDelete,
} from '@/lib/validation-helpers'

interface CatalogState {
  products: ProductList
  isLoading: boolean
  error: string | null
  hasHydrated: boolean
}

interface CatalogActions {
  addProduct: (input: ProductInput, optimistic?: boolean) => Promise<Product | null>
  updateProduct: (
    id: string,
    updates: ProductUpdate,
    optimistic?: boolean
  ) => Promise<Product | null>
  deleteProduct: (id: string, optimistic?: boolean) => Promise<boolean>
  addProducts: (inputs: ProductInput[]) => Promise<{ success: number; failed: number }>
  updateProducts: (
    updates: Array<{ id: string; data: ProductUpdate }>
  ) => Promise<{ success: number; failed: number }>
  deleteProducts: (ids: string[]) => Promise<number>
  getProduct: (id: string) => Product | undefined
  getProductCount: () => number
  searchProducts: (query: string) => Product[]
  getProductsByPriceRange: (minCents: number, maxCents: number) => Product[]
  importWithPreview: (
    previewData: ImportPreviewData,
    selectedChanges: ProductChange[]
  ) => Promise<{ added: number; updated: number; skipped: number }>
  importAtomic: (
    changes: ProductChange[],
    options: {
      conflictResolutions: Map<string, ConflictResolution>
      batchSize?: number
      onProgress?: (progress: ImportProgress) => void
    }
  ) => Promise<ImportExecutionResult>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type CatalogStore = CatalogState & CatalogActions

const initialState: Omit<CatalogState, 'hasHydrated'> = {
  products: [],
  isLoading: false,
  error: null,
}

export const useCatalogStore = create<CatalogStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        hasHydrated: false,

        addProduct: async (input: ProductInput, optimistic = true) => {
          try {
            const validationResult = await validateProductAdd(input)
            if (!validationResult.isValid) {
              const errorMessage = validationResult.error || 'Validation failed'
              toast.error('Validation Error', { description: errorMessage })
              set({ error: errorMessage })
              return null
            }

            const validation = productInputSchema.safeParse(input)
            if (!validation.success) {
              const errorMessage = validation.error.issues
                .map((e: { path: unknown[]; message: string }) =>
                  `${Array.isArray(e.path) ? e.path.join('.') : e.path}: ${e.message}`
                )
                .join(', ')
              toast.error('Validation Error', { description: errorMessage })
              set({ error: errorMessage })
              return null
            }

            const now = Date.now()
            const product: Product = {
              ...validation.data,
              id: generateUUID(),
              createdAt: now,
              updatedAt: now,
            }

            const integrityCheck = checkProductIntegrity(product)
            if (!integrityCheck.isValid) {
              const errorMessage = integrityCheck.errors.join(', ')
              toast.error('Integrity Error', { description: errorMessage })
              set({ error: errorMessage })
              return null
            }

            if (optimistic) {
              const previousProducts = get().products
              set((state) => ({
                products: [...state.products, product],
                error: null,
              }))

              try {
                console.log('[CatalogStore] addProduct optimistic success', get())
                toast.success('Product added successfully')
              } catch (error) {
                set({ products: previousProducts, error: 'Failed to persist product' })
                throw error
              }
            } else {
              set((state) => ({
                products: [...state.products, product],
                error: null,
              }))
              console.log('[CatalogStore] addProduct', get())
              toast.success('Product added successfully')
            }

            return product
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to add product'
            set({ error: errorMessage })
            toast.error('Error', { description: errorMessage })
            console.error('[CatalogStore] Error:', errorMessage)
            return null
          }
        },

        updateProduct: async (
          id: string,
          updates: ProductUpdate,
          optimistic = true
        ) => {
          try {
            const validation = productUpdateSchema.safeParse(updates)
            if (!validation.success) {
              const errorMessage = validation.error.issues
                .map((e: { path: unknown[]; message: string }) =>
                  `${Array.isArray(e.path) ? e.path.join('.') : e.path}: ${e.message}`
                )
                .join(', ')
              toast.error('Validation Error', { description: errorMessage })
              set({ error: errorMessage })
              return null
            }

            const existingProduct = get().getProduct(id)
            if (!existingProduct) {
              const errorMessage = `Product with ID ${id} not found`
              toast.error('Error', { description: errorMessage })
              set({ error: errorMessage })
              return null
            }

            const mergedProduct: Product = {
              ...existingProduct,
              ...validation.data,
              updatedAt: Date.now(),
            }

            if (!checkTimestampConsistency(mergedProduct)) {
              const errorMessage = 'Timestamp consistency check failed'
              toast.error('Integrity Error', { description: errorMessage })
              set({ error: errorMessage })
              return null
            }

            const integrityCheck = checkProductIntegrity(mergedProduct)
            if (!integrityCheck.isValid) {
              const errorMessage = integrityCheck.errors.join(', ')
              toast.error('Integrity Error', { description: errorMessage })
              set({ error: errorMessage })
              return null
            }

            if (optimistic) {
              const previousProducts = get().products
              set((state) => ({
                products: state.products.map((product: Product) =>
                  product.id === id ? mergedProduct : product
                ),
                error: null,
              }))

              try {
                console.log('[CatalogStore] updateProduct optimistic success', get())
                toast.success('Product updated successfully')
              } catch (error) {
                set({ products: previousProducts, error: 'Failed to persist update' })
                throw error
              }
            } else {
              set((state) => ({
                products: state.products.map((product: Product) =>
                  product.id === id ? mergedProduct : product
                ),
                error: null,
              }))
              console.log('[CatalogStore] updateProduct', get())
              toast.success('Product updated successfully')
            }

            return mergedProduct
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to update product'
            set({ error: errorMessage })
            toast.error('Error', { description: errorMessage })
            console.error('[CatalogStore] Error:', errorMessage)
            return null
          }
        },

        deleteProduct: async (id: string, optimistic = true) => {
          try {
            const existingProduct = get().getProduct(id)
            if (!existingProduct) {
              const errorMessage = `Product with ID ${id} not found`
              toast.error('Error', { description: errorMessage })
              set({ error: errorMessage })
              return false
            }

            if (optimistic) {
              const previousProducts = get().products
              set((state) => ({
                products: state.products.filter((product: Product) => product.id !== id),
                error: null,
              }))

              try {
                console.log('[CatalogStore] deleteProduct optimistic success', get())
                toast.success('Product deleted successfully')
              } catch (error) {
                set({ products: previousProducts, error: 'Failed to persist deletion' })
                throw error
              }
            } else {
              set((state) => ({
                products: state.products.filter((product: Product) => product.id !== id),
                error: null,
              }))
              console.log('[CatalogStore] deleteProduct', get())
              toast.success('Product deleted successfully')
            }

            return true
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to delete product'
            set({ error: errorMessage })
            toast.error('Error', { description: errorMessage })
            console.error('[CatalogStore] Error:', errorMessage)
            return false
          }
        },

        addProducts: async (inputs: ProductInput[]) => {
          set({ isLoading: true })
          let success = 0
          let failed = 0

          for (const input of inputs) {
            const result = await get().addProduct(input, false)
            if (result) {
              success++
            } else {
              failed++
            }
          }

          set({ isLoading: false })
          if (failed === 0) {
            toast.success(`Successfully added ${success} products`)
          } else if (success === 0) {
            toast.error('Failed to add any products')
          } else {
            toast.warning(`Added ${success} products, ${failed} failed`)
          }

          return { success, failed }
        },

        updateProducts: async (updates: Array<{ id: string; data: ProductUpdate }>) => {
          set({ isLoading: true })
          let success = 0
          let failed = 0

          for (const { id, data } of updates) {
            const result = await get().updateProduct(id, data, false)
            if (result) {
              success++
            } else {
              failed++
            }
          }

          set({ isLoading: false })
          if (failed === 0) {
            toast.success(`Successfully updated ${success} products`)
          } else if (success === 0) {
            toast.error('Failed to update any products')
          } else {
            toast.warning(`Updated ${success} products, ${failed} failed`)
          }

          return { success, failed }
        },

        deleteProducts: async (ids: string[]) => {
          set({ isLoading: true })
          let count = 0

          for (const id of ids) {
            const result = await get().deleteProduct(id, false)
            if (result) {
              count++
            }
          }

          set({ isLoading: false })
          toast.success(`Successfully deleted ${count} products`)
          return count
        },

        getProduct: (id: string) => {
          return get().products.find((product: Product) => product.id === id)
        },

        getProductCount: () => {
          return get().products.length
        },

        searchProducts: (query: string) => {
          const normalizedQuery = query.toLowerCase().trim()
          if (!normalizedQuery) {
            return get().products
          }
          return get().products.filter((product: Product) =>
            product.name.toLowerCase().includes(normalizedQuery)
          )
        },

        getProductsByPriceRange: (minCents: number, maxCents: number) => {
          return get().products.filter(
            (product: Product) =>
              product.price >= minCents && product.price <= maxCents
          )
        },

        clearError: () => {
          set({ error: null })
          console.log('[CatalogStore] clearError', get())
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
          console.log('[CatalogStore] setLoading', get())
        },

        importWithPreview: async (
          previewData: ImportPreviewData,
          selectedChanges: ProductChange[]
        ) => {
          set({ isLoading: true })
          let added = 0
          let updated = 0
          let skipped = 0

          try {
            for (const change of selectedChanges) {
              if (change.changeType === 'add') {
                const product = change.newProduct
                const result = await get().addProduct(
                  {
                    name: product.name,
                    price: product.price,
                    imageData: product.imageData,
                  },
                  false
                )
                if (result) {
                  added++
                } else {
                  skipped++
                }
              } else if (change.changeType === 'update' || change.changeType === 'conflict') {
                const result = await get().updateProduct(
                  change.productId,
                  {
                    name: change.newProduct.name,
                    price: change.newProduct.price,
                    imageData: change.newProduct.imageData,
                  },
                  false
                )
                if (result) {
                  updated++
                } else {
                  skipped++
                }
              } else {
                skipped++
              }
            }

            set({ isLoading: false })

            if (skipped === 0) {
              toast.success('Import Completed', {
                description: `Added ${added} and updated ${updated} products`,
              })
            } else if (added === 0 && updated === 0) {
              toast.warning('Import Failed', {
                description: 'No products were imported',
              })
            } else {
              toast.warning('Import Partially Completed', {
                description: `Added ${added}, updated ${updated}, skipped ${skipped}`,
              })
            }

            return { added, updated, skipped }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to import products'
            set({ error: errorMessage, isLoading: false })
            toast.error('Import Error', {
              description: errorMessage,
            })
            return { added, updated, skipped }
          }
        },

        importAtomic: async (changes, options) => {
          set({ isLoading: true })

          try {
            const result = await executeImportAtomic(get().products, changes, options)

            if (result.success) {
              const productsToAdd: ProductInput[] = []
              const productsToUpdate: Array<{ id: string; data: ProductUpdate }> = []

              for (const change of changes) {
                if (change.changeType === 'add') {
                  productsToAdd.push({
                    name: change.newProduct.name,
                    price: change.newProduct.price,
                    imageData: change.newProduct.imageData,
                  })
                } else if (change.changeType === 'update' || change.changeType === 'conflict') {
                  const resolution = options.conflictResolutions.get(change.productId)
                  if (resolution && resolution.strategy !== 'skip') {
                    productsToUpdate.push({
                      id: change.productId,
                      data: {
                        name: change.newProduct.name,
                        price: change.newProduct.price,
                        imageData: change.newProduct.imageData,
                      },
                    })
                  }
                }
              }

              await get().addProducts(productsToAdd)
              await get().updateProducts(productsToUpdate)
            }

            set({ isLoading: false })
            return result
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import products'
            set({ error: errorMessage, isLoading: false })
            return {
              success: false,
              transactionId: '',
              added: 0,
              updated: 0,
              skipped: 0,
              failed: changes.length,
              errors: changes.map((c) => ({
                productId: c.productId,
                productName: c.newProduct.name,
                error: errorMessage,
              })),
            }
          }
        },
      }),
      {
        name: STORAGE_KEYS.CATALOG,
        storage: createIndexedDBStorage<CatalogStore>(),
        onRehydrateStorage: () => async (state: CatalogStore | undefined, error?: unknown) => {
          if (error) {
            console.error('[CatalogStore] Rehydration failed:', error)
            toast.error('Storage Error', {
              description: 'Failed to restore catalog from storage',
            })
            return
          }
          if (state) {
            state.hasHydrated = true
            console.log('[CatalogStore] Hydration complete')

            const validation = validateProductList(state.products)
            if (!validation.isValid) {
              console.warn('[CatalogStore] Data integrity issues:', validation.errors)
              toast.warning('Data Integrity Warning', {
                description: `Found ${validation.invalidIndices.length} products with issues`,
              })
            }

            try {
              await checkAllDataIntegrity()
            } catch (integrityError) {
              console.error('[CatalogStore] Integrity check failed:', integrityError)
            }
          }
        },
      }
    )
  )
)
