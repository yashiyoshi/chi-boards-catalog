"use client";

import * as React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterPanelProps {
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
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (category: string, key: string, value: boolean) => {
    const newFilters = { ...filters };
    if (category === 'onSale' || category === 'bestSeller') {
      (newFilters as any)[category] = value;
    } else {
      (newFilters as any)[category][key] = value;
    }
    onFiltersChange(newFilters);
  };

  return (
    <div className="mb-6">
      {/* Desktop Version */}
      <div className="hidden md:flex gap-4 flex-wrap justify-between">
        {/* Left side filters */}
        <div className="flex gap-4 flex-wrap">
          {/* Product Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between">
                Product Type
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="keyboards" 
                    checked={filters.productType.keyboards}
                    onCheckedChange={(checked) => updateFilter('productType', 'keyboards', !!checked)}
                  />
                  <Label htmlFor="keyboards" className="cursor-pointer">Keyboards</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="switches" 
                    checked={filters.productType.switches}
                    onCheckedChange={(checked) => updateFilter('productType', 'switches', !!checked)}
                  />
                  <Label htmlFor="switches" className="cursor-pointer">Switches</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="keycaps" 
                    checked={filters.productType.keycaps}
                    onCheckedChange={(checked) => updateFilter('productType', 'keycaps', !!checked)}
                  />
                  <Label htmlFor="keycaps" className="cursor-pointer">Keycaps</Label>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Budget Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between">
                Budget
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="under50" 
                    checked={filters.budget.under50}
                    onCheckedChange={(checked) => updateFilter('budget', 'under50', !!checked)}
                  />
                  <Label htmlFor="under50" className="cursor-pointer">$ - Budget</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="between50and150" 
                    checked={filters.budget.between50and150}
                    onCheckedChange={(checked) => updateFilter('budget', 'between50and150', !!checked)}
                  />
                  <Label htmlFor="between50and150" className="cursor-pointer">$$ - Midrange</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="over150" 
                    checked={filters.budget.over150}
                    onCheckedChange={(checked) => updateFilter('budget', 'over150', !!checked)}
                  />
                  <Label htmlFor="over150" className="cursor-pointer">$$$ - Enthusiast</Label>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Availability Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between">
                Availability
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="inStock" 
                    checked={filters.availability.inStock}
                    onCheckedChange={(checked) => updateFilter('availability', 'inStock', !!checked)}
                  />
                  <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="outOfStock" 
                    checked={filters.availability.outOfStock}
                    onCheckedChange={(checked) => updateFilter('availability', 'outOfStock', !!checked)}
                  />
                  <Label htmlFor="outOfStock" className="cursor-pointer">Out of Stock</Label>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side - Special Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-between">
              Special
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="onSale" 
                  checked={filters.onSale}
                  onCheckedChange={(checked) => updateFilter('onSale', '', !!checked)}
                />
                <Label htmlFor="onSale" className="cursor-pointer">🏷️ On Sale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bestSeller" 
                  checked={filters.bestSeller}
                  onCheckedChange={(checked) => updateFilter('bestSeller', '', !!checked)}
                />
                <Label htmlFor="bestSeller" className="cursor-pointer">⭐ Best Seller</Label>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Filter products by type, budget, and availability
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6 flex-1 overflow-y-auto">
              {/* Product Type */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Product Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-keyboards" 
                      checked={filters.productType.keyboards}
                      onCheckedChange={(checked) => updateFilter('productType', 'keyboards', !!checked)}
                    />
                    <Label htmlFor="mobile-keyboards" className="cursor-pointer">Keyboards</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-switches" 
                      checked={filters.productType.switches}
                      onCheckedChange={(checked) => updateFilter('productType', 'switches', !!checked)}
                    />
                    <Label htmlFor="mobile-switches" className="cursor-pointer">Switches</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-keycaps" 
                      checked={filters.productType.keycaps}
                      onCheckedChange={(checked) => updateFilter('productType', 'keycaps', !!checked)}
                    />
                    <Label htmlFor="mobile-keycaps" className="cursor-pointer">Keycaps</Label>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Budget</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-under50" 
                      checked={filters.budget.under50}
                      onCheckedChange={(checked) => updateFilter('budget', 'under50', !!checked)}
                    />
                    <Label htmlFor="mobile-under50" className="cursor-pointer">$ - Budget</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-between50and150" 
                      checked={filters.budget.between50and150}
                      onCheckedChange={(checked) => updateFilter('budget', 'between50and150', !!checked)}
                    />
                    <Label htmlFor="mobile-between50and150" className="cursor-pointer">$$ - Midrange</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-over150" 
                      checked={filters.budget.over150}
                      onCheckedChange={(checked) => updateFilter('budget', 'over150', !!checked)}
                    />
                    <Label htmlFor="mobile-over150" className="cursor-pointer">$$$ - Enthusiast</Label>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-inStock" 
                      checked={filters.availability.inStock}
                      onCheckedChange={(checked) => updateFilter('availability', 'inStock', !!checked)}
                    />
                    <Label htmlFor="mobile-inStock" className="cursor-pointer">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-outOfStock" 
                      checked={filters.availability.outOfStock}
                      onCheckedChange={(checked) => updateFilter('availability', 'outOfStock', !!checked)}
                    />
                    <Label htmlFor="mobile-outOfStock" className="cursor-pointer">Out of Stock</Label>
                  </div>
                </div>
              </div>

              {/* Special Filters */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Special</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-onSale" 
                      checked={filters.onSale}
                      onCheckedChange={(checked) => updateFilter('onSale', '', !!checked)}
                    />
                    <Label htmlFor="mobile-onSale" className="cursor-pointer">🏷️ On Sale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mobile-bestSeller" 
                      checked={filters.bestSeller}
                      onCheckedChange={(checked) => updateFilter('bestSeller', '', !!checked)}
                    />
                    <Label htmlFor="mobile-bestSeller" className="cursor-pointer">⭐ Best Seller</Label>
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter className="flex-shrink-0 pt-4 border-t">
              <SheetClose asChild>
                <Button variant="outline" className="w-full">Done</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}