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

export default function FilterPanel() {
  const [isProductTypeOpen, setIsProductTypeOpen] = React.useState(false);
  const [isKeyboardsOpen, setIsKeyboardsOpen] = React.useState(false);
  const [isSwitchesOpen, setIsSwitchesOpen] = React.useState(false);
  const [isKeycapsOpen, setIsKeycapsOpen] = React.useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = React.useState(false);

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
                >
                  65%
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                >
                  75%
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
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
                >
                  Linear
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                >
                  Tactile
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                >
                  Silent Linear
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
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
                >
                  Cherry
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                >
                  XDA
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                >
                  OEM
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
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
          >
            $ - Cheap
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
          >
            $ - Mid-tier
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
          >
            $$ - Enthusiast
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
                        <Checkbox id="keyboards65" />
                        <Label htmlFor="keyboards65">65%</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keyboards75" />
                        <Label htmlFor="keyboards75">75%</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keyboardsTKL" />
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
                        <Checkbox id="switchesLinear" />
                        <Label htmlFor="switchesLinear">Linear</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="switchesTactile" />
                        <Label htmlFor="switchesTactile">Tactile</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="switchesSilentLinear" />
                        <Label htmlFor="switchesSilentLinear">Silent Linear</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="switchesMagnetic" />
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
                        <Checkbox id="keycapsCherry" />
                        <Label htmlFor="keycapsCherry">Cherry</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keycapsXDA" />
                        <Label htmlFor="keycapsXDA">XDA</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keycapsOEM" />
                        <Label htmlFor="keycapsOEM">OEM</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="keycapsOther" />
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
                    <Checkbox id="under50" />
                    <Label htmlFor="under50">$</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="between50and150" />
                    <Label htmlFor="between50and150">$</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="over150" />
                    <Label htmlFor="over150">$$</Label>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-4 md:mt-0">
        <Button
          variant="outline"
          className="w-full md:w-auto"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}