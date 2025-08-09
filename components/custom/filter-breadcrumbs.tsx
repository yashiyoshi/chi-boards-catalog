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
  switchesSilentLinear: "Switch: Silent Linear",
  switchesMagnetic: "Switch: Magnetic",
  deskpads: "Deskpads",
  keycapsCherry: "Keycap: Cherry",
  keycapsXDA: "Keycap: XDA",
  keycapsOEM: "Keycap: OEM",
  keycapsOther: "Keycap: Other",
  under50: "Budget: $",
  between50and150: "Budget: $$",
  over150: "Budget: $$$",
};

export default function FilterBreadcrumbs() {
  return (
    <div className={`flex items-center flex-wrap gap-2 mb-4 invisible`}>
      <span className="text-sm font-semibold">Active Filters:</span>
    </div>
  );
}
