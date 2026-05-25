'use client'

import { useState, useCallback } from 'react'

/**
 * SSR-safe typed localStorage hook.
 * Initializes synchronously from localStorage on the client (lazy initializer —
 * no extra render cycle), falls back to initialValue during SSR.
 *
 * Usage:
 *   const [waterMl, setWaterMl] = useLocalStorage('water_ml_2024-01-01', 0)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch { /* quota exceeded or private browsing */ }
        return next
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
