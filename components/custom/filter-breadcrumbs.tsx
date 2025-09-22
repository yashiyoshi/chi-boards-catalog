"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBreadcrumbsProps {
  filters: {
    productType: {
      keyboards: boolean;
      switches: boolean;
      keycaps: boolean;
    };
    budget: {
      under50: boolean;
      between50and150: boolean;
      over150: boolean;
    };
    availability: {
      inStock: boolean;
      outOfStock: boolean;
    };
    onSale: boolean;
    bestSeller: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClearAllFilters: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

const FILTER_LABELS: Record<string, string> = {
  // Product Type
  "productType.keyboards": "Keyboards",
  "productType.switches": "Switches",
  "productType.keycaps": "Keycaps",
  // Budget
  "budget.under50": "$ - Budget",
  "budget.between50and150": "$$ - Midrange",
  "budget.over150": "$$$ - Enthusiast",
  // Availability
  "availability.inStock": "In Stock",
  "availability.outOfStock": "Out of Stock",
  // Special
  onSale: "On Sale",
  bestSeller: "Best Seller",
};

export default function FilterBreadcrumbs({
  filters,
  onFiltersChange,
  onClearAllFilters,
  searchQuery,
  onClearSearch,
}: FilterBreadcrumbsProps) {
  const activeFilters: Array<{ key: string; label: string; path: string[] }> =
    [];

  // Check product type filters
  Object.entries(filters.productType).forEach(([key, value]) => {
    if (value) {
      activeFilters.push({
        key: `productType.${key}`,
        label: FILTER_LABELS[`productType.${key}`],
        path: ["productType", key],
      });
    }
  });

  // Check budget filters
  Object.entries(filters.budget).forEach(([key, value]) => {
    if (value) {
      activeFilters.push({
        key: `budget.${key}`,
        label: FILTER_LABELS[`budget.${key}`],
        path: ["budget", key],
      });
    }
  });

  // Check availability filters
  Object.entries(filters.availability).forEach(([key, value]) => {
    if (value) {
      activeFilters.push({
        key: `availability.${key}`,
        label: FILTER_LABELS[`availability.${key}`],
        path: ["availability", key],
      });
    }
  });

  // Check on sale filter
  if (filters.onSale) {
    activeFilters.push({
      key: "onSale",
      label: FILTER_LABELS["onSale"],
      path: ["onSale"],
    });
  }

  // Check best seller filter
  if (filters.bestSeller) {
    activeFilters.push({
      key: "bestSeller",
      label: FILTER_LABELS["bestSeller"],
      path: ["bestSeller"],
    });
  }

  const clearFilter = (path: string[]) => {
    const newFilters = { ...filters };
    let current: any = newFilters;

    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    // Set the final property to false
    if (path.length === 1) {
      current[path[0]] = false;
    } else {
      current[path[path.length - 1]] = false;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
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
    if (onClearSearch) {
      onClearSearch();
    }
  };

  // Don't show anything if no filters or search are active
  const hasSearch = searchQuery && searchQuery.trim();
  const hasFilters = activeFilters.length > 0;

  if (!hasSearch && !hasFilters) {
    return (
      <div className="invisible flex items-center flex-wrap gap-2 mb-6 p-8 bg-gray-50 rounded-lg"></div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm font-semibold text-gray-700 mr-2">Active:</span>

        {/* Search Query Badge */}
        {hasSearch && (
          <Badge
            variant="secondary"
            className="bg-black text-white hover:bg-gray-800"
          >
            Search: "{searchQuery}"
            <button
              onClick={onClearSearch}
              className="ml-2 hover:bg-gray-700 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* Filter Badges */}
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="outline"
            className="bg-white border-gray-300"
          >
            {filter.label}
            <button
              onClick={() => clearFilter(filter.path)}
              className="ml-2 hover:bg-gray-100 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Clear All Button - Right Side */}
      {(hasSearch || hasFilters) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-gray-600 hover:text-gray-800 text-xs ml-4"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}
