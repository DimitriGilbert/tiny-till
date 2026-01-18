import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { TallyItem, TallyState, TallySummary } from '@tiny-till/types'
import { checkTallyIntegrity } from '@/lib/data-integrity'
import {
  validateTallyAddItem,
  validateTallyUpdateQuantity,
  validateTallyRemoveItem,
  validateTallyClear,
} from '@/lib/validation-helpers'
import { validateQuantity, validateQuantityString, type ValidationResult } from '@/lib/validators'

interface TallyStoreState {
  items: TallyState
  isActive: boolean
  lastModified: number | null
}

interface TallyActions {
  addItem: (productId: string, price: number, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number | string) => void
  incrementItem: (productId: string) => void
  clearTally: () => void
  getSummary: () => TallySummary
  hasActiveItems: () => boolean
  validateQuantityInput: (value: string | number) => ValidationResult
}

type TallyStore = TallyStoreState & TallyActions

const initialState: TallyStoreState = {
  items: new Map(),
  isActive: false,
  lastModified: null,
}

export const useTallyStore = create<TallyStore>()(
  devtools((set, get) => ({
    ...initialState,

    validateQuantityInput: (value: string | number): ValidationResult => {
      if (typeof value === 'string') {
        const trimmed = value.trim()

        if (trimmed.length === 0) {
          return { isValid: true }
        }

        if (!/^\d+$/.test(trimmed)) {
          return { isValid: false, error: 'Quantity must be a whole number' }
        }

        const numValue = parseInt(trimmed, 10)

        if (isNaN(numValue)) {
          return { isValid: false, error: 'Invalid quantity format' }
        }

        return validateQuantity(numValue)
      }

      return validateQuantity(value)
    },

    addItem: async (productId: string, price: number, quantity = 1) => {
      if (quantity <= 0) {
        throw new Error('Quantity must be positive')
      }

      const validationResult = await validateTallyAddItem(productId, price, quantity)
      if (!validationResult.isValid) {
        console.warn('[TallyStore] Validation failed:', validationResult.error)
        throw new Error(validationResult.error || 'Validation failed')
      }

      set((state) => {
        const newItems = new Map<string, TallyItem>(state.items)
        const existing = newItems.get(productId)

        if (existing) {
          newItems.set(productId, {
            ...existing,
            quantity: existing.quantity + quantity,
          })
        } else {
          newItems.set(productId, {
            productId,
            quantity,
            price,
          })
        }

        const newState = {
          items: newItems,
          isActive: true,
          lastModified: Date.now(),
        }

        console.log('[TallyStore] addItem', newState)
        return newState
      })
    },

    removeItem: (productId: string) => {
      set((state) => {
        const newItems = new Map<string, TallyItem>(state.items)
        newItems.delete(productId)

        const newState = {
          items: newItems,
          isActive: newItems.size > 0,
          lastModified: Date.now(),
        }

        console.log('[TallyStore] removeItem', newState)
        return newState
      })
    },

    updateQuantity: (productId: string, quantity: number | string) => {
      let numQuantity: number

      if (typeof quantity === 'string') {
        const validationResult = get().validateQuantityInput(quantity)

        if (!validationResult.isValid) {
          throw new Error(validationResult.error || 'Invalid quantity format')
        }

        const trimmed = quantity.trim()
        numQuantity = trimmed.length === 0 ? 0 : parseInt(trimmed, 10)
      } else {
        const validationResult = validateQuantity(quantity)

        if (!validationResult.isValid) {
          throw new Error(validationResult.error || 'Invalid quantity')
        }

        numQuantity = quantity
      }

      set((state) => {
        const newItems = new Map<string, TallyItem>(state.items)

        if (numQuantity === 0) {
          newItems.delete(productId)
        } else {
          const existing = newItems.get(productId)
          if (existing) {
            newItems.set(productId, {
              ...existing,
              quantity: numQuantity,
            })
          }
        }

        const newState = {
          items: newItems,
          isActive: newItems.size > 0,
          lastModified: Date.now(),
        }

        console.log('[TallyStore] updateQuantity', newState)
        return newState
      })
    },

    incrementItem: (productId: string) => {
      set((state) => {
        const newItems = new Map<string, TallyItem>(state.items)
        const existing = newItems.get(productId)

        if (existing) {
          newItems.set(productId, {
            ...existing,
            quantity: existing.quantity + 1,
          })
        }

        const newState = {
          items: newItems,
          isActive: true,
          lastModified: Date.now(),
        }

        console.log('[TallyStore] incrementItem', newState)
        return newState
      })
    },

    clearTally: () => {
      const newState = {
        items: new Map<string, TallyItem>(),
        isActive: false,
        lastModified: null,
      }

      set(newState)
      console.log('[TallyStore] clearTally', newState)
    },

    getSummary: () => {
      const items = get().items
      let total = 0
      let itemCount = 0

      items.forEach((item: TallyItem) => {
        total += item.price * item.quantity
        itemCount += item.quantity
      })

      return {
        total,
        itemCount,
        productCount: items.size,
      }
    },

    hasActiveItems: () => {
      return get().items.size > 0
    },
  }))
)
