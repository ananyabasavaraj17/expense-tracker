import { useEffect, useRef, useState } from 'react';

/**
 * Safely reads and parses a JSON value from localStorage.
 *
 * @template T
 * @param {string} key
 * @param {T} fallbackValue
 * @param {(value: unknown) => boolean} [isValid]
 * @returns {T}
 */
function readStoredValue(key, fallbackValue, isValid) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallbackValue;
    }
    const parsed = JSON.parse(raw);
    if (isValid && !isValid(parsed)) {
      return fallbackValue;
    }
    return parsed;
  } catch {
    return fallbackValue;
  }
}

/**
 * Reusable React hook for persisting state in localStorage with debounced writes,
 * safe JSON error handling, and initial-load protection.
 *
 * @template T
 * @param {string} key - localStorage key.
 * @param {T} defaultValue - Fallback value when storage is empty or invalid.
 * @param {Object} [options]
 * @param {number} [options.debounceMs=200] - Debounce delay in milliseconds.
 * @param {(value: unknown) => boolean} [options.isValid] - Optional runtime validator for parsed data.
 * @returns {[T, import('react').Dispatch<import('react').SetStateAction<T>>]}
 */
export function useLocalStorage(key, defaultValue, options = {}) {
  const { debounceMs = 200, isValid } = options;

  const [storedValue, setStoredValue] = useState(() =>
    readStoredValue(key, defaultValue, isValid),
  );

  const latestValueRef = useRef(storedValue);
  const hasPendingWriteRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    latestValueRef.current = storedValue;
  }, [storedValue]);

  const isFirstEffectRef = useRef(true);

  useEffect(() => {
    if (isFirstEffectRef.current) {
      isFirstEffectRef.current = false;
      return undefined;
    }

    hasPendingWriteRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(latestValueRef.current));
        hasPendingWriteRef.current = false;
      } catch {
        // Ignore quota or private-mode storage errors safely.
      }
      timeoutRef.current = null;
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [key, storedValue, debounceMs]);

  useEffect(() => {
    function flushPendingWrite() {
      if (!hasPendingWriteRef.current) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      try {
        window.localStorage.setItem(key, JSON.stringify(latestValueRef.current));
        hasPendingWriteRef.current = false;
      } catch {
        // Ignore storage errors on unload.
      }
    }

    window.addEventListener('beforeunload', flushPendingWrite);
    return () => {
      window.removeEventListener('beforeunload', flushPendingWrite);
      flushPendingWrite();
    };
  }, [key]);

  return [storedValue, setStoredValue];
}
