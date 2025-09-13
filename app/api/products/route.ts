import { NextRequest, NextResponse } from 'next/server';
import { contentfulClient } from '@/lib/contentful/client';
import { getProductData } from '@/lib/googlesheets/client';

// Add caching with 5-minute revalidation
export const revalidate = 300; // 5 minutes

// In-memory cache for data deduplication
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(request: NextRequest) {
  try {
    console.log('API: Starting to fetch products...');
    
    // Check in-memory cache first
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('API: Returning cached data');
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }
    
    // Fetch both data sources in parallel for better performance
    const [contentfulResponse, sheetsData] = await Promise.allSettled([
      contentfulClient.getEntries({ content_type: "product" }),
      getProductData()
    ]);
    
    // Handle Contentful data
    if (contentfulResponse.status === 'rejected') {
      throw new Error('Failed to fetch Contentful data');
    }
    
    const contentfulProducts = contentfulResponse.value.items.map((item: any) => item.fields);
    console.log(`API: Found ${contentfulProducts.length} Contentful products`);
    
    let enhancedProducts;
    
    // Handle Google Sheets data
    if (sheetsData.status === 'fulfilled') {
      console.log(`API: Found ${sheetsData.value.length} products from Google Sheets`);
      
      // Create a lookup map for faster matching
      const sheetsLookup = new Map();
      sheetsData.value.forEach((sheetProduct: any) => {
        const normalizedName = sheetProduct.productName.toLowerCase().trim();
        sheetsLookup.set(normalizedName, sheetProduct);
      });
      
      // Enhanced products with optimized matching
      enhancedProducts = contentfulProducts.map((product: any) => {
        const contentfulName = product.productName?.toLowerCase().trim();
        
        // Try exact match first
        let match = sheetsLookup.get(contentfulName);
        
        // If no exact match, try partial matching (more expensive)
        if (!match && contentfulName) {
          for (const [sheetName, sheetProduct] of sheetsLookup) {
            if (contentfulName.includes(sheetName) || sheetName.includes(contentfulName)) {
              match = sheetProduct;
              break;
            }
          }
        }
        
        if (match) {
          return {
            ...product,
            stock: match.stock,
            price: match.price,
            isInStock: match.stock !== 'Out of Stock' && match.stock !== 'OOS' && 
                      (typeof match.stock === 'number' ? match.stock > 0 : false),
            hasSheetData: true
          };
        }
        
        return {
          ...product,
          stock: 0,
          price: 0,
          isInStock: false,
          hasSheetData: false
        };
      });
    } else {
      console.error('Google Sheets error:', sheetsData.reason);
      
      // Fallback to placeholder data if Google Sheets fails
      enhancedProducts = contentfulProducts.map((product: any) => ({
        ...product,
        stock: 'Contact for availability',
        price: 0,
        isInStock: false,
        hasSheetData: false
      }));
    }
    
    // Cache the result
    cachedData = enhancedProducts;
    cacheTimestamp = now;
    
    return NextResponse.json(enhancedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
