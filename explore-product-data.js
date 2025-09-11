const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const KEY_FILE_PATH = 'keyfile.json';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
  });
  return google.sheets({ version: 'v4', auth });
}

async function exploreProductSheets() {
  try {
    console.log('🔄 Exploring product data structure in all sheets...');
    
    const sheets = await getSheetsClient();
    const spreadsheetId = '1k0SNQkLJhUhsioxW2rJ6ENYXobY5irm3_LbztpKX6Ac';
    
    // Focus on the main product category sheets
    const productSheets = ['Switches', 'Keycaps', 'Keyboard', 'Accessories'];
    
    for (const sheetName of productSheets) {
      console.log(`\n🔍 Analyzing "${sheetName}" sheet:`);
      
      try {
        // Get more rows to find the actual product data
        const range = `${sheetName}!A1:Z20`;
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
        
        const rows = response.data.values;
        if (rows && rows.length > 0) {
          console.log(`   📊 Found ${rows.length} rows`);
          
          // Look for header row and data
          let headerRowIndex = -1;
          let dataStartIndex = -1;
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowText = row.join('').toLowerCase();
            
            // Look for product/item headers
            if (rowText.includes('product') || rowText.includes('item') || rowText.includes('stock') || rowText.includes('price')) {
              headerRowIndex = i;
              dataStartIndex = i + 1;
              console.log(`   📋 Found header at row ${i + 1}: [${row.slice(0, 6).map(cell => `"${cell || ''}"`).join(', ')}...]`);
              break;
            }
          }
          
          // Show actual product data
          if (dataStartIndex > 0 && dataStartIndex < rows.length) {
            console.log('   📦 Sample product data:');
            for (let i = dataStartIndex; i < Math.min(dataStartIndex + 5, rows.length); i++) {
              const row = rows[i];
              if (row.some(cell => cell && cell.trim() !== '')) {
                console.log(`      Row ${i + 1}: [${row.slice(0, 8).map(cell => `"${cell || ''}"`).join(', ')}]`);
              }
            }
          } else {
            console.log('   🔍 Raw data (first 10 rows):');
            rows.slice(0, 10).forEach((row, index) => {
              if (row.some(cell => cell && cell.trim() !== '')) {
                console.log(`      Row ${index + 1}: [${row.slice(0, 8).map(cell => `"${cell || ''}"`).join(', ')}]`);
              }
            });
          }
        } else {
          console.log('   ⚠️  No data found');
        }
      } catch (error) {
        console.log(`   ❌ Error reading sheet: ${error.message}`);
      }
    }
    
    console.log('\n✅ Product sheet analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

exploreProductSheets();
