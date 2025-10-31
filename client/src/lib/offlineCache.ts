/**
 * Offline Cache Utility
 * 
 * This utility provides functionality to cache critical data for offline access,
 * using the browser's localStorage to store the most important client and prospect information.
 */

interface CacheConfig {
  key: string;
  expiryInMinutes: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const CACHE_KEYS = {
  CLIENTS: 'wealthrm_cached_clients',
  PROSPECTS: 'wealthrm_cached_prospects',
  CLIENT_DETAILS: 'wealthrm_cached_client_details_',
  USER_PROFILE: 'wealthrm_cached_user_profile',
  APPOINTMENTS: 'wealthrm_cached_appointments'
};

const DEFAULT_CONFIG: CacheConfig = {
  key: '',
  expiryInMinutes: 60 // 1 hour default expiry
};

/**
 * Saves data to the local cache with an expiration timestamp
 */
export function saveToCache<T>(data: T, config: Partial<CacheConfig> = {}): void {
  const { key, expiryInMinutes } = { ...DEFAULT_CONFIG, ...config };
  
  if (!key) {
    console.error('Cannot save to cache: No cache key provided');
    return;
  }
  
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now() + (expiryInMinutes * 60 * 1000)
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(cacheItem));
    console.log(`Data cached successfully with key: ${key}`);
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
}

/**
 * Retrieves data from the cache if it exists and hasn't expired
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const cachedItem = localStorage.getItem(key);
    
    if (!cachedItem) {
      return null;
    }
    
    const { data, timestamp }: CacheItem<T> = JSON.parse(cachedItem);
    
    // Check if the cached data has expired
    if (Date.now() > timestamp) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to retrieve cached data:', error);
    return null;
  }
}

/**
 * Checks if the browser is currently online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Clears all cached data
 */
export function clearAllCache(): void {
  Object.values(CACHE_KEYS).forEach(key => {
    if (typeof key === 'string' && !key.includes('_')) {
      localStorage.removeItem(key);
    } else if (typeof key === 'string' && key.endsWith('_')) {
      // For prefixed keys like CLIENT_DETAILS_, we need to find all matching items
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(storageKey => {
        if (storageKey.startsWith(key)) {
          localStorage.removeItem(storageKey);
        }
      });
    }
  });
}

/**
 * Clears specific cached data by key
 */
export function clearCache(key: string): void {
  localStorage.removeItem(key);
}