import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage persistent state stored in browser LocalStorage.
 *
 * @template T
 * @param {string} key - The unique storage key.
 * @param {T} initialValue - Default initial state if key is absent.
 * @returns {[T, (newValue: T | ((prev: T) => T)) => void]} Tuple containing value and setter function.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue(prev => {
        const resolved = typeof newValue === 'function' ? (newValue as (p: T) => T)(prev) : newValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {}
        return resolved;
      });
    },
    [key]
  );

  return [value, set] as const;
}
