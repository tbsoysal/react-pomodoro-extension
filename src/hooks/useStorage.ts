/**
 * useStorage Hook
 * 
 * Generic custom hook for Chrome storage operations.
 * Provides React state synchronized with Chrome storage.
 */

import { useState, useEffect } from 'react';

/**
 * Hook return type
 */
interface UseStorageReturn<T> {
  value: T;                    // Current value
  setValue: (value: T) => void; // Update function
  loading: boolean;            // Loading indicator
}

/**
 * Custom hook for Chrome storage
 * 
 * Automatically loads value from storage on mount and provides
 * a setter that updates both React state and Chrome storage.
 * 
 * @param fetcher - Async function to fetch value from storage
 * @param setter - Async function to save value to storage
 * @param defaultValue - Default value if nothing in storage
 * @returns Current value, setter function, and loading status
 * 
 * @example
 * const { value: theme, setValue: setTheme } = useStorage(
 *   storage.getTheme,
 *   storage.setTheme,
 *   'circular'
 * );
 */
export const useStorage = <T,>(
  fetcher: () => Promise<T | null>,
  setter: (value: T) => Promise<void>,
  defaultValue: T
): UseStorageReturn<T> => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load initial value from storage
  useEffect(() => {
    const fetchValue = async () => {
      const stored = await fetcher();
      if (stored !== null) {
        setValue(stored);
      }
      setLoading(false);
    };
    fetchValue();
  }, []);

  /**
   * Update value in both state and storage
   * @param newValue - New value to save
   */
  const updateValue = async (newValue: T) => {
    setValue(newValue);
    await setter(newValue);
  };

  return { value, setValue: updateValue, loading };
};
