'use client';

import Image from 'next/image';

interface ProductCardProps {
  imageUrl: string;
  title: string;
  budget: string;
  stock: number;
  price: number;
}

export default function ProductCard({ imageUrl, title, budget, stock, price }: ProductCardProps) {
  return (
    <div className=" rounded-sm overflow-hidden w-full max-w-sm mx-auto">
      <div className="bg-white relative w-full aspect-square">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="contain"
          className="p-4"
        />
      </div>
      <div className=" py-2 flex flex-col justify-between bg-transparent">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-xl font-extrabold text-gray-900 ">{budget}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">Stock: {stock}pcs</p>
          <p className="text-sm text-gray-500 ">${price}/pc</p>
        </div>
      </div>
    </div>
  );
}