"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import FilterPanel from "@/components/custom/filter-panel";
import Header from "@/components/custom/header";
import FilterBreadcrumbs from "@/components/custom/filter-breadcrumbs";
import ProductCard from "@/components/custom/product-card";
import ProductSkeleton from "@/components/custom/product-skeleton";
import { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cachedFetch } from "@/lib/cache";

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isPromptGenerated, setIsPromptGenerated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  // Multi-step modal states
  const [currentStep, setCurrentStep] = useState(1);
  const [contactDetails, setContactDetails] = useState({
    fullName: "",
    contactNumber: ""
  });
  const [deliveryOption, setDeliveryOption] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Use cached fetch with stale-while-revalidate for better performance
        const fetchedProducts = await cachedFetch<Product[]>(
          "/api/products",
          {
            headers: {
              'Cache-Control': 'max-age=300',
            },
          },
          'products',
          300 // 5 minutes cache
        );
        
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
    // Set initial quantity based on product category
    if (product.productCategory === 'Switches') {
      setQuantity(5);
    } else {
      setQuantity(1);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsPromptGenerated(false);
    setGeneratedPrompt("");
    setIsCopied(false);
    setShowError(false);
    setErrorMessage("");
    setQuantity(1); // Reset to default quantity
    
    // Reset multi-step modal states
    setCurrentStep(1);
    setContactDetails({ fullName: "", contactNumber: "" });
    setDeliveryOption("");
    setDeliveryAddress("");
    setPaymentMethod("");
    setTotalAmount(0);
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  const handleBuyNow = () => {
    // Ensure quantity is positive
    if (quantity <= 0) {
      showErrorMessage('Quantity must be greater than 0');
      return;
    }
    
    // Validate quantity against stock if available
    if (selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number') {
      if (quantity > selectedProduct.stock) {
        showErrorMessage(`Quantity cannot exceed available stock (${selectedProduct.stock} pieces)`);
        return;
      }
    }
    
    // Validate increments of 5 for switches
    if (selectedProduct?.productCategory === 'Switches' && quantity % 5 !== 0) {
      showErrorMessage('For switches, quantity must be in increments of 5 (e.g., 5, 10, 15, 20...)');
      return;
    }
    
    // Calculate total amount
    let calculatedTotal = 0;
    if (selectedProduct?.hasSheetData && selectedProduct?.price && selectedProduct.price > 0) {
      calculatedTotal = quantity * selectedProduct.price;
    }
    setTotalAmount(calculatedTotal);
    
    // Clear any previous errors and proceed to next step
    setShowError(false);
    setErrorMessage("");
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 2) {
      // Validate contact details
      if (!contactDetails.fullName.trim()) {
        showErrorMessage('Please enter your full name');
        return;
      }
      if (!contactDetails.contactNumber.trim()) {
        showErrorMessage('Please enter your contact number');
        return;
      }
    } else if (currentStep === 3) {
      // Validate delivery option
      if (!deliveryOption) {
        showErrorMessage('Please select delivery or pickup option');
        return;
      }
      if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
        showErrorMessage('Please enter your delivery address');
        return;
      }
    } else if (currentStep === 4) {
      // Validate payment method
      if (!paymentMethod) {
        showErrorMessage('Please select a payment method');
        return;
      }
    }
    
    setShowError(false);
    setErrorMessage("");
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setShowError(false);
    setErrorMessage("");
    setCurrentStep(prev => prev - 1);
  };

  const generateFinalPrompt = () => {
    let prompt = `📋 ORDER DETAILS:\n\n`;
    prompt += `Customer: ${contactDetails.fullName}\n`;
    prompt += `Contact: ${contactDetails.contactNumber}\n\n`;
    
    prompt += `🛍️ PRODUCT:\n`;
    prompt += `${selectedProduct?.productName} - ${quantity} pieces\n`;
    
    prompt += `📦 DELIVERY:\n`;
    if (deliveryOption === 'delivery') {
      prompt += `Delivery to: ${deliveryAddress}\n`;
      prompt += `(Near UM Matina area only)\n`;
      prompt += `Delivery Fee: To be calculated and confirmed\n\n`;
    } else {
      prompt += `Pickup at store\n`;
      prompt += `Delivery Fee: Free (Pickup)\n\n`;
    }
    
    prompt += `💰 TOTAL AMOUNT:\n`;
    const finalAmount = selectedProduct?.hasSheetData && selectedProduct?.price && selectedProduct.price > 0 
      ? totalAmount.toLocaleString() 
      : 'Contact for pricing';
    prompt += `₱${finalAmount}\n\n`;
    
    prompt += `💳 PAYMENT METHOD: ${paymentMethod.toUpperCase()}\n\n`;
    prompt += `📸 Please find attached the screenshot of my payment receipt.\n\n`;
    prompt += `Thank you for your service! Looking forward to receiving my order.`;
    
    setGeneratedPrompt(prompt);
    setIsPromptGenerated(true);
    setIsCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedPrompt);
        setIsCopied(true);
      } else {
        // Fallback for older browsers or non-HTTPS environments
        const textArea = document.createElement('textarea');
        textArea.value = generatedPrompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setIsCopied(true);
        } catch (err) {
          console.error('Fallback copy failed: ', err);
          // If both methods fail, show the text for manual copying
          alert(`Copy this text manually:\n\n${generatedPrompt}`);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // If modern API fails, try fallback
      try {
        const textArea = document.createElement('textarea');
        textArea.value = generatedPrompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopied(true);
      } catch (fallbackErr) {
        console.error('All copy methods failed: ', fallbackErr);
        alert(`Copy this text manually:\n\n${generatedPrompt}`);
      }
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
            <ProductSkeleton count={8} />
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

      {/* Footer - Full Width */}
      <footer className="mt-16 w-full relative overflow-hidden">
        {/* Logo overlay on footer */}
        <div className="absolute top-0 left-1/4 transform -translate-x-1/2 z-10">
          <img
            src="/chiboards-white.png"
            alt="Chi Boards Logo"
            className="w-auto"
            style={{ height: "30vw", minHeight: "160px", maxHeight: "700px" }}
          />
        </div>

        {/* Text area overlay on footer - positioned to the right */}
        <div
          className="absolute z-20"
          style={{
            top: "2vw",
            right: "8vw"
          }}
        >
          <p
            className="text-[#F8F8F8] tracking-wider italic"
            style={{ fontSize: "4vw", fontFamily: "Inter, sans-serif" }}
          >
            CHI BOARDS
          </p>
        </div>

        <img
          src="/footer.jpg"
          alt="Chi Boards Footer"
          className="w-full h-auto"
        />
      </footer>

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
              {currentStep === 1 ? (
                <>
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
                        {selectedProduct.productCategory === "Switches" &&
                          selectedProduct.switchType && (
                            <p className="text-lg text-gray-500 font-medium mt-1">
                              {selectedProduct.switchType}
                            </p>
                          )}
                      </div>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
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
                          <span className="font-medium text-gray-700 text-sm">
                            Budget:
                          </span>
                          <p className="font-semibold text-gray-900 text-base">
                            {selectedProduct.budget}
                          </p>
                        </div>

                        {selectedProduct.hasSheetData ? (
                          <>
                            <div>
                              <span className="font-medium text-gray-700 text-sm">
                                Current Stock:
                              </span>
                              <p
                                className={`font-semibold text-base ${
                                  selectedProduct.isInStock
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {typeof selectedProduct.stock === "string"
                                  ? selectedProduct.stock
                                  : `${selectedProduct.stock} pcs`}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700 text-sm">
                                Price:
                              </span>
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
                                <p className="font-medium">
                                  Stock and pricing info not available
                                </p>
                                <p className="text-sm">
                                  Please contact us for current details
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Section - Desktop */}
                    <div className="mt-8 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Enter Desired Quantity:
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedProduct?.productCategory === 'Switches') {
                                  const newValue = Math.max(5, quantity - 5);
                                  setQuantity(newValue);
                                } else {
                                  const newValue = Math.max(1, quantity - 1);
                                  setQuantity(newValue);
                                }
                              }}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                            >
                              -
                            </button>
                            <Input
                              type="number"
                              placeholder="Qty"
                              className="w-20 text-center text-sm border-0 focus:ring-0"
                              value={quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value) && value > 0) {
                                  if (selectedProduct?.productCategory === 'Switches') {
                                    // For switches, round to nearest multiple of 5, minimum 5
                                    const roundedValue = Math.max(5, Math.round(value / 5) * 5);
                                    setQuantity(roundedValue);
                                  } else {
                                    setQuantity(value);
                                  }
                                } else if (e.target.value === '') {
                                  setQuantity(selectedProduct?.productCategory === 'Switches' ? 5 : 1);
                                }
                              }}
                              min={selectedProduct?.productCategory === 'Switches' ? 5 : 1}
                              max={selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' ? selectedProduct.stock : undefined}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedProduct?.productCategory === 'Switches') {
                                  const maxStock = selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' ? selectedProduct.stock : 9999;
                                  const newValue = Math.min(maxStock, quantity + 5);
                                  setQuantity(newValue);
                                } else {
                                  const maxStock = selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' ? selectedProduct.stock : 9999;
                                  const newValue = Math.min(maxStock, quantity + 1);
                                  setQuantity(newValue);
                                }
                              }}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <Button
                            variant="default"
                            onClick={handleBuyNow}
                            className="flex-grow text-sm"
                          >
                            Buy Now
                          </Button>
                        </div>
                        {selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' && (
                          <p className="text-xs text-gray-500 mt-2">
                            Maximum available: {selectedProduct.stock} pieces
                          </p>
                        )}
                        
                        {/* Error Message - Desktop */}
                        {showError && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700 flex items-center gap-2">
                              <span className="text-red-500">⚠️</span>
                              {errorMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Multi-step forms for desktop */
                <div className="w-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Order: {selectedProduct.productName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Quantity: {quantity} pieces
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Multi-step form will be rendered here based on currentStep */}
                  {currentStep === 2 && (
                    <div className="mt-8 space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Contact Details</h3>
                        <p className="text-sm text-gray-600 mt-1">Step 1 of 4</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your full name"
                            className="w-full text-sm"
                            value={contactDetails.fullName}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              fullName: e.target.value
                            }))}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Number *
                          </label>
                          <Input
                            type="tel"
                            placeholder="09XX XXX XXXX"
                            className="w-full text-sm"
                            value={contactDetails.contactNumber}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              contactNumber: e.target.value
                            }))}
                          />
                        </div>
                      </div>

                      {/* Error Message */}
                      {showError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 flex items-center gap-2">
                            <span className="text-red-500">⚠️</span>
                            {errorMessage}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          onClick={handleNextStep}
                          className="w-full text-sm"
                        >
                          Continue to Delivery Options
                        </Button>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                        >
                          Back to Product Details
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="mt-8 space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Delivery Options</h3>
                        <p className="text-sm text-gray-600 mt-1">Step 2 of 4</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            How would you like to receive your order? *
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="deliveryOption"
                                value="pickup"
                                checked={deliveryOption === 'pickup'}
                                onChange={(e) => setDeliveryOption(e.target.value)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Pickup at store</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="deliveryOption"
                                value="delivery"
                                checked={deliveryOption === 'delivery'}
                                onChange={(e) => setDeliveryOption(e.target.value)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Delivery (Near UM Matina only)</span>
                            </label>
                          </div>
                        </div>
                        
                        {deliveryOption === 'delivery' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delivery Address *
                            </label>
                            <textarea
                              placeholder="Enter your complete address (near UM Matina area only)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                            />
                          </div>
                        )}
                        
                        {deliveryOption === 'delivery' && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                              <span className="text-blue-600 text-lg">ℹ️</span>
                              <div>
                                <p className="text-sm font-medium text-blue-900">Delivery Fee Calculation</p>
                                <p className="text-sm text-blue-800 mt-1">
                                  The delivery fee will be calculated based on your location and communicated to you after we receive your order details and payment screenshot.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Error Message */}
                      {showError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 flex items-center gap-2">
                            <span className="text-red-500">⚠️</span>
                            {errorMessage}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          onClick={handleNextStep}
                          className="w-full text-sm"
                        >
                          Continue to Payment
                        </Button>
                        <button
                          onClick={handlePrevStep}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                        >
                          Back to Contact Details
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="mt-8 space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
                        <p className="text-sm text-gray-600 mt-1">Step 3 of 4</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Subtotal:</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₱{totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Delivery Fee:</span>
                            <span className="text-sm text-gray-600">
                              {deliveryOption === 'delivery' ? 'To be calculated' : 'Free (Pickup)'}
                            </span>
                          </div>
                          <div className="border-t border-gray-300 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                              <span className="text-base font-semibold text-gray-900">
                                {deliveryOption === 'delivery' 
                                  ? `₱${totalAmount}` 
                                  : `₱${totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Payment Method *
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="gcash"
                                checked={paymentMethod === 'gcash'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">GCash</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="bpi"
                                checked={paymentMethod === 'bpi'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">BPI</span>
                            </label>
                          </div>
                        </div>
                        
                        {paymentMethod && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-center">
                              <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center mb-4">
                                {/* QR Code placeholder - you'll need to add actual QR codes */}
                                <div className="text-center">
                                  <div className="w-32 h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">QR Code</span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-700">
                                    {paymentMethod.toUpperCase()} Payment
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-blue-700 font-medium">
                                Scan this QR code to pay ₱{totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Error Message */}
                      {showError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 flex items-center gap-2">
                            <span className="text-red-500">⚠️</span>
                            {errorMessage}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          onClick={handleNextStep}
                          className="w-full text-sm"
                          disabled={!paymentMethod}
                        >
                          Continue to Order Summary
                        </Button>
                        <button
                          onClick={handlePrevStep}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                        >
                          Back to Delivery Options
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="mt-8 space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Order Summary</h3>
                        <p className="text-sm text-gray-600 mt-1">Step 4 of 4</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Customer:</p>
                          <p className="text-sm text-gray-900">{contactDetails.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Contact:</p>
                          <p className="text-sm text-gray-900">{contactDetails.contactNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Product:</p>
                          <p className="text-sm text-gray-900">{selectedProduct?.productName} × {quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery:</p>
                          <p className="text-sm text-gray-900">
                            {deliveryOption === 'delivery' ? `Delivery to: ${deliveryAddress}` : 'Pickup at store'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Payment:</p>
                          <p className="text-sm text-gray-900">{paymentMethod.toUpperCase()}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Subtotal:</span>
                            <span className="text-sm text-gray-900">
                              ₱{totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Delivery Fee:</span>
                            <span className="text-sm text-gray-600">
                              {deliveryOption === 'delivery' ? 'To be calculated' : 'Free'}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-base font-semibold text-gray-900">Total:</span>
                              <span className="text-base font-semibold text-gray-900">
                                {deliveryOption === 'delivery' 
                                  ? `₱${totalAmount}` 
                                  : `₱${totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          📸 <strong>Important:</strong> After clicking "Generate Prompt" below, please take a screenshot of your payment receipt and send both the generated prompt and receipt screenshot to our messenger.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Generated Order Prompt:
                        </label>
                        {!isPromptGenerated ? (
                          <Button
                            onClick={generateFinalPrompt}
                            className="w-full text-sm mb-3"
                          >
                            Generate Order Prompt
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <textarea
                              value={generatedPrompt}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 resize-none"
                              rows={12}
                            />
                            <Button
                              onClick={copyToClipboard}
                              className="w-full text-sm"
                              variant={isCopied ? "default" : "outline"}
                            >
                              {isCopied ? "✓ Copied to Clipboard!" : "Copy Prompt to Clipboard"}
                            </Button>
                          </div>
                        )}
                        
                      </div>

                      <div className="flex flex-col gap-3 pt-4">
                        <button
                          onClick={() => {
                            window.open("https://m.me/173538739173933", "_blank");
                            closeModal();
                          }}
                          className="bg-black text-white px-6 py-3 rounded font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={!isCopied}
                        >
                          Go to Messenger
                        </button>
                        <button
                          onClick={handlePrevStep}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                        >
                          Back to Payment
                        </button>
                        <button
                          onClick={closeModal}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              {currentStep === 1 ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedProduct.productName}
                      </h2>
                      {selectedProduct.productCategory === "Switches" &&
                        selectedProduct.switchType && (
                          <p className="text-base text-gray-500 font-medium mt-1">
                            {selectedProduct.switchType}
                          </p>
                        )}
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <p className="mt-3">
                      <span className="font-medium text-sm">Budget:</span>{" "}
                      <span className="font-semibold text-gray-900 text-sm">
                        {selectedProduct.budget}
                      </span>
                    </p>

                    {selectedProduct.hasSheetData && (
                      <div className="mt-4 space-y-2">
                        <p>
                          <span className="font-medium text-sm">
                            Current Stock:
                          </span>{" "}
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
                        <span className="font-medium">
                          ⚠️ Stock and pricing info not available
                        </span>{" "}
                        - contact for details
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <label className="text-sm font-medium text-gray-700">
                      Enter Desired Quantity:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedProduct?.productCategory === 'Switches') {
                              const newValue = Math.max(5, quantity - 5);
                              setQuantity(newValue);
                            } else {
                              const newValue = Math.max(1, quantity - 1);
                              setQuantity(newValue);
                            }
                          }}
                          className="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-sm"
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="w-16 text-center text-sm border-0 focus:ring-0"
                          value={quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value > 0) {
                              if (selectedProduct?.productCategory === 'Switches') {
                                // For switches, round to nearest multiple of 5, minimum 5
                                const roundedValue = Math.max(5, Math.round(value / 5) * 5);
                                setQuantity(roundedValue);
                              } else {
                                setQuantity(value);
                              }
                            } else if (e.target.value === '') {
                              setQuantity(selectedProduct?.productCategory === 'Switches' ? 5 : 1);
                            }
                          }}
                          min={selectedProduct?.productCategory === 'Switches' ? 5 : 1}
                          max={selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' ? selectedProduct.stock : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedProduct?.productCategory === 'Switches') {
                              const maxStock = selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' ? selectedProduct.stock : 9999;
                              const newValue = Math.min(maxStock, quantity + 5);
                              setQuantity(newValue);
                            } else {
                              const maxStock = selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' ? selectedProduct.stock : 9999;
                              const newValue = Math.min(maxStock, quantity + 1);
                              setQuantity(newValue);
                            }
                          }}
                          className="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        variant={"default"}
                        onClick={handleBuyNow}
                        className="flex-grow text-sm"
                      >
                        Buy Now
                      </Button>
                    </div>
                    {selectedProduct?.hasSheetData && typeof selectedProduct.stock === 'number' && (
                      <p className="text-xs text-gray-500">
                        Maximum available: {selectedProduct.stock} pieces
                      </p>
                    )}
                    
                    {/* Error Message - Mobile */}
                    {showError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700 flex items-center gap-2">
                          <span className="text-red-500">⚠️</span>
                          {errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Multi-step forms for mobile */
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Order: {selectedProduct.productName}
                      </h2>
                      <p className="text-xs text-gray-600">
                        Quantity: {quantity} pieces
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Multi-step forms for mobile - same structure as desktop */}
              {currentStep === 2 && (
                <div className="mt-6 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                    <p className="text-xs text-gray-600 mt-1">Step 1 of 4</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full text-sm"
                        value={contactDetails.fullName}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          fullName: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <Input
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        className="w-full text-sm"
                        value={contactDetails.contactNumber}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          contactNumber: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {/* Error Message - Mobile */}
                  {showError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleNextStep}
                      className="w-full text-sm"
                    >
                      Continue to Delivery Options
                    </Button>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                    >
                      Back to Product Details
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="mt-6 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Delivery Options</h3>
                    <p className="text-xs text-gray-600 mt-1">Step 2 of 4</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How would you like to receive your order? *
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="deliveryOption"
                            value="pickup"
                            checked={deliveryOption === 'pickup'}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Pickup at store</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="deliveryOption"
                            value="delivery"
                            checked={deliveryOption === 'delivery'}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Delivery (Near UM Matina only)</span>
                        </label>
                      </div>
                    </div>
                    
                    {deliveryOption === 'delivery' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Address *
                        </label>
                        <textarea
                          placeholder="Enter your complete address (near UM Matina area only)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                    )}
                    
                    {deliveryOption === 'delivery' && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600">ℹ️</span>
                          <div>
                            <p className="text-xs font-medium text-blue-900">Delivery Fee Calculation</p>
                            <p className="text-xs text-blue-800 mt-1">
                              The delivery fee will be calculated based on your location and communicated after we receive your order and payment screenshot.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message - Mobile */}
                  {showError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleNextStep}
                      className="w-full text-sm"
                    >
                      Continue to Payment
                    </Button>
                    <button
                      onClick={handlePrevStep}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                    >
                      Back to Contact Details
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="mt-6 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                    <p className="text-xs text-gray-600 mt-1">Step 3 of 4</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Subtotal:</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₱{totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Delivery Fee:</span>
                        <span className="text-xs text-gray-600">
                          {deliveryOption === 'delivery' ? 'To be calculated' : 'Free (Pickup)'}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-gray-900">Total:</span>
                          <span className="text-base font-semibold text-gray-900">
                            {deliveryOption === 'delivery' 
                              ? `₱${totalAmount}` 
                              : `₱${totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Payment Method *
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="gcash"
                            checked={paymentMethod === 'gcash'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">GCash</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bpi"
                            checked={paymentMethod === 'bpi'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">BPI</span>
                        </label>
                      </div>
                    </div>
                    
                    {paymentMethod && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <div className="w-40 h-40 mx-auto bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center mb-3">
                            {/* QR Code placeholder - you'll need to add actual QR codes */}
                            <div className="text-center">
                              <div className="w-28 h-28 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                <span className="text-xs text-gray-500">QR Code</span>
                              </div>
                              <p className="text-xs font-medium text-gray-700">
                                {paymentMethod.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-blue-700 font-medium">
                            Scan QR code to pay ₱{totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message - Mobile */}
                  {showError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleNextStep}
                      className="w-full text-sm"
                      disabled={!paymentMethod}
                    >
                      Continue to Order Summary
                    </Button>
                    <button
                      onClick={handlePrevStep}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                    >
                      Back to Delivery Options
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="mt-6 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                    <p className="text-xs text-gray-600 mt-1">Step 4 of 4</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Customer:</p>
                      <p className="text-sm text-gray-900">{contactDetails.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Contact:</p>
                      <p className="text-sm text-gray-900">{contactDetails.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Product:</p>
                      <p className="text-sm text-gray-900">{selectedProduct?.productName} × {quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Delivery:</p>
                      <p className="text-sm text-gray-900">
                        {deliveryOption === 'delivery' ? `Delivery to: ${deliveryAddress}` : 'Pickup at store'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Payment:</p>
                      <p className="text-sm text-gray-900">{paymentMethod.toUpperCase()}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-700">Subtotal:</span>
                        <span className="text-sm text-gray-900">
                          ₱{totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-700">Delivery Fee:</span>
                        <span className="text-xs text-gray-600">
                          {deliveryOption === 'delivery' ? 'To be calculated' : 'Free'}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-900">Total:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {deliveryOption === 'delivery' 
                              ? `₱${totalAmount}` 
                              : `₱${totalAmount > 0 ? totalAmount.toLocaleString() : 'Contact for pricing'}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      📸 <strong>Important:</strong> Take a screenshot of your payment receipt and send both the prompt and receipt to messenger.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Generated Order Prompt:
                    </label>
                    {!isPromptGenerated ? (
                      <Button
                        onClick={generateFinalPrompt}
                        className="w-full text-sm mb-3"
                      >
                        Generate Order Prompt
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={generatedPrompt}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs bg-gray-50 resize-none"
                          rows={10}
                        />
                        <Button
                          onClick={copyToClipboard}
                          className="w-full text-sm"
                          variant={isCopied ? "default" : "outline"}
                        >
                          {isCopied ? "✓ Copied to Clipboard!" : "Copy Prompt to Clipboard"}
                        </Button>
                      </div>
                    )}
                    
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={() => {
                        window.open("https://m.me/173538739173933", "_blank");
                        closeModal();
                      }}
                      className="bg-black text-white px-6 py-3 rounded font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={!isCopied}
                    >
                      Go to Messenger
                    </button>
                    <button
                      onClick={handlePrevStep}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                    >
                      Back to Payment
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded font-medium border border-gray-200 hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
