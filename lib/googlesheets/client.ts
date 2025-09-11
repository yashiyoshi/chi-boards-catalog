import { google } from 'googleapis';

// The scope for reading and writing to Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// Path to your service account key file
// IMPORTANT: Replace with the actual path to your key file
const KEY_FILE_PATH = 'keyfile.json';

export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });

  return sheets;
}

interface GoogleSheetsProduct {
  productName: string;
  stock: string | number;
  price: number;
  category: string;
  status?: string;
  qtyIncrement?: string;
  profile?: string;
}

export async function getProductData() {
  const sheets = await getSheetsClient();
  const spreadsheetId = '1k0SNQkLJhUhsioxW2rJ6ENYXobY5irm3_LbztpKX6Ac';
  
  const allProducts: GoogleSheetsProduct[] = [];

  // Define sheet configurations
  const sheetConfigs = [
    {
      name: 'Switches',
      range: 'C8:H50',
      category: 'switches',
      columns: {
        productName: 0, // Column C
        stock: 1,       // Column D
        qtyIncrement: 2, // Column E
        price: 3        // Column F (price per switch)
      }
    },
    {
      name: 'Keycaps',
      range: 'C8:H50',
      category: 'keycaps', 
      columns: {
        productName: 0, // Column C
        sample: 1,      // Column D
        profile: 2,     // Column E
        stock: 3,       // Column F
        price: 4,       // Column G
        status: 5       // Column H
      }
    },
    {
      name: 'Keyboard',
      range: 'C8:H50',
      category: 'keyboards',
      columns: {
        productName: 0, // Column C
        stock: 1,       // Column D
        price: 2,       // Column E
        status: 3       // Column F
      }
    },
    {
      name: 'Accessories',
      range: 'C8:H50',
      category: 'accessories',
      columns: {
        productName: 0, // Column C
        stock: 1,       // Column D
        price: 2,       // Column E
        status: 3       // Column F
      }
    }
  ];

  // Fetch data from each sheet
  for (const config of sheetConfigs) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${config.name}!${config.range}`,
      });

      const rows = response.data.values;
      if (rows) {
        const products = rows
          .filter(row => {
            const productName = row[config.columns.productName];
            return productName && 
                   productName.trim() !== '' && 
                   productName !== 'PRODUCT' &&
                   !productName.toLowerCase().includes('link');
          })
          .map((row): GoogleSheetsProduct => {
            const productName = row[config.columns.productName] || '';
            let stock: string | number = 0;
            let price = 0;

            // Handle different stock formats
            if (config.columns.stock !== undefined) {
              const stockValue = row[config.columns.stock];
              if (stockValue) {
                if (stockValue.toLowerCase() === 'oos') {
                  stock = 'Out of Stock';
                } else if (typeof stockValue === 'string' && stockValue.includes('pcs')) {
                  stock = parseInt(stockValue.replace(/\D/g, '') || '0', 10);
                } else {
                  stock = parseInt(stockValue.toString() || '0', 10);
                }
              }
            }

            // Handle price extraction
            if (config.columns.price !== undefined) {
              const priceValue = row[config.columns.price];
              if (priceValue) {
                price = parseFloat(priceValue.toString().replace(/[₱,]/g, '') || '0');
              }
            }

            return {
              productName,
              stock,
              price,
              category: config.category,
              status: config.columns.status !== undefined ? row[config.columns.status] : undefined,
              qtyIncrement: config.columns.qtyIncrement !== undefined ? row[config.columns.qtyIncrement] : undefined,
              profile: config.columns.profile !== undefined ? row[config.columns.profile] : undefined,
            };
          });

        allProducts.push(...products);
      }
    } catch (error) {
      console.error(`Error fetching data from ${config.name} sheet:`, error);
    }
  }

  return allProducts;
}

// Function to get stock and price for a specific product by name
export async function getProductStockAndPrice(productName: string): Promise<{
  stock: string | number;
  price: number;
  category?: string;
  status?: string;
} | null> {
  const products = await getProductData();
  
  // Find exact match first
  let match = products.find(p => 
    p.productName.toLowerCase().trim() === productName.toLowerCase().trim()
  );
  
  // If no exact match, try partial match
  if (!match) {
    match = products.find(p => 
      p.productName.toLowerCase().includes(productName.toLowerCase()) ||
      productName.toLowerCase().includes(p.productName.toLowerCase())
    );
  }
  
  if (match) {
    return {
      stock: match.stock,
      price: match.price,
      category: match.category,
      status: match.status
    };
  }
  
  return null;
}

// Function to merge Contentful products with Google Sheets data
export async function mergeProductsWithSheets(contentfulProducts: any[]): Promise<any[]> {
  const sheetsProducts = await getProductData();
  
  return contentfulProducts.map(contentfulProduct => {
    // Try to find matching product in sheets data
    const match = sheetsProducts.find(sheetProduct => {
      const contentfulName = contentfulProduct.productName?.toLowerCase().trim();
      const sheetName = sheetProduct.productName.toLowerCase().trim();
      
      return contentfulName === sheetName || 
             contentfulName?.includes(sheetName) || 
             sheetName.includes(contentfulName || '');
    });
    
    if (match) {
      return {
        ...contentfulProduct,
        stock: match.stock,
        price: match.price,
        sheetsCategory: match.category,
        status: match.status,
        isInStock: match.stock !== 'Out of Stock' && match.stock !== 'OOS' && 
                  (typeof match.stock === 'number' ? match.stock > 0 : false),
        hasSheetData: true
      };
    }
    
    // Return original product if no match found
    return {
      ...contentfulProduct,
      stock: 0,
      price: 0,
      isInStock: false,
      hasSheetData: false
    };
  });
}
