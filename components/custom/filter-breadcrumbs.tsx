"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProductTypes, Budget } from "@/lib/types";

const DESCRIPTIONS: Record<string, string> = {
  keyboards65: "Keyboard: 65%",
  keyboards75: "Keyboard: 75%",
  keyboardsTKL: "Keyboard: TKL",
  switchesLinear: "Switch: Linear",
  switchesTactile: "Switch: Tactile",
  switchesClicky: "Switch: Clicky",
  deskpads: "Deskpads",
  keycaps: "Keycaps",
  under50: "Budget: Under $50",
  between50and150: "Budget: $50 - $150",
  over150: "Budget: Over $150",
};

interface FilterBreadcrumbsProps {
  productTypes: ProductTypes;
  budget: Budget;
  setProductTypes: React.Dispatch<React.SetStateAction<ProductTypes>>;
  setBudget: React.Dispatch<React.SetStateAction<Budget>>;
}

export default function FilterBreadcrumbs({
  productTypes,
  budget,
  setProductTypes,
  setBudget,
}: FilterBreadcrumbsProps) {
  const handleProductTypeRemove = (type: keyof ProductTypes) => {
    setProductTypes((prev) => ({ ...prev, [type]: false }));
  };

  const handleBudgetRemove = (range: keyof Budget) => {
    setBudget((prev) => ({ ...prev, [range]: false }));
  };

  const activeProductFilters = Object.entries(productTypes)
    .filter(([, value]) => value)
    .map(([key]) => key as keyof ProductTypes);

  const activeBudgetFilters = Object.entries(budget)
    .filter(([, value]) => value)
    .map(([key]) => key as keyof Budget);

  const areFiltersActive = activeProductFilters.length > 0 || activeBudgetFilters.length > 0;

  return (
    <div className={`flex items-center flex-wrap gap-2 mb-4 ${!areFiltersActive ? 'invisible' : ''}`}>
      <span className="text-sm font-semibold">Active Filters:</span>
      {activeProductFilters.map((type) => (
        <Badge variant="secondary" key={type} className="flex items-center gap-1">
          {DESCRIPTIONS[type]}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => handleProductTypeRemove(type)}
          />
        </Badge>
      ))}
      {activeBudgetFilters.map((range) => (
        <Badge variant="secondary" key={range} className="flex items-center gap-1">
          {DESCRIPTIONS[range]}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => handleBudgetRemove(range)}
          />
        </Badge>
      ))}
    </div>
  );
}
