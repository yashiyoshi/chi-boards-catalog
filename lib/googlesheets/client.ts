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

export async function getProductData() {
  const sheets = await getSheetsClient();

  const spreadsheetId = 'YOUR_SPREADSHEET_ID';
  const range = 'Sheet1!A2:C100'; // Replace with your sheet name and range

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;
  if (rows) {
    return rows.map((row) => ({
      productName: row[0],
      stock: parseInt(row[1], 10),
      price: parseFloat(row[2]),
    }));
  }

  return [];
}
