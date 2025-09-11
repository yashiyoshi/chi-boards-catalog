import { NextResponse } from 'next/server';
import { getProductData } from '../../../lib/googlesheets/client';

export async function GET() {
  try {
    console.log('API route: Attempting to fetch product data from Google Sheets...');
    const data = await getProductData();
    console.log('API route: Successfully fetched data:');
    console.log(JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API route: Error fetching data from Google Sheets:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
