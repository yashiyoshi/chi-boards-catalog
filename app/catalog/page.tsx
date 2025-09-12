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
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const fetchedProducts = await response.json();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
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
          {isLoading
            ? // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-md overflow-hidden w-full max-w-sm mx-auto border-2 p-4 bg-gray-100 animate-pulse"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded"></div>
                  <div className="py-2 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            : products.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
        </div>
      </div>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-[#fcfcfcfc] p-6 md:p-8 rounded-md shadow-lg w-full max-w-sm md:max-w-4xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #d1d5db, #9ca3af);
                border-radius: 10px;
                border: 1px solid #e5e7eb;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #9ca3af, #6b7280);
              }
              
              /* Firefox */
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #9ca3af #f1f1f1;
              }
            `}</style>
            {/* Desktop Layout */}
            <div className="hidden md:flex md:gap-8">
              {/* Product Image - Desktop Only */}
              <div className="flex-shrink-0">
                <div className="w-80 h-80 relative bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={`https:${selectedProduct.mainImage.fields.file.url}`}
                    alt={selectedProduct.productName}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>

              {/* Product Details - Desktop */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedProduct.productName}
                    </h2>
                    {selectedProduct.productCategory === 'Switches' && selectedProduct.switchType && (
                      <p className="text-lg text-gray-500 font-medium mt-1">{selectedProduct.switchType}</p>
                    )}
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 text-base text-gray-600">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="leading-relaxed text-sm text-gray-4600">
                      {selectedProduct.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Budget:</span>
                      <p className="font-semibold text-gray-900 text-base">{selectedProduct.budget}</p>
                    </div>

                    {selectedProduct.hasSheetData ? (
                      <>
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Current Stock:</span>
                          <p className={`font-semibold text-base ${
                            selectedProduct.isInStock ? "text-green-600" : "text-red-600"
                          }`}>
                            {typeof selectedProduct.stock === "string"
                              ? selectedProduct.stock
                              : `${selectedProduct.stock} pcs`}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-700 text-sm">Price:</span>
                          <p className="font-semibold text-gray-900 text-base">
                            ₱{selectedProduct.price || "Contact for pricing"}/pc
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <p className="font-medium">Stock and pricing info not available</p>
                            <p className="text-sm">Please contact us for current details</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Section - Desktop */}
                <div className="mt-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Enter Desired Quantity:</label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-24 text-center text-sm"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                        min="1"
                      />
                      <Button
                        variant="default"
                        onClick={generatePrompt}
                        className="flex-grow text-sm"
                      >
                        Generate Prompt
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Generated Prompt:</label>
                    <div className="relative">
                      <Input
                        value={isPromptGenerated ? generatedPrompt : ""}
                        placeholder={isPromptGenerated ? "" : "Generate a prompt first..."}
                        disabled={!isPromptGenerated}
                        className={`w-full pr-16 text-sm ${
                          isPromptGenerated 
                            ? "bg-gray-50 text-gray-900" 
                            : "bg-gray-100 text-gray-400"
                        }`}
                        readOnly
                      />
                      {isPromptGenerated && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          {isCopied ? (
                            <span className="text-green-600 text-sm font-medium">Copied!</span>
                          ) : (
                            <button
                              onClick={copyToClipboard}
                              className="text-gray-500 hover:text-gray-800 transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {isCopied && (
                      <p className="text-sm text-green-600 mt-3 p-3 bg-green-50 rounded border border-green-200">
                        ✓ Prompt copied successfully! Go to messenger and paste it into the chat.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={() => {
                        window.open('https://m.me/173538739173933', '_blank');
                        closeModal();
                      }}
                      className="bg-black text-white px-6 py-3 rounded font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={!isCopied}
                    >
                      Go to Messenger
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProduct.productName}
                  </h2>
                  {selectedProduct.productCategory === 'Switches' && selectedProduct.switchType && (
                    <p className="text-base text-gray-500 font-medium mt-1">{selectedProduct.switchType}</p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p className="mt-3">
                  <span className="font-medium text-sm">Budget:</span>{" "}
                  <span className="font-semibold text-gray-900 text-sm">{selectedProduct.budget}</span>
                </p>

                {selectedProduct.hasSheetData && (
                  <div className="mt-4 space-y-2">
                    <p>
                      <span className="font-medium text-sm">Current Stock:</span>{" "}
                      <span
                        className={`font-semibold ml-1 text-sm ${
                          selectedProduct.isInStock
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {typeof selectedProduct.stock === "string"
                          ? selectedProduct.stock
                          : `${selectedProduct.stock} pcs`}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-sm">Price:</span>{" "}
                      <span className="font-semibold text-gray-900 ml-1 text-sm">
                        ₱{selectedProduct.price || "Contact for pricing"}/pc
                      </span>
                    </p>
                  </div>
                )}
                {!selectedProduct.hasSheetData && (
                  <div className="bg-yellow-50 p-3 rounded text-sm mt-4">
                    <span className="font-medium">⚠️ Stock and pricing info not available</span> - contact for details
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <label className="text-sm font-medium text-gray-700">Enter Desired Quantity:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    className="w-24 text-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    min="1"
                  />
                  <Button
                    variant={"default"}
                    onClick={generatePrompt}
                    className="flex-grow text-sm"
                  >
                    Generate Prompt
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Generated Prompt:</label>
                <div className="relative">
                  <Input
                    value={isPromptGenerated ? generatedPrompt : ""}
                    placeholder={
                      isPromptGenerated
                        ? ""
                        : "Generate a prompt first..."
                    }
                    disabled={!isPromptGenerated}
                    className={`w-full pr-16 text-sm ${
                      isPromptGenerated 
                        ? "bg-gray-50 text-gray-400" 
                        : "bg-gray-100 text-gray-400"
                    }`}
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
                          className="text-gray-800"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {isCopied && (
                <p className="text-sm text-green-600 mt-3 p-3 bg-green-50 rounded border border-green-200">
                  ✓ Prompt copied successfully! Go to messenger and paste it into the chat.
                </p>
              )}

              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={() => {
                    window.open('https://m.me/173538739173933', '_blank');
                    closeModal();
                  }}
                  className="bg-black text-white px-6 py-3 rounded font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!isCopied}
                >
                  Go to Messenger
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
