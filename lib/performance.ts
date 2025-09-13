import { useEffect } from 'react';

// Performance monitoring utilities for development
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  
  static start(label: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      this.timers.set(label, performance.now());
    }
  }
  
  static end(label: string): number | null {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.timers.get(label);
      if (startTime) {
        const duration = performance.now() - startTime;
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        this.timers.delete(label);
        return duration;
      }
    }
    return null;
  }
  
  static measure(label: string, fn: () => Promise<any>): Promise<any> {
    this.start(label);
    return fn().finally(() => this.end(label));
  }
  
  static logNetworkTiming(): void {
    if (typeof window !== 'undefined' && window.performance && 'getEntriesByType' in window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        console.log('📊 Page Load Performance:');
        console.log(`  DNS Lookup: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
        console.log(`  TCP Connection: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
        console.log(`  Request/Response: ${(navigation.responseEnd - navigation.requestStart).toFixed(2)}ms`);
        console.log(`  DOM Content Loaded: ${(navigation.domContentLoadedEventEnd - navigation.fetchStart).toFixed(2)}ms`);
        console.log(`  Load Complete: ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`);
      }
    }
  }
  
  static logResourceTiming(): void {
    if (typeof window !== 'undefined' && window.performance && 'getEntriesByType' in window.performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const apiCalls = resources.filter(resource => resource.name.includes('/api/'));
      if (apiCalls.length > 0) {
        console.log('🌐 API Call Performance:');
        apiCalls.forEach(resource => {
          const duration = resource.responseEnd - resource.requestStart;
          console.log(`  ${resource.name}: ${duration.toFixed(2)}ms`);
        });
    }
  }
}
}

// Hook to monitor component performance
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    PerformanceMonitor.start(`${componentName} mount`);
    
    return () => {
      PerformanceMonitor.end(`${componentName} mount`);
    };
  }, [componentName]);
}

// Development only performance logging
export function enablePerformanceLogging(): void {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Log initial page performance
    setTimeout(() => {
      PerformanceMonitor.logNetworkTiming();
      PerformanceMonitor.logResourceTiming();
    }, 2000);
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0] as string;
      const label = `Fetch: ${url}`;
      
      PerformanceMonitor.start(label);
      
      return originalFetch.apply(this, args).then(response => {
        PerformanceMonitor.end(label);
        return response;
      }).catch(error => {
        PerformanceMonitor.end(label);
        throw error;
      });
    };
  }
}

export default PerformanceMonitor;
