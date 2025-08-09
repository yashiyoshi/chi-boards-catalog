import * as React from 'react';
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

export default async function Catalog() {
  const products = await fetchProducts();

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
            <ProductCard key={product.slug} product={product} stock={0} price={0} />
          ))}
        </div>
      </div>
    </div>
  );
}
