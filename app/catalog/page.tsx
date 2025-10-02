"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Header from "@/components/custom/header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FilterBreadcrumbs from "@/components/custom/filter-breadcrumbs";
import ProductCard from "@/components/custom/product-card";
import ProductSkeleton from "@/components/custom/product-skeleton";
import { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cachedFetch } from "@/lib/cache";
import FilterPanel from "@/components/custom/filter-panel";

// Product sorting utility - prioritize Best Seller and On Sale items
const sortProductsByPriority = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    // Calculate priority scores (higher = shown first)
    const scoreA = (a.isBestSeller ? 2 : 0) + (a.isOnSale ? 1 : 0);
    const scoreB = (b.isBestSeller ? 2 : 0) + (b.isOnSale ? 1 : 0);

    // Sort by priority score (descending), then by name (ascending) for consistency
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // If same priority, sort alphabetically by product name
    return a.productName.localeCompare(b.productName);
  });
};

// Filter products based on active filters
const applyFilters = (
  products: Product[],
  searchQuery: string,
  filters: any
): Product[] => {
  let filtered = [...products];

  // Apply search filter
  if (searchQuery && typeof searchQuery === "string" && searchQuery.trim()) {
    const searchTerm = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.productName.toLowerCase().includes(searchTerm) ||
        product.productCategory.toLowerCase().includes(searchTerm) ||
        product.switchType?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply product type filters
  const { keyboards, switches, keycaps } = filters.productType;
  if (keyboards || switches || keycaps) {
    filtered = filtered.filter((product) => {
      const category = product.productCategory.toLowerCase();
      if (keyboards && category.includes("keyboard")) return true;
      if (switches && category.includes("switch")) return true;
      if (keycaps && category.includes("keycap")) return true;
      return false;
    });
  }

  // Apply budget filters
  const { under50, between50and150, over150 } = filters.budget;
  if (under50 || between50and150 || over150) {
    filtered = filtered.filter((product) => {
      const budget = product.budget?.toLowerCase();
      if (under50 && budget === "$") return true;
      if (between50and150 && budget === "$$") return true;
      if (over150 && budget === "$$$") return true;
      return false;
    });
  }

  // Apply availability filters
  const { inStock, outOfStock } = filters.availability;
  if (inStock || outOfStock) {
    filtered = filtered.filter((product) => {
      if (inStock && product.isInStock === true) return true;
      if (outOfStock && product.isInStock === false) return true;
      return false;
    });
  }

  // Apply on sale filter
  if (filters.onSale) {
    filtered = filtered.filter((product) => product.isOnSale === true);
  }

  // Apply best seller filter
  if (filters.bestSeller) {
    filtered = filtered.filter((product) => product.isBestSeller === true);
  }

  return filtered;
};
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    productType: {
      keyboards: false,
      switches: false,
      keycaps: false,
    },
    budget: {
      under50: false,
      between50and150: false,
      over150: false,
    },
    availability: {
      inStock: false,
      outOfStock: false,
    },
    onSale: false,
    bestSeller: false,
  });

  // Multi-step modal states
  const [currentStep, setCurrentStep] = useState(1);
  const [contactDetails, setContactDetails] = useState({
    fullName: "",
    contactNumber: "",
  });
  const [deliveryOption, setDeliveryOption] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRImage, setSelectedQRImage] = useState("");

  useEffect(() => {
    const fetchProductsOptimized = async () => {
      try {
        setIsLoading(true);

        // Phase 1: Load basic product info first (fast)
        console.log("Loading basic product info...");
        const basicProducts = await cachedFetch<Product[]>(
          "/api/products/basic",
          {
            headers: {
              "Cache-Control": "max-age=600",
            },
          },
          "basic-products",
          600
        );

        // Set basic products immediately for fast initial render with priority sorting
        const sortedBasicProducts = sortProductsByPriority(basicProducts);
        setProducts(sortedBasicProducts);
        setIsLoading(false); // Products cards can now render with placeholders

        // Phase 2: Load stock and pricing data in background
        console.log("Loading stock and pricing data...");
        try {
          const stockData = await cachedFetch<Record<string, any>>(
            "/api/products/stock",
            {
              headers: {
                "Cache-Control": "max-age=120",
              },
            },
            "stock-data",
            120
          );

          // Update products with stock and pricing data
          setProducts((prevProducts) =>
            sortProductsByPriority(
              prevProducts.map((product) => {
                const normalizedName = product.productName.toLowerCase().trim();
                const stockInfo = stockData[normalizedName];

                if (stockInfo) {
                  return {
                    ...product,
                    stock: stockInfo.stock,
                    price: stockInfo.price,
                    isInStock: stockInfo.isInStock,
                    hasSheetData: true,
                    isLoadingDetails: false,
                  };
                }

                return {
                  ...product,
                  hasSheetData: false,
                  isLoadingDetails: false,
                };
              })
            )
          );
        } catch (stockError) {
          console.error("Error loading stock data:", stockError);
          // Remove loading state even if stock data fails
          setProducts((prevProducts) =>
            prevProducts.map((product) => ({
              ...product,
              isLoadingDetails: false,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching basic products:", error);
        setProducts([]);
        setIsLoading(false);
      }
    };

    fetchProductsOptimized();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    // Set initial quantity based on product category
    if (product.productCategory === "Switches") {
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
    
    // Reset QR modal states
    setShowQRModal(false);
    setSelectedQRImage("");
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  const handleBuyNow = () => {
    // Ensure quantity is positive
    if (quantity <= 0) {
      showErrorMessage("Quantity must be greater than 0");
      return;
    }

    // Validate quantity against stock if available
    if (
      selectedProduct?.hasSheetData &&
      typeof selectedProduct.stock === "number"
    ) {
      if (quantity > selectedProduct.stock) {
        showErrorMessage(
          `Quantity cannot exceed available stock (${selectedProduct.stock} pieces)`
        );
        return;
      }
    }

    // Validate increments of 5 for switches
    if (selectedProduct?.productCategory === "Switches" && quantity % 5 !== 0) {
      showErrorMessage(
        "For switches, quantity must be in increments of 5 (e.g., 5, 10, 15, 20...)"
      );
      return;
    }

    // Calculate total amount
    let calculatedTotal = 0;
    if (
      selectedProduct?.hasSheetData &&
      selectedProduct?.price &&
      selectedProduct.price > 0
    ) {
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
        showErrorMessage("Please enter your full name");
        return;
      }
      if (!contactDetails.contactNumber.trim()) {
        showErrorMessage("Please enter your contact number");
        return;
      }
    } else if (currentStep === 3) {
      // Validate delivery option
      if (!deliveryOption) {
        showErrorMessage("Please select delivery or pickup option");
        return;
      }
      if (deliveryOption === "delivery" && !deliveryAddress.trim()) {
        showErrorMessage("Please enter your delivery address");
        return;
      }
    } else if (currentStep === 4) {
      // Validate payment method
      if (!paymentMethod) {
        showErrorMessage("Please select a payment method");
        return;
      }
    }

    setShowError(false);
    setErrorMessage("");
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setShowError(false);
    setErrorMessage("");
    setCurrentStep((prev) => prev - 1);
  };

  const generateFinalPrompt = () => {
    let prompt = `📋 ORDER DETAILS:\n\n`;
    prompt += `Customer: ${contactDetails.fullName}\n`;
    prompt += `Contact: ${contactDetails.contactNumber}\n\n`;

    prompt += `🛍️ PRODUCT:\n`;
    prompt += `${selectedProduct?.productName} - ${quantity} pieces\n`;

    prompt += `📦 DELIVERY:\n`;
    if (deliveryOption === "delivery") {
      prompt += `Delivery via Maxim/Grab to: ${deliveryAddress}\n`;
      prompt += `Delivery Fee: To be calculated and confirmed\n\n`;
    } else if (deliveryOption === "shipping") {
      prompt += `Domestic shipping via J&T to: ${deliveryAddress}\n`;
      prompt += `Shipping Fee: To be calculated and confirmed\n\n`;
    } else {
      prompt += `Pickup (Near UM Matina only)\n`;
      prompt += `Delivery Fee: Free (Pickup)\n\n`;
    }

    prompt += `💰 TOTAL AMOUNT:\n`;
    const finalAmount =
      selectedProduct?.hasSheetData &&
      selectedProduct?.price &&
      selectedProduct.price > 0
        ? totalAmount.toLocaleString()
        : "Contact for pricing";
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
        const textArea = document.createElement("textarea");
        textArea.value = generatedPrompt;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          setIsCopied(true);
        } catch (err) {
          console.error("Fallback copy failed: ", err);
          // If both methods fail, show the text for manual copying
          alert(`Copy this text manually:\n\n${generatedPrompt}`);
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // If modern API fails, try fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = generatedPrompt;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsCopied(true);
      } catch (fallbackErr) {
        console.error("All copy methods failed: ", fallbackErr);
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
        backgroundAttachment: "fixed",
      }}
    >
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => setSubmittedQuery(searchQuery)}
      />
      <div className="mx-12 mt-12">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        <FilterBreadcrumbs
          filters={filters}
          onFiltersChange={setFilters}
          onClearAllFilters={() => {
            setFilters({
              productType: {
                keyboards: false,
                switches: false,
                keycaps: false,
              },
              budget: {
                under50: false,
                between50and150: false,
                over150: false,
              },
              availability: { inStock: false, outOfStock: false },
              onSale: false,
              bestSeller: false,
            });
            setSubmittedQuery("");
            setSearchQuery("");
          }}
          searchQuery={submittedQuery}
          onClearSearch={() => {
            setSubmittedQuery("");
            setSearchQuery("");
          }}
        />

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {isLoading ? (
            <ProductSkeleton count={8} />
          ) : (
            (() => {
              const filteredProducts = applyFilters(
                products,
                submittedQuery,
                filters
              );

              if (filteredProducts.length === 0) {
                const hasSearch = submittedQuery.trim();
                const hasFilters =
                  Object.values(filters.productType).some((v) => v) ||
                  Object.values(filters.budget).some((v) => v) ||
                  Object.values(filters.availability).some((v) => v) ||
                  filters.onSale ||
                  filters.bestSeller;

                return (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-600 text-xl mb-2">
                      No products found
                    </div>
                    <div className="text-gray-400 text-sm">
                      {hasSearch || hasFilters
                        ? "Try adjusting your search or filters to see more products"
                        : "No products available at the moment"}
                    </div>
                  </div>
                );
              }
              return filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ));
            })()
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
            right: "8vw",
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            // Only close on desktop (screen width > 768px) when clicking the backdrop
            if (e.target === e.currentTarget && window.innerWidth > 768) {
              closeModal();
            }
          }}
        >
          <div 
            className="bg-[#fcfcfcfc] p-6 md:p-8 rounded-md shadow-lg w-full max-w-sm md:max-w-4xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => {
              // Prevent clicks inside the modal from closing it
              e.stopPropagation();
            }}
          >
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
                                ₱
                                {selectedProduct.price || "Contact for pricing"}
                                /pc
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
                                if (
                                  selectedProduct?.productCategory ===
                                  "Switches"
                                ) {
                                  const newValue = Math.max(5, quantity - 5);
                                  setQuantity(newValue);
                                } else {
                                  const newValue = Math.max(1, quantity - 1);
                                  setQuantity(newValue);
                                }
                              }}
                              disabled={selectedProduct?.isLoadingDetails}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <Input
                              type="number"
                              placeholder="Qty"
                              className="w-20 text-center text-sm border-0 focus:ring-0"
                              value={quantity}
                              disabled={selectedProduct?.isLoadingDetails}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value) && value > 0) {
                                  if (
                                    selectedProduct?.productCategory ===
                                    "Switches"
                                  ) {
                                    // For switches, round to nearest multiple of 5, minimum 5
                                    const roundedValue = Math.max(
                                      5,
                                      Math.round(value / 5) * 5
                                    );
                                    setQuantity(roundedValue);
                                  } else {
                                    setQuantity(value);
                                  }
                                } else if (e.target.value === "") {
                                  setQuantity(
                                    selectedProduct?.productCategory ===
                                      "Switches"
                                      ? 5
                                      : 1
                                  );
                                }
                              }}
                              min={
                                selectedProduct?.productCategory === "Switches"
                                  ? 5
                                  : 1
                              }
                              max={
                                selectedProduct?.hasSheetData &&
                                typeof selectedProduct.stock === "number"
                                  ? selectedProduct.stock
                                  : undefined
                              }
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  selectedProduct?.productCategory ===
                                  "Switches"
                                ) {
                                  const maxStock =
                                    selectedProduct?.hasSheetData &&
                                    typeof selectedProduct.stock === "number"
                                      ? selectedProduct.stock
                                      : 9999;
                                  const newValue = Math.min(
                                    maxStock,
                                    quantity + 5
                                  );
                                  setQuantity(newValue);
                                } else {
                                  const maxStock =
                                    selectedProduct?.hasSheetData &&
                                    typeof selectedProduct.stock === "number"
                                      ? selectedProduct.stock
                                      : 9999;
                                  const newValue = Math.min(
                                    maxStock,
                                    quantity + 1
                                  );
                                  setQuantity(newValue);
                                }
                              }}
                              disabled={selectedProduct?.isLoadingDetails}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          <Button
                            variant="default"
                            onClick={handleBuyNow}
                            disabled={selectedProduct?.isLoadingDetails}
                            className="flex-grow text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {selectedProduct?.isLoadingDetails
                              ? "Loading stock..."
                              : "Buy Now"}
                          </Button>
                        </div>
                        {selectedProduct?.hasSheetData &&
                          typeof selectedProduct.stock === "number" && (
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
                        <h3 className="text-xl font-semibold text-gray-900">
                          Contact Details
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Step 1 of 4
                        </p>
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
                            onChange={(e) =>
                              setContactDetails((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
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
                            onChange={(e) =>
                              setContactDetails((prev) => ({
                                ...prev,
                                contactNumber: e.target.value,
                              }))
                            }
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
                        <h3 className="text-xl font-semibold text-gray-900">
                          Delivery Options
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Step 2 of 4
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            How would you like to receive your order? *
                          </label>
                          <RadioGroup
                            value={deliveryOption}
                            onValueChange={setDeliveryOption}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value="pickup"
                                id="pickup-desktop"
                              />
                              <label
                                htmlFor="pickup-desktop"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Pickup (Near UM Matina only)
                              </label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value="delivery"
                                id="delivery-desktop"
                              />
                              <label
                                htmlFor="delivery-desktop"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Delivery via Maxim/Grab (Davao City only)
                              </label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value="shipping"
                                id="shipping-desktop"
                              />
                              <label
                                htmlFor="shipping-desktop"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Domestic shipping via J&T (Within Philippines)
                              </label>
                            </div>
                          </RadioGroup>
                        </div>

                        {(deliveryOption === "delivery" ||
                          deliveryOption === "shipping") && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {deliveryOption === "delivery"
                                ? "Delivery Address *"
                                : "Shipping Address *"}
                            </label>
                            <textarea
                              placeholder={
                                deliveryOption === "delivery"
                                  ? "Enter your complete address for Maxim/Grab delivery"
                                  : "Enter your complete address for J&T shipping"
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                              value={deliveryAddress}
                              onChange={(e) =>
                                setDeliveryAddress(e.target.value)
                              }
                            />
                          </div>
                        )}

                        {(deliveryOption === "delivery" ||
                          deliveryOption === "shipping") && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                              <span className="text-blue-600 text-lg">ℹ️</span>
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {deliveryOption === "delivery"
                                    ? "Delivery Fee Calculation"
                                    : "Shipping Fee Calculation"}
                                </p>
                                <p className="text-sm text-blue-800 mt-1">
                                  {deliveryOption === "delivery"
                                    ? "Available for Davao City only. Delivery fee will be calculated and communicated after we receive your order and payment screenshot."
                                    : "Available nationwide in the Philippines. Shipping fee will be calculated and communicated after we receive your order and payment screenshot."}
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
                        <h3 className="text-xl font-semibold text-gray-900">
                          Payment Method
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Step 3 of 4
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              Subtotal:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              ₱
                              {totalAmount > 0
                                ? totalAmount.toLocaleString()
                                : "Contact for pricing"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              Delivery Fee:
                            </span>
                            <span className="text-sm text-gray-600">
                              {deliveryOption === "delivery" ||
                              deliveryOption === "shipping"
                                ? "To be calculated"
                                : "Free (Pickup)"}
                            </span>
                          </div>
                          <div className="border-t border-gray-300 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-base font-semibold text-gray-900">
                                Total Amount:
                              </span>
                              <span className="text-base font-semibold text-gray-900">
                                {deliveryOption === "delivery" ||
                                deliveryOption === "shipping"
                                  ? `₱${totalAmount}`
                                  : `₱${
                                      totalAmount > 0
                                        ? totalAmount.toLocaleString()
                                        : "Contact for pricing"
                                    }`}
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
                          <RadioGroup
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value="gcash"
                                id="gcash-desktop"
                              />
                              <label
                                htmlFor="gcash-desktop"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                GCash
                              </label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="bpi" id="bpi-desktop" />
                              <label
                                htmlFor="bpi-desktop"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                BPI
                              </label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="seabank" id="seabank-desktop" />
                              <label
                                htmlFor="seabank-desktop"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                SeaBank
                              </label>
                            </div>
                          </RadioGroup>
                        </div>

                        {paymentMethod && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-center">
                              <div className="w-64 h-64 mx-auto bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center mb-4 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => {
                                  setSelectedQRImage(`/qr_${paymentMethod}.jpg`);
                                  setShowQRModal(true);
                                }}>
                                <img 
                                  src={`/qr_${paymentMethod}.jpg`}
                                  alt={`${paymentMethod.toUpperCase()} QR Code`}
                                  className="w-full h-full object-contain p-3"
                                />
                              </div>
                              <p className="text-sm text-blue-700 font-medium mb-2">
                                Scan this QR code to pay ₱
                                {totalAmount > 0
                                  ? totalAmount.toLocaleString()
                                  : "Contact for pricing"}
                              </p>
                              <p className="text-xs text-gray-600">
                                Click QR code to enlarge for easier scanning
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
                        <h3 className="text-xl font-semibold text-gray-900">
                          Order Summary
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Step 4 of 4
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Customer:
                          </p>
                          <p className="text-sm text-gray-900">
                            {contactDetails.fullName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Contact:
                          </p>
                          <p className="text-sm text-gray-900">
                            {contactDetails.contactNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Product:
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedProduct?.productName} × {quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Delivery:
                          </p>
                          <p className="text-sm text-gray-900">
                            {deliveryOption === "delivery"
                              ? `Delivery to: ${deliveryAddress}`
                              : "Pickup"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Payment:
                          </p>
                          <p className="text-sm text-gray-900">
                            {paymentMethod.toUpperCase()}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              Subtotal:
                            </span>
                            <span className="text-sm text-gray-900">
                              ₱
                              {totalAmount > 0
                                ? totalAmount.toLocaleString()
                                : "Contact for pricing"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              Delivery Fee:
                            </span>
                            <span className="text-sm text-gray-600">
                              {deliveryOption === "delivery"
                                ? "To be calculated"
                                : "Free"}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-base font-semibold text-gray-900">
                                Total:
                              </span>
                              <span className="text-base font-semibold text-gray-900">
                                {deliveryOption === "delivery" ||
                                deliveryOption === "shipping"
                                  ? `₱${totalAmount}`
                                  : `₱${
                                      totalAmount > 0
                                        ? totalAmount.toLocaleString()
                                        : "Contact for pricing"
                                    }`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          📸 <strong>Important:</strong> After clicking
                          "Generate Prompt" below, please take a screenshot of
                          your payment receipt and send both the generated
                          prompt and receipt screenshot to our messenger.
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
                              {isCopied
                                ? "✓ Copied to Clipboard!"
                                : "Copy Prompt to Clipboard"}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 pt-4">
                        <button
                          onClick={() => {
                            window.open(
                              "https://m.me/173538739173933",
                              "_blank"
                            );
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
                            if (
                              selectedProduct?.productCategory === "Switches"
                            ) {
                              const newValue = Math.max(5, quantity - 5);
                              setQuantity(newValue);
                            } else {
                              const newValue = Math.max(1, quantity - 1);
                              setQuantity(newValue);
                            }
                          }}
                          disabled={selectedProduct?.isLoadingDetails}
                          className="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="w-16 text-center text-sm border-0 focus:ring-0"
                          value={quantity}
                          disabled={selectedProduct?.isLoadingDetails}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value > 0) {
                              if (
                                selectedProduct?.productCategory === "Switches"
                              ) {
                                // For switches, round to nearest multiple of 5, minimum 5
                                const roundedValue = Math.max(
                                  5,
                                  Math.round(value / 5) * 5
                                );
                                setQuantity(roundedValue);
                              } else {
                                setQuantity(value);
                              }
                            } else if (e.target.value === "") {
                              setQuantity(
                                selectedProduct?.productCategory === "Switches"
                                  ? 5
                                  : 1
                              );
                            }
                          }}
                          min={
                            selectedProduct?.productCategory === "Switches"
                              ? 5
                              : 1
                          }
                          max={
                            selectedProduct?.hasSheetData &&
                            typeof selectedProduct.stock === "number"
                              ? selectedProduct.stock
                              : undefined
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              selectedProduct?.productCategory === "Switches"
                            ) {
                              const maxStock =
                                selectedProduct?.hasSheetData &&
                                typeof selectedProduct.stock === "number"
                                  ? selectedProduct.stock
                                  : 9999;
                              const newValue = Math.min(maxStock, quantity + 5);
                              setQuantity(newValue);
                            } else {
                              const maxStock =
                                selectedProduct?.hasSheetData &&
                                typeof selectedProduct.stock === "number"
                                  ? selectedProduct.stock
                                  : 9999;
                              const newValue = Math.min(maxStock, quantity + 1);
                              setQuantity(newValue);
                            }
                          }}
                          disabled={selectedProduct?.isLoadingDetails}
                          className="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        variant={"default"}
                        onClick={handleBuyNow}
                        disabled={selectedProduct?.isLoadingDetails}
                        className="flex-grow text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {selectedProduct?.isLoadingDetails
                          ? "Loading stock..."
                          : "Buy Now"}
                      </Button>
                    </div>
                    {selectedProduct?.hasSheetData &&
                      typeof selectedProduct.stock === "number" && (
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contact Details
                    </h3>
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
                        onChange={(e) =>
                          setContactDetails((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setContactDetails((prev) => ({
                            ...prev,
                            contactNumber: e.target.value,
                          }))
                        }
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
                    <Button onClick={handleNextStep} className="w-full text-sm">
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delivery Options
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Step 2 of 4</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How would you like to receive your order? *
                      </label>
                      <RadioGroup
                        value={deliveryOption}
                        onValueChange={setDeliveryOption}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="pickup" id="pickup-mobile" />
                          <label
                            htmlFor="pickup-mobile"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Pickup (Near UM Matina only)
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="delivery"
                            id="delivery-mobile"
                          />
                          <label
                            htmlFor="delivery-mobile"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Delivery via Maxim/Grab (Davao City only)
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="shipping"
                            id="shipping-mobile"
                          />
                          <label
                            htmlFor="shipping-mobile"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Domestic shipping via J&T (Within Philippines)
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    {(deliveryOption === "delivery" ||
                      deliveryOption === "shipping") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {deliveryOption === "delivery"
                            ? "Delivery Address *"
                            : "Shipping Address *"}
                        </label>
                        <textarea
                          placeholder={
                            deliveryOption === "delivery"
                              ? "Enter your complete address for Maxim/Grab delivery"
                              : "Enter your complete address for J&T shipping"
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                    )}

                    {deliveryOption === "delivery" && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600">ℹ️</span>
                          <div>
                            <p className="text-xs font-medium text-blue-900">
                              Delivery Fee Calculation
                            </p>
                            <p className="text-xs text-blue-800 mt-1">
                              Available for Davao City only. Delivery fee will
                              be calculated and communicated after we receive
                              your order and payment screenshot.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {deliveryOption === "shipping" && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600">ℹ️</span>
                          <div>
                            <p className="text-xs font-medium text-blue-900">
                              Delivery Fee Calculation
                            </p>
                            <p className="text-xs text-blue-800 mt-1">
                              Available nationwide in the Philippines. Shipping
                              fee will be calculated and communicated after we
                              receive your order and payment screenshot.
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
                    <Button onClick={handleNextStep} className="w-full text-sm">
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment Method
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Step 3 of 4</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Subtotal:</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₱
                          {totalAmount > 0
                            ? totalAmount.toLocaleString()
                            : "Contact for pricing"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                          Delivery Fee:
                        </span>
                        <span className="text-xs text-gray-600">
                          {deliveryOption === "delivery" ||
                          deliveryOption === "shipping"
                            ? "To be calculated"
                            : "Free (Pickup)"}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-gray-900">
                            Total:
                          </span>
                          <span className="text-base font-semibold text-gray-900">
                            {deliveryOption === "delivery" ||
                            deliveryOption === "shipping"
                              ? `₱${totalAmount}`
                              : `₱${
                                  totalAmount > 0
                                    ? totalAmount.toLocaleString()
                                    : "Contact for pricing"
                                }`}
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
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="gcash" id="gcash-mobile" />
                          <label
                            htmlFor="gcash-mobile"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            GCash
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="bpi" id="bpi-mobile" />
                          <label
                            htmlFor="bpi-mobile"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            BPI
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="seabank" id="seabank-mobile" />
                          <label
                            htmlFor="seabank-mobile"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            SeaBank
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    {paymentMethod && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <div className="w-56 h-56 mx-auto bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center mb-3 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => {
                              setSelectedQRImage(`/qr_${paymentMethod}.jpg`);
                              setShowQRModal(true);
                            }}>
                            <img 
                              src={`/qr_${paymentMethod}.jpg`}
                              alt={`${paymentMethod.toUpperCase()} QR Code`}
                              className="w-full h-full object-contain p-3"
                            />
                          </div>
                          <p className="text-xs text-blue-700 font-medium mb-2">
                            Scan QR code to pay ₱
                            {totalAmount > 0
                              ? totalAmount.toLocaleString()
                              : "Contact for pricing"}
                          </p>
                          <p className="text-xs text-gray-600">
                            💡 Tap QR code to enlarge
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order Summary
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Step 4 of 4</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Customer:
                      </p>
                      <p className="text-sm text-gray-900">
                        {contactDetails.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Contact:
                      </p>
                      <p className="text-sm text-gray-900">
                        {contactDetails.contactNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Product:
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedProduct?.productName} × {quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Delivery:
                      </p>
                      <p className="text-sm text-gray-900">
                        {deliveryOption === "delivery"
                          ? `Delivery to: ${deliveryAddress}`
                          : "Pickup"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Payment:
                      </p>
                      <p className="text-sm text-gray-900">
                        {paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-700">Subtotal:</span>
                        <span className="text-sm text-gray-900">
                          ₱
                          {totalAmount > 0
                            ? totalAmount.toLocaleString()
                            : "Contact for pricing"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-700">
                          Delivery Fee:
                        </span>
                        <span className="text-xs text-gray-600">
                          {deliveryOption === "delivery"
                            ? "To be calculated"
                            : "Free"}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-900">
                            Total:
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {deliveryOption === "delivery"
                              ? `₱${totalAmount}`
                              : `₱${
                                  totalAmount > 0
                                    ? totalAmount.toLocaleString()
                                    : "Contact for pricing"
                                }`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      📸 <strong>Important:</strong> Take a screenshot of your
                      payment receipt and send both the prompt and receipt to
                      messenger.
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
                          {isCopied
                            ? "✓ Copied to Clipboard!"
                            : "Copy Prompt to Clipboard"}
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

      {/* QR Code Modal */}
      {showQRModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQRModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {paymentMethod?.toUpperCase()} QR Code
              </h3>
              
              <div className="w-80 h-80 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <img 
                  src={selectedQRImage}
                  alt={`${paymentMethod?.toUpperCase()} QR Code`}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                Hold your phone close to scan this QR code
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Amount: ₱{totalAmount > 0 ? totalAmount.toLocaleString() : "Contact for pricing"}
              </p>
              
              {/* Download Button */}
              <button
                onClick={() => {
                  // Create a temporary link element to trigger download
                  const link = document.createElement('a');
                  link.href = selectedQRImage;
                  link.download = `chi-boards-${paymentMethod}-qr-code.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Save QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
