import { useMemo } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { formatPrice } from '@tiny-till/types'

export function useCurrencyFormat() {
  const { locale } = useSettingsStore()

  const formatter = useMemo(() => {
    return (cents: number) => formatPrice(cents, locale)
  }, [locale])

  return formatter
}
