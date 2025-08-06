'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  imageUrl: string;
  title: string;
  budget: string;
  stock: number;
  price: number;
  slug: string;
}

export default function ProductCard({ imageUrl, title, budget, stock, price, slug }: ProductCardProps) {
  return (
    <Link href={`/catalog/${slug}`}>
      <div className="rounded-sm overflow-hidden w-full max-w-sm mx-auto cursor-pointer">
        <div className="bg-white relative w-full aspect-square">
          <Image
            src={imageUrl}
            alt={title}
            layout="fill"
            objectFit="contain"
            className="p-4"
          />
        </div>
        <div className="py-2 flex flex-col justify-between bg-transparent">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-lg font-bold text-gray-900">{budget}</p>
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
