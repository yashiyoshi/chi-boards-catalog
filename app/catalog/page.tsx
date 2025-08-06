'use client';

import * as React from 'react';
import FilterPanel from '@/components/custom/filter-panel';
import Header from '@/components/custom/header';
import FilterBreadcrumbs from '@/components/custom/filter-breadcrumbs';
import { ProductTypes, Budget } from '@/lib/types';

export default function Catalog() {
  const [productTypes, setProductTypes] = React.useState<ProductTypes>({
    keyboards65: false,
    keyboards75: false,
    keyboardsTKL: false,
    switchesLinear: false,
    switchesTactile: false,
    switchesClicky: false,
    deskpads: false,
    keycaps: false,
  });

  const [budget, setBudget] = React.useState<Budget>({
    under50: false,
    between50and150: false,
    over150: false,
  });

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url("/grid-bg-black.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Header />
      <div className="mx-12">
        <FilterPanel
          productTypes={productTypes}
          setProductTypes={setProductTypes}
          budget={budget}
          setBudget={setBudget}
        />
        <FilterBreadcrumbs
          productTypes={productTypes}
          setProductTypes={setProductTypes}
          budget={budget}
          setBudget={setBudget}
        />

        {/* Cards */}
        <div>
          <div className="w-1/4 h-1/4 bg-red-100">test</div>
        </div>
      </div>
    </div>
  );
}
