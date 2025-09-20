'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use Google Sheets data if available, otherwise fallback to defaults
  const stock = product.stock || 0;
  const price = product.price || 0;
  const isInStock = product.isInStock ?? false;
  const hasSheetData = product.hasSheetData ?? false;
  const isLoadingDetails = product.isLoadingDetails ?? false;
  
  // Format stock display
  const stockDisplay = () => {
    if (isLoadingDetails) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-300 animate-pulse rounded"></div>
          <span className="text-gray-400">Loading...</span>
        </div>
      );
    }
    if (typeof stock === 'string') {
      return stock; // "Out of Stock", etc.
    }
    return `${stock}pcs`;
  };
  
  // Format price display  
  const priceDisplay = () => {
    if (isLoadingDetails) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-300 animate-pulse rounded"></div>
          <span className="text-gray-400">...</span>
        </div>
      );
    }
    if (price > 0) {
      return `₱${price}/pc`;
    }
    return 'Contact for price';
  };

  return (
    <div
      className={`rounded-md overflow-hidden w-full max-w-sm mx-auto border-2 p-4 ${
        isLoadingDetails || !hasSheetData
          ? 'bg-[#F8F8F8] cursor-pointer hover:shadow-md transition-shadow' 
          : isInStock 
            ? 'bg-[#F8F8F8] cursor-pointer hover:shadow-md transition-shadow' 
            : 'bg-gray-100 opacity-75 cursor-not-allowed'
      }`}
      onClick={(isInStock || isLoadingDetails || !hasSheetData) ? () => onProductClick(product) : undefined}
    >
      <div className="relative w-full aspect-square">
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <Image
          src={`https:${product.mainImage.fields.file.url}`}
          alt={product.productName}
          fill
          style={{ objectFit: 'contain' }}
          className={`p-4 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          priority={false} // Lazy load images for better initial page performance
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {!isInStock && imageLoaded && !isLoadingDetails && hasSheetData && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="py-2 flex flex-col justify-between bg-transparent">
        <div className="flex justify-between items-center">
          <div className="flex-1 pr-2">
            <h3 className="text-lg font-bold text-gray-900">{product.productName}</h3>
            {product.productCategory === 'Switches' && product.switchType && (
              <p className="text-xs text-gray-500 font-medium">{product.switchType}</p>
            )}
            {product.productCategory === 'Keycaps' && product.keyboardProfile && (
              <p className="text-xs text-gray-500 font-medium">{product.keyboardProfile}</p>
            )}
          </div>
          <p className="text-lg font-bold text-gray-900">{product.budget}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className={`text-sm ${!isLoadingDetails && hasSheetData && !isInStock ? 'text-red-500' : 'text-gray-500'}`}>
            Stock: {stockDisplay()}
          </div>
          <div className="text-sm text-gray-500">{priceDisplay()}</div>
        </div>
      </div>
    </div>
  );
}
