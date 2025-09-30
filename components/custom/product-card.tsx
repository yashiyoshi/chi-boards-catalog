"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export default function ProductCard({
  product,
  onProductClick,
}: ProductCardProps) {
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
    if (typeof stock === "string") {
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
      // Format price with thousand separators and 2 decimal places
      const formattedPrice = price.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `₱${formattedPrice}`;
    }
    return "Contact for price";
  };

  return (
    <div
      className={`group rounded-md overflow-hidden w-full max-w-sm mx-auto border-2 p-4 transform transition-all duration-300 ease-in-out ${
        isLoadingDetails || !hasSheetData
          ? "bg-[#F8F8F8] cursor-pointer hover:shadow-lg hover:scale-105 hover:-translate-y-1"
          : isInStock
          ? "bg-[#F8F8F8] cursor-pointer hover:shadow-lg hover:scale-105 hover:-translate-y-1"
          : "bg-gray-100 opacity-75 cursor-not-allowed hover:opacity-60"
      }`}
      onClick={
        isInStock || isLoadingDetails || !hasSheetData
          ? () => onProductClick(product)
          : undefined
      }
    >
      <div className="relative w-full aspect-square">
        {/* Tags Container */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {/* Best Seller Tag */}
          {product.isBestSeller && (
            <div className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex flex-row gap-1 items-center">
              <span className="text-yellow">★</span>
              <span>Best Seller</span>
            </div>
          )}
          
          {/* On Sale Tag */}
          {product.isOnSale && (
            <div className="bg-yellow text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex flex-row gap-1 items-center">
              <span>🔥</span>
              <span className="text-black">On Sale</span>
            </div>
          )}
        </div>

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
          style={{ objectFit: "contain" }}
          className={`p-4 transition-all duration-500 ease-in-out ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          onLoad={() => setImageLoaded(true)}
          priority={false} // Lazy load images for better initial page performance
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {!isInStock && imageLoaded && !isLoadingDetails && hasSheetData && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300">
            <span className="text-white font-bold animate-pulse">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="py-2 flex flex-col justify-between bg-transparent">
        <div className="flex justify-between items-center">
          <div className="flex-1 pr-2">
            <h3 className="text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
              {product.productName}
            </h3>
            {product.productCategory === "Switches" && product.switchType && (
              <p className="text-xs text-gray-500 font-medium transition-colors duration-200">
                {product.switchType}
              </p>
            )}
            {product.productCategory === "Keycaps" &&
              product.keyboardProfile && (
                <p className="text-xs text-gray-500 font-medium transition-colors duration-200">
                  {product.keyboardProfile}
                </p>
              )}
          </div>
          <p className="text-lg font-bold text-gray-900 transition-all duration-200 group-hover:scale-110">
            {product.budget}
          </p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div
            className={`text-sm transition-colors duration-200 ${
              !isLoadingDetails && hasSheetData && !isInStock
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            Stock: {stockDisplay()}
          </div>
          <div className={`text-sm transition-colors duration-200 ${
            product.isOnSale ? "text-red-600 font-bold" : "text-gray-500"
          }`}>
            {priceDisplay()}/pc
          </div>
        </div>
      </div>
    </div>
  );
}
