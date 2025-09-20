import { NextRequest, NextResponse } from 'next/server';
import { getProductData } from '@/lib/googlesheets/client';

// Cache for 2 minutes since stock data changes more frequently
export const revalidate = 120;

let cachedStockData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching stock and pricing data...');
    
    // Check cache first
    const now = Date.now();
    if (cachedStockData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('API: Returning cached stock data');
      return NextResponse.json(cachedStockData, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
        },
      });
    }
    
    // Fetch stock data from Google Sheets
    const sheetsData = await getProductData();
    console.log(`API: Found ${sheetsData.length} products with stock data`);
    
    // Create a lookup map for efficient access
    const stockLookup = new Map();
    sheetsData.forEach((sheetProduct: any) => {
      const normalizedName = sheetProduct.productName.toLowerCase().trim();
      stockLookup.set(normalizedName, {
        stock: sheetProduct.stock,
        price: sheetProduct.price,
        isInStock: sheetProduct.stock > 0 || sheetProduct.stock === 'In Stock'
      });
    });
    
    // Convert map to object for easier client-side access
    const stockData = Object.fromEntries(stockLookup);
    
    // Cache the result
    cachedStockData = stockData;
    cacheTimestamp = now;
    
    return NextResponse.json(stockData, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      },
    });
    
  } catch (error) {
    console.error('API Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}