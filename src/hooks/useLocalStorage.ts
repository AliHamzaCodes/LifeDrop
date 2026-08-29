import { useState, useCallback } from 'react';

/**
 * useLocalStorage
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in replacement for `useState` that persists the value in localStorage.
 * Handles JSON serialization / deserialization automatically.
 * Safe for environments where `window` may not be available (SSR-friendly).
 *
 * @param {string} key          - The localStorage key.
 * @param {*}      initialValue - Fallback value if nothing is in storage.
 *
 * @returns {[any, Function, Function]} [storedValue, setValue, removeValue]
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'dark');
 *   const [prefs, setPrefs, clearPrefs] = useLocalStorage('userPrefs', {});
 */
const useLocalStorage = (key, initialValue) => {
  // Read from storage on first render only
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  /** Update state AND persist to localStorage */
  const setValue = useCallback(
    (value) => {
      try {
        // Allow functional updates: setValue(prev => ({ ...prev, x: 1 }))
        const valueToStore =
          typeof value === 'function' ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.warn(`[useLocalStorage] Failed to write key "${key}":`, err);
      }
    },
    [key, storedValue]
  );

  /** Remove the key from localStorage and reset to initialValue */
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to remove key "${key}":`, err);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
