"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProductTypes, Budget } from "@/lib/types";

interface FilterPanelProps {
  productTypes: ProductTypes;
  budget: Budget;
  setProductTypes: React.Dispatch<React.SetStateAction<ProductTypes>>;
  setBudget: React.Dispatch<React.SetStateAction<Budget>>;
}

export default function FilterPanel({ productTypes, budget, setProductTypes, setBudget }: FilterPanelProps) {
  const areFiltersActive = Object.values(productTypes).some(v => v) || Object.values(budget).some(v => v);

  const handleClearFilters = () => {
    setProductTypes({
      keyboards65: false,
      keyboards75: false,
      keyboardsTKL: false,
      switchesLinear: false,
      switchesTactile: false,
      switchesClicky: false,
      deskpads: false,
      keycaps: false,
    });
    setBudget({
      under50: false,
      between50and150: false,
      over150: false,
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between my-12 p-4">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto flex items-center justify-between">
              <span>Product Type</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Keyboards</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={productTypes.keyboards65}
                      onCheckedChange={(checked) =>
                        setProductTypes((prev) => ({
                          ...prev,
                          keyboards65: !!checked,
                        }))
                      }
                    >
                      65%
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productTypes.keyboards75}
                      onCheckedChange={(checked) =>
                        setProductTypes((prev) => ({
                          ...prev,
                          keyboards75: !!checked,
                        }))
                      }
                    >
                      75%
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productTypes.keyboardsTKL}
                      onCheckedChange={(checked) =>
                        setProductTypes((prev) => ({
                          ...prev,
                          keyboardsTKL: !!checked,
                        }))
                      }
                    >
                      TKL
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Switches</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={productTypes.switchesLinear}
                      onCheckedChange={(checked) =>
                        setProductTypes((prev) => ({
                          ...prev,
                          switchesLinear: !!checked,
                        }))
                      }
                    >
                      Linear
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productTypes.switchesTactile}
                      onCheckedChange={(checked) =>
                        setProductTypes((prev) => ({
                          ...prev,
                          switchesTactile: !!checked,
                        }))
                      }
                    >
                      Tactile
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productTypes.switchesClicky}
                      onCheckedChange={(checked) =>
                        setProductTypes((prev) => ({
                          ...prev,
                          switchesClicky: !!checked,
                        }))
                      }
                    >
                      Clicky
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuCheckboxItem
                checked={productTypes.deskpads}
                onCheckedChange={(checked) =>
                  setProductTypes((prev) => ({ ...prev, deskpads: !!checked }))
                }
              >
                Deskpads
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={productTypes.keycaps}
                onCheckedChange={(checked) =>
                  setProductTypes((prev) => ({ ...prev, keycaps: !!checked }))
                }
              >
                Keycaps
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto flex items-center justify-between">
              <span>Budget</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Filter by Budget</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem
                checked={budget.under50}
                onCheckedChange={(checked) =>
                  setBudget((prev) => ({ ...prev, under50: !!checked }))
                }
              >
                $ (Under $50)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={budget.between50and150}
                onCheckedChange={(checked) =>
                  setBudget((prev) => ({ ...prev, between50and150: !!checked }))
                }
              >
                $$ ($50 - $150)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={budget.over150}
                onCheckedChange={(checked) =>
                  setBudget((prev) => ({ ...prev, over150: !!checked }))
                }
              >
                $$$ (Over $150)
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 md:mt-0">
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={handleClearFilters}
          disabled={!areFiltersActive}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}
