'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import FilterPanel from '@/components/custom/filter-panel';
import Header from '@/components/custom/header';
import FilterBreadcrumbs from '@/components/custom/filter-breadcrumbs';
import ProductCard from '@/components/custom/product-card';
import { contentfulClient } from '@/lib/contentful/client';
import { Product } from '@/lib/types';

async function fetchProducts(): Promise<Product[]> {
  const res = await contentfulClient.getEntries({ content_type: 'product' });
  return res.items.map((item: any) => item.fields);
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url("/grid-bg-black.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Header />
      <div className="mx-12">
        <FilterPanel />
        <FilterBreadcrumbs />

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              stock={0}
              price={0}
              onProductClick={handleProductClick}
            />
          ))}
        </div>
      </div>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedProduct.productName}</h2>
            <p className="text-gray-700 mb-2">Budget: {selectedProduct.budget}</p>
            <p className="text-gray-700 mb-4">Description: {selectedProduct.description}</p>
            <button
              onClick={closeModal}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
