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

async function exploreAllSheets() {
  try {
    console.log('🔄 Exploring all sheets in the Google Spreadsheet...');
    
    const sheets = await getSheetsClient();
    const spreadsheetId = '1k0SNQkLJhUhsioxW2rJ6ENYXobY5irm3_LbztpKX6Ac';
    
    // Get spreadsheet metadata
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    
    console.log(`📊 Spreadsheet: ${spreadsheetInfo.data.properties?.title}`);
    console.log('📋 Available sheets:');
    
    if (spreadsheetInfo.data.sheets) {
      for (let i = 0; i < spreadsheetInfo.data.sheets.length; i++) {
        const sheet = spreadsheetInfo.data.sheets[i];
        const sheetName = sheet.properties?.title;
        console.log(`\n🔍 Sheet ${i + 1}: "${sheetName}"`);
        
        try {
          // Get first few rows to understand structure
          const range = `${sheetName}!A1:Z10`;
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
          });
          
          const rows = response.data.values;
          if (rows && rows.length > 0) {
            console.log(`   📊 Has ${rows.length} rows of data (first 10 shown)`);
            console.log('   📋 Sample data:');
            rows.slice(0, 5).forEach((row, index) => {
              const displayRow = row.slice(0, 6).map(cell => `"${cell || ''}"`).join(', ');
              console.log(`      Row ${index + 1}: [${displayRow}...]`);
            });
          } else {
            console.log('   ⚠️  No data found');
          }
        } catch (error) {
          console.log(`   ❌ Error reading sheet: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Sheet exploration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

exploreAllSheets();
