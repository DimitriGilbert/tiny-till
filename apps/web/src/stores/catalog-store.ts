import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type {
  Product,
  ProductInput,
  ProductUpdate,
  ProductList,
} from '@tiny-till/types'
import { generateUUID } from '@tiny-till/types'

interface CatalogState {
  products: ProductList
  isLoading: boolean
  error: string | null
}

interface CatalogActions {
  addProduct: (input: ProductInput) => void
  updateProduct: (id: string, updates: ProductUpdate) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type CatalogStore = CatalogState & CatalogActions

const initialState: CatalogState = {
  products: [],
  isLoading: false,
  error: null,
}

export const useCatalogStore = create<CatalogStore>()(
  devtools((set, get) => ({
    ...initialState,

    addProduct: (input: ProductInput) => {
      try {
        const now = Date.now()
        const product: Product = {
          ...input,
          id: generateUUID(),
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          products: [...state.products, product],
          error: null,
        }))

        console.log('[CatalogStore] addProduct', get())
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add product'
        set({ error: errorMessage })
        console.error('[CatalogStore] Error:', errorMessage)
      }
    },

    updateProduct: (id: string, updates: ProductUpdate) => {
      try {
        set((state) => ({
          products: state.products.map((product: Product) =>
            product.id === id
              ? {
                  ...product,
                  ...updates,
                  updatedAt: Date.now(),
                }
              : product
          ),
          error: null,
        }))

        console.log('[CatalogStore] updateProduct', get())
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update product'
        set({ error: errorMessage })
        console.error('[CatalogStore] Error:', errorMessage)
      }
    },

    deleteProduct: (id: string) => {
      try {
        set((state) => ({
          products: state.products.filter((product: Product) => product.id !== id),
          error: null,
        }))

        console.log('[CatalogStore] deleteProduct', get())
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete product'
        set({ error: errorMessage })
        console.error('[CatalogStore] Error:', errorMessage)
      }
    },

    getProduct: (id: string) => {
      return get().products.find((product: Product) => product.id === id)
    },

    clearError: () => {
      set({ error: null })
      console.log('[CatalogStore] clearError', get())
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading })
      console.log('[CatalogStore] setLoading', get())
    },
  }))
)
