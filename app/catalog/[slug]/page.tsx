import { contentfulClient } from '@/lib/contentful/client';
import { Product } from '@/lib/types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function fetchProduct(slug: string): Promise<Product> {
  const res = await contentfulClient.getEntries({
    content_type: 'product',
    'fields.slug': slug,
  });
  return res.items[0].fields as unknown as Product;
}

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
        <div className="flex">
          <div className="w-1/2">
            <Image
              src={`https:${product.mainImage.fields.file.url}`}
              alt={product.productName}
              width={400}
              height={400}
              objectFit="contain"
            />
          </div>
          <div className="w-1/2 pl-8">
            <h1 className="text-3xl font-bold">{product.productName}</h1>
            <div className="mt-4 text-lg">
              {documentToReactComponents(product.description)}
            </div>
            <div className="mt-4">
              <p><strong>Category:</strong> {product.productCategory}</p>
              <p><strong>Switch Type:</strong> {product.switchType}</p>
              <p><strong>Keyboard Profile:</strong> {product.keyboardProfile}</p>
              <p><strong>Budget:</strong> {product.budget}</p>
            </div>
            <Link href="/catalog">
              <Button className="mt-8">Close</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
