"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import FilterPanel from "@/components/custom/filter-panel";
import Header from "@/components/custom/header";
import FilterBreadcrumbs from "@/components/custom/filter-breadcrumbs";
import ProductCard from "@/components/custom/product-card";
import { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Icon } from "lucide-react";

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isPromptGenerated, setIsPromptGenerated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const fetchedProducts = await response.json();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsPromptGenerated(false);
    setGeneratedPrompt("");
    setIsCopied(false);
  };

  const generatePrompt = () => {
    const prompt = `I need ${quantity} units of ${selectedProduct?.productName}.`;
    setGeneratedPrompt(prompt);
    setIsPromptGenerated(true);
    setIsCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url("/grid-bg-black.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <div className="mx-12">
        <FilterPanel />
        <FilterBreadcrumbs />

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="rounded-md overflow-hidden w-full max-w-sm mx-auto border-2 p-4 bg-gray-100 animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded"></div>
                <div className="py-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                onProductClick={handleProductClick}
              />
            ))
          )}
        </div>
      </div>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#fcfcfcfc] p-8 rounded-md shadow-lg max-w-md w-full relative">
            <div>
              <h2 className="text-xl font-bold mb-3 pr-8">
                {selectedProduct.productName}
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Budget:</span> {selectedProduct.budget}</p>
                <p><span className="font-medium">Description:</span> {selectedProduct.description}</p>
                {selectedProduct.hasSheetData && (
                  <>
                    <p><span className="font-medium">Current Stock:</span> 
                      <span className={selectedProduct.isInStock ? 'text-green-600' : 'text-red-600'}>
                        {typeof selectedProduct.stock === 'string' ? selectedProduct.stock : `${selectedProduct.stock} pcs`}
                      </span>
                    </p>
                    <p><span className="font-medium">Price:</span> ₱{selectedProduct.price || 'Contact for pricing'}</p>
                    <div className="bg-green-50 p-2 rounded text-xs">
                      ✅ Live data from inventory system
                    </div>
                  </>
                )}
                {!selectedProduct.hasSheetData && (
                  <div className="bg-yellow-50 p-2 rounded text-xs">
                    ⚠️ Stock and pricing info not available - contact for details
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p>Enter Desired Quantity:</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  className="w-24"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  min="1"
                />
                <Button variant={"default"} onClick={generatePrompt} className="flex-grow">
                  Generate Prompt
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2">Generated Prompt:</p>
              <div className="relative">
                <Input
                  value={isPromptGenerated ? generatedPrompt : ""}
                  placeholder={
                    isPromptGenerated
                      ? ""
                      : "You must first generate the prompt"
                  }
                  disabled={!isPromptGenerated}
                  className="w-full pr-16 bg-gray-100 text-gray-400"
                  readOnly
                />
                {isPromptGenerated && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {isCopied ? (
                      <span className="text-green-600 text-sm font-medium">
                        Copied!
                      </span>
                    ) : (
                      <button
                        onClick={copyToClipboard}
                        className="text-gray hover:text-gray-800 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isCopied && <p className="text-xs text-gray-400">The prompt has been successfully copied to your clipboard! Go to messenger and paste this into the chat</p>}

            <div className="flex flex-col justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  // Add messenger logic here
                  closeModal();
                }}
                className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!isCopied}
              >
                Go to Messenger
              </button>
              <button
                onClick={closeModal}
                className="bg-white text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
