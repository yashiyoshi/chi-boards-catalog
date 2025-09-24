import { google } from 'googleapis';

// The scope for reading and writing to Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  
  if (!privateKey || !clientEmail) {
    console.error('Missing Google service account credentials:', {
      hasPrivateKey: !!privateKey,
      hasClientEmail: !!clientEmail
    });
    throw new Error('Missing Google service account credentials');
  }

  console.log('Attempting to authenticate with Google API...');
  
  try {
    // Process the private key to ensure proper formatting
    let processedPrivateKey = privateKey;
    
    // Handle different ways the private key might be stored
    if (privateKey.includes('\\n')) {
      // If stored with literal \n, replace with actual newlines
      processedPrivateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Remove any quotes that might wrap the key
    processedPrivateKey = processedPrivateKey.replace(/^"|"$/g, '');
    
    // Ensure the key starts and ends properly
    if (!processedPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format: missing BEGIN marker');
    }
    
    if (!processedPrivateKey.endsWith('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format: missing END marker');
    }

    console.log('Private key format validated successfully');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: "chi-boards-product-catalog",
        client_email: clientEmail,
        private_key: processedPrivateKey,
        client_id: "102884918149289299655",
      },
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('Google Sheets client created successfully');
    return sheets;
  } catch (error) {
    console.error('Error creating Google Sheets client:', error);
    throw error;
  }
}

interface GoogleSheetsProduct {
  productName: string;
  stock: string | number;
  price: number;
  category: string;
  status?: string;
  qtyIncrement?: number;
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
      range: 'C8:H150',
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
      range: 'C8:H150',
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
      range: 'C8:H150',
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
      range: 'C8:H150',
      category: 'accessories',
      columns: {
        productName: 0, // Column C
        stock: 1,       // Column D
        price: 2,       // Column E
        status: 3       // Column F
      }
    }
  ];

  try {
    // Batch all requests into a single API call for better performance
    const batchRanges = sheetConfigs.map(config => `${config.name}!${config.range}`);
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: batchRanges,
    });

    const valueRanges = response.data.valueRanges || [];
    
    // Process each sheet's data
    sheetConfigs.forEach((config, index) => {
      const rows = valueRanges[index]?.values;
      
      if (rows) {
        const filteredRows = rows.filter(row => {
          const productName = row[config.columns.productName];
          return productName && 
                 productName.trim() !== '' && 
                 productName !== 'PRODUCT' &&
                 !productName.toLowerCase().includes('link');
        });
        
        const products = filteredRows.map((row): GoogleSheetsProduct => {
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

            // Parse quantity increment
            let qtyIncrement = 5; // default for switches
            if (config.columns.qtyIncrement !== undefined) {
              const qtyIncrementValue = row[config.columns.qtyIncrement];
              if (qtyIncrementValue) {
                const parsed = parseInt(qtyIncrementValue.toString(), 10);
                if (!isNaN(parsed) && parsed > 0) {
                  qtyIncrement = parsed;
                }
              }
            }

            return {
              productName,
              stock,
              price,
              category: config.category,
              status: config.columns.status !== undefined ? row[config.columns.status] : undefined,
              qtyIncrement,
              profile: config.columns.profile !== undefined ? row[config.columns.profile] : undefined,
            };
          });

        allProducts.push(...products);
      }
    });
  } catch (error) {
    console.error('Error in batch fetch from Google Sheets:', error);
    throw error; // Re-throw to handle at API level
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
