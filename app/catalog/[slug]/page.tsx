'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/custom/header';

export default function ProductDetailsPage() {
  const { slug } = useParams();

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
      <div className="mx-12 mt-8 text-white">
        <h1 className="text-4xl font-bold">Product Details</h1>
        <p className="mt-4 text-lg">Product Slug: {slug}</p>
      </div>
    </div>
  );
}
