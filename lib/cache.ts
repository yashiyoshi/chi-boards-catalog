// Simple client-side cache utility for better performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const timestamp = Date.now();
    const expiry = timestamp + (ttlSeconds * 1000);
    
    this.cache.set(key, {
      data,
      timestamp,
      expiry
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get stale data while revalidating
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? Date.now() > entry.expiry : true;
  }
}

export const clientCache = new SimpleCache();

// Hook for cached fetch with stale-while-revalidate pattern
export async function cachedFetch<T>(
  url: string, 
  options: RequestInit = {},
  cacheKey?: string,
  ttlSeconds: number = 300
): Promise<T> {
  const key = cacheKey || url;
  
  // Try to get from cache first
  const cached = clientCache.get<T>(key);
  if (cached) {
    return cached;
  }
  
  // Check if we have stale data to return while fetching fresh
  const stale = clientCache.getStale<T>(key);
  
  // Fetch fresh data
  const fetchPromise = fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      clientCache.set(key, data, ttlSeconds);
      return data;
    });

  // If we have stale data, return it immediately and update in background
  if (stale) {
    fetchPromise.catch(console.error); // Handle errors silently for background updates
    return stale;
  }
  
  // Otherwise wait for fresh data
  return fetchPromise;
}
