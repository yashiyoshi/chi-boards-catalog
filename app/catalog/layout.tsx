import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Chi Boards: Product Catalog",
  description: "Browse our comprehensive collection of premium mechanical keyboards, switches, keycaps, and accessories",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}