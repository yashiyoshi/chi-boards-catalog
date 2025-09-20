import { NextRequest, NextResponse } from 'next/server';
import { contentfulClient } from '@/lib/contentful/client';

// Cache for 10 minutes since basic info doesn't change often
export const revalidate = 600;

let cachedBasicData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching basic product info...');
    
    // Check cache first
    const now = Date.now();
    if (cachedBasicData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('API: Returning cached basic data');
      return NextResponse.json(cachedBasicData, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120',
        },
      });
    }
    
    // Fetch only basic product info from Contentful
    const contentfulResponse = await contentfulClient.getEntries({ 
      content_type: "product"
    });
    
    const basicProducts = contentfulResponse.items.map((item: any) => ({
      ...item.fields,
      hasSheetData: false, // Will be updated when stock data loads
      isInStock: false,
      stock: 'Loading...',
      price: '...',
      isLoadingDetails: true // Flag to show loading state
    }));
    
    console.log(`API: Returning ${basicProducts.length} basic products`);
    
    // Cache the result
    cachedBasicData = basicProducts;
    cacheTimestamp = now;
    
    return NextResponse.json(basicProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120',
      },
    });
    
  } catch (error) {
    console.error('API Error fetching basic products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basic products' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}