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

  // Invalidate all stock-related cache entries
  invalidateStock(): void {
    for (const [key] of this.cache) {
      if (key.includes('stock') || key.includes('products')) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getStats(): { size: number; entries: Array<{ key: string; isStale: boolean; timestamp: number }> } {
    const entries = [];
    for (const [key, entry] of this.cache) {
      entries.push({
        key,
        isStale: Date.now() > entry.expiry,
        timestamp: entry.timestamp
      });
    }
    return { size: this.cache.size, entries };
  }
}

export const clientCache = new SimpleCache();

// Hook for cached fetch with improved caching strategy
export async function cachedFetch<T>(
  url: string, 
  options: RequestInit = {},
  cacheKey?: string,
  ttlSeconds: number = 300,
  forceRefresh: boolean = false
): Promise<T> {
  const key = cacheKey || url;
  
  // Force refresh bypasses cache entirely
  if (forceRefresh) {
    clientCache.invalidate(key);
  }
  
  // Try to get from cache first
  const cached = clientCache.get<T>(key);
  if (cached) {
    return cached;
  }
  
  // Check if we have stale data - be more conservative with stock data
  const stale = clientCache.getStale<T>(key);
  const isStockData = key.includes('stock') || url.includes('stock');
  
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

  // For stock data, prefer fresh data over stale to avoid inventory issues
  if (stale && !isStockData) {
    fetchPromise.catch(console.error); // Handle errors silently for background updates
    return stale;
  }
  
  // For stock data or when no stale data, wait for fresh data
  return fetchPromise;
}
