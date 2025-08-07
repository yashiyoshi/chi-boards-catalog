"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProductTypes, Budget } from "@/lib/types";

interface FilterPanelProps {
  productTypes: ProductTypes;
  budget: Budget;
  setProductTypes: React.Dispatch<React.SetStateAction<ProductTypes>>;
  setBudget: React.Dispatch<React.SetStateAction<Budget>>;
}

export default function FilterPanel({
  productTypes,
  budget,
  setProductTypes,
  setBudget,
}: FilterPanelProps) {
  const [tempProductTypes, setTempProductTypes] =
    React.useState<ProductTypes>(productTypes);
  const [tempBudget, setTempBudget] = React.useState<Budget>(budget);
  const [isProductTypeOpen, setIsProductTypeOpen] = React.useState(false);
  const [isKeyboardsOpen, setIsKeyboardsOpen] = React.useState(false);
  const [isSwitchesOpen, setIsSwitchesOpen] = React.useState(false);
  const [isKeycapsOpen, setIsKeycapsOpen] = React.useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = React.useState(false);

  React.useEffect(() => {
    setTempProductTypes(productTypes);
  }, [productTypes]);

  React.useEffect(() => {
    setTempBudget(budget);
  }, [budget]);

  const areFiltersActive =
    Object.values(productTypes).some((v) => v) ||
    Object.values(budget).some((v) => v);

  const handleClearFilters = () => {
    setProductTypes({
      keyboards65: false,
      keyboards75: false,
      keyboardsTKL: false,
      switchesLinear: false,
      switchesTactile: false,
      switchesSilentLinear: false,
      switchesMagnetic: false,
      keycapsCherry: false,
      keycapsXDA: false,
      keycapsOEM: false,
      keycapsOther: false,
    });
    setBudget({
      under50: false,
      between50and150: false,
      over150: false,
    });
  };

  const handleApplyFilters = () => {
    setProductTypes(tempProductTypes);
    setBudget(tempBudget);
  };

  const productTypeFiltersDesktop = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto flex items-center justify-between"
        >
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
                    setProductTypes((prev) => ({ ...prev, keyboards65: !!checked }))
                  }
                >
                  65%
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.keyboards75}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, keyboards75: !!checked }))
                  }
                >
                  75%
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.keyboardsTKL}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, keyboardsTKL: !!checked }))
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
                    setProductTypes((prev) => ({ ...prev, switchesLinear: !!checked }))
                  }
                >
                  Linear
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.switchesTactile}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, switchesTactile: !!checked }))
                  }
                >
                  Tactile
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.switchesSilentLinear}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, switchesSilentLinear: !!checked }))
                  }
                >
                  Silent Linear
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.switchesMagnetic}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, switchesMagnetic: !!checked }))
                  }
                >
                  Magnetic
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Keycaps</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={productTypes.keycapsCherry}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, keycapsCherry: !!checked }))
                  }
                >
                  Cherry
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.keycapsXDA}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, keycapsXDA: !!checked }))
                  }
                >
                  XDA
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.keycapsOEM}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, keycapsOEM: !!checked }))
                  }
                >
                  OEM
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={productTypes.keycapsOther}
                  onCheckedChange={(checked) =>
                    setProductTypes((prev) => ({ ...prev, keycapsOther: !!checked }))
                  }
                >
                  Other
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const budgetFiltersDesktop = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto flex items-center justify-between"
        >
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
            $ - Cheap
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={budget.between50and150}
            onCheckedChange={(checked) =>
              setBudget((prev) => ({ ...prev, between50and150: !!checked }))
            }
          >
            $$ - Mid-tier
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={budget.over150}
            onCheckedChange={(checked) =>
              setBudget((prev) => ({ ...prev, over150: !!checked }))
            }
          >
            $$$ - Enthusiast
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col md:flex-row justify-between my-12 p-4 ">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        {productTypeFiltersDesktop}
        {budgetFiltersDesktop}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <span>Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search using the options below.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <Collapsible open={isProductTypeOpen} onOpenChange={setIsProductTypeOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center"
                  >
                    <span>Product Type</span>
                    {isProductTypeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pt-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
                  <Collapsible open={isKeyboardsOpen} onOpenChange={setIsKeyboardsOpen} className="pl-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full flex justify-between items-center">
                        <span>Keyboards</span>
                        {isKeyboardsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keyboards65" checked={tempProductTypes.keyboards65} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, keyboards65: !!checked }))} />
                        <Label htmlFor="keyboards65">65%</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keyboards75" checked={tempProductTypes.keyboards75} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, keyboards75: !!checked }))} />
                        <Label htmlFor="keyboards75">75%</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keyboardsTKL" checked={tempProductTypes.keyboardsTKL} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, keyboardsTKL: !!checked }))} />
                        <Label htmlFor="keyboardsTKL">TKL</Label>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible open={isSwitchesOpen} onOpenChange={setIsSwitchesOpen} className="pl-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full flex justify-between items-center">
                        <span>Switches</span>
                        {isSwitchesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="switchesLinear" checked={tempProductTypes.switchesLinear} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, switchesLinear: !!checked }))} />
                        <Label htmlFor="switchesLinear">Linear</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="switchesTactile" checked={tempProductTypes.switchesTactile} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, switchesTactile: !!checked }))} />
                        <Label htmlFor="switchesTactile">Tactile</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="switchesSilentLinear" checked={tempProductTypes.switchesSilentLinear} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, switchesClicky: !!checked }))} />
                        <Label htmlFor="switchesSilentLinear">Silent Linear</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="switchesMagnetic" checked={tempProductTypes.switchesMagnetic} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, switchesClicky: !!checked }))} />
                        <Label htmlFor="switchesMagnetic">Magnetic</Label>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <Collapsible open={isKeycapsOpen} onOpenChange={setIsKeycapsOpen} className="pl-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full flex justify-between items-center">
                        <span>Keycaps</span>
                        {isKeycapsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keycapsCherry" checked={tempProductTypes.keycapsCherry} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, keycapsCherry: !!checked }))} />
                        <Label htmlFor="keycapsCherry">Cherry</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keycapsXDA" checked={tempProductTypes.keycapsXDA} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, keycapsXDA: !!checked }))} />
                        <Label htmlFor="keycapsXDA">XDA</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keycapsOEM" checked={tempProductTypes.keycapsOEM} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, keycapsOEM: !!checked }))} />
                        <Label htmlFor="keycapsOEM">OEM</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keycapsOther" checked={tempProductTypes.keycapsOther} onCheckedChange={(checked) => setTempProductTypes((prev) => ({ ...prev, keycapsOther: !!checked }))} />
                        <Label htmlFor="keycapsOther">Other</Label>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center"
                  >
                    <span>Budget</span>
                    {isBudgetOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pt-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="under50" checked={tempBudget.under50} onCheckedChange={(checked) => setTempBudget((prev) => ({ ...prev, under50: !!checked }))} />
                    <Label htmlFor="under50">$</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="between50and150" checked={tempBudget.between50and150} onCheckedChange={(checked) => setTempBudget((prev) => ({ ...prev, between50and150: !!checked }))} />
                    <Label htmlFor="between50and150">$$</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="over150" checked={tempBudget.over150} onCheckedChange={(checked) => setTempBudget((prev) => ({ ...prev, over150: !!checked }))} />
                    <Label htmlFor="over150">$$$</Label>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
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