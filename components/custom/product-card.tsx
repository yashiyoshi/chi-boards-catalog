'use client';

import Image from 'next/image';

import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  // Use Google Sheets data if available, otherwise fallback to defaults
  const stock = product.stock || 0;
  const price = product.price || 0;
  const isInStock = product.isInStock ?? false;
  const hasSheetData = product.hasSheetData ?? false;
  
  // Format stock display
  const stockDisplay = () => {
    if (typeof stock === 'string') {
      return stock; // "Out of Stock", etc.
    }
    return `${stock}pcs`;
  };
  
  // Format price display  
  const priceDisplay = () => {
    if (price > 0) {
      return `₱${price}`;
    }
    return 'Contact for price';
  };

  return (
    <div
      className={`rounded-md overflow-hidden w-full max-w-sm mx-auto cursor-pointer border-2 p-4 ${
        isInStock ? 'bg-[#F8F8F8]' : 'bg-gray-100 opacity-75'
      }`}
      onClick={() => onProductClick(product)}
    >
      <div className="relative w-full aspect-square">
        <Image
          src={`https:${product.mainImage.fields.file.url}`}
          alt={product.productName}
          layout="fill"
          objectFit="contain"
          className="p-4"
        />
        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="py-2 flex flex-col justify-between bg-transparent">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">{product.productName}</h3>
          <p className="text-lg font-bold text-gray-900">{product.budget}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-sm ${isInStock ? 'text-gray-500' : 'text-red-500'}`}>
            Stock: {stockDisplay()}
          </p>
          <p className="text-sm text-gray-500">{priceDisplay()}/pc</p>
        </div>
      </div>
    </div>
  );
}
