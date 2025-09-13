import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path } = body;

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate the products API and catalog page
    const pathsToRevalidate = [
      '/api/products',
      '/catalog',
      '/' // Home page if needed
    ];

    // Add specific path if provided
    if (path) {
      pathsToRevalidate.push(path);
    }

    // Revalidate all specified paths
    for (const pathToRevalidate of pathsToRevalidate) {
      revalidatePath(pathToRevalidate);
    }

    return NextResponse.json({ 
      message: 'Cache revalidated successfully',
      revalidated: pathsToRevalidate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating cache' }, 
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');

  if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    revalidatePath('/api/products');
    revalidatePath('/catalog');
    
    return NextResponse.json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error clearing cache' }, 
      { status: 500 }
    );
  }
}
