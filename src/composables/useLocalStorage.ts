import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useUIStore } from '@/stores/ui'

/**
 * A composable that synchronizes a reactive ref with localStorage
 * Handles JSON serialization/deserialization and provides type safety
 * Shows user notifications when storage quota is exceeded
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const uiStore = useUIStore()
  const storedValue = localStorage.getItem(key)
  const initialValue: T = storedValue !== null ? JSON.parse(storedValue) : defaultValue
  const value = ref<T>(initialValue) as Ref<T>

  // Watch for changes and persist to localStorage
  const stopWatch = watch(
    value,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error)
        
        // Check for quota exceeded error
        if (error instanceof DOMException) {
          if (error.name === 'QuotaExceededError' || error.code === 22) {
            uiStore.addNotification(
              'Your browser storage is full. Please clear some data or use a different browser.',
              'error'
            )
          }
        }
      }
    },
    { deep: true }
  )

  // Cleanup watcher on unmount
  onUnmounted(() => {
    stopWatch()
  })

  return value
}

/**
 * Listen for changes to a localStorage key from other tabs/windows
 */
export function useLocalStorageSync<T>(key: string, callback: (value: T) => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      try {
        callback(JSON.parse(event.newValue))
      } catch (error) {
        console.error(`Failed to parse ${key} from storage event:`, error)
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)

  const cleanup = () => {
    window.removeEventListener('storage', handleStorageChange)
  }

  return { cleanup }
}

/**
 * Clear a specific key from localStorage
 */
export function clearLocalStorageKey(key: string): void {
  localStorage.removeItem(key)
}

/**
 * Clear all keys matching a pattern from localStorage
 */
export function clearLocalStoragePattern(pattern: RegExp): void {
  const keysToRemove: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && pattern.test(key)) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

/**
 * Get the size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
  let total = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2
    }
  }
  return total
}

/**
 * Check if localStorage is available and has space
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Estimate localStorage quota (typically 5-10MB)
 */
export function estimateLocalStorageQuota(): number {
  try {
    const testString = 'x'.repeat(1024 * 1024) // 1MB
    let total = 0
    const data: string[] = []
    
    while (true) {
      try {
        localStorage.setItem('quota-test', testString)
        data.push(testString)
        total += testString.length
      } catch {
        break
      }
    }
    
    // Cleanup
    localStorage.removeItem('quota-test')
    
    return total
  } catch {
    return 0
  }
}
