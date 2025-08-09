'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  stock: number;
  price: number;
}

export default function ProductCard({ product, stock, price }: ProductCardProps) {
  return (
    <Link href={`/catalog/${product.slug}`}>
      <div className="rounded-sm overflow-hidden w-full max-w-sm mx-auto cursor-pointer">
        <div className="bg-white relative w-full aspect-square">
          <Image
            src={`https:${product.mainImage.fields.file.url}`}
            alt={product.productName}
            layout="fill"
            objectFit="contain"
            className="p-4"
          />
        </div>
        <div className="py-2 flex flex-col justify-between bg-transparent">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{product.productName}</h3>
            <p className="text-lg font-bold text-gray-900">{product.budget}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Stock: {stock}pcs</p>
            <p className="text-sm text-gray-500">${price}/pc</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
