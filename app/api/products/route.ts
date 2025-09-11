import { NextRequest, NextResponse } from 'next/server';
import { contentfulClient } from '@/lib/contentful/client';
import { getProductData } from '@/lib/googlesheets/client';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Starting to fetch products...');
    
    // Fetch products from Contentful
    const res = await contentfulClient.getEntries({ content_type: "product" });
    const contentfulProducts = res.items.map((item: any) => item.fields);
    console.log(`API: Found ${contentfulProducts.length} Contentful products`);
    
    // Test Google Sheets connection
    try {
      const sheetsData = await getProductData();
      console.log(`API: Found ${sheetsData.length} products from Google Sheets`);
      
      // Enhanced products with Google Sheets data
      const enhancedProducts = contentfulProducts.map((product: any) => {
        // Find matching product in sheets
        const match = sheetsData.find((sheetProduct: any) => {
          const contentfulName = product.productName?.toLowerCase().trim();
          const sheetName = sheetProduct.productName.toLowerCase().trim();
          return contentfulName === sheetName || 
                 contentfulName?.includes(sheetName) || 
                 sheetName.includes(contentfulName || '');
        });
        
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
      
      return NextResponse.json(enhancedProducts);
    } catch (sheetsError) {
      console.error('Google Sheets error:', sheetsError);
      
      // Fallback to placeholder data if Google Sheets fails
      const enhancedProducts = contentfulProducts.map((product: any) => ({
        ...product,
        stock: 'Contact for availability',
        price: 0,
        isInStock: false,
        hasSheetData: false
      }));
      
      return NextResponse.json(enhancedProducts);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
