import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Banner from "@/public/main-banner-black.png";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export default function Header({ searchQuery, onSearchChange, onSearchSubmit }: HeaderProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };
  return (
    <div className="flex min-w-screen items-center justify-between p-8">
      <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
        <Image src={Banner} alt="main-banner" height={50} width={100} />
      </Link>
      <form onSubmit={handleSubmit} className="flex flex-row gap-2 w-1/2">
        <Input
          className="bg-[#fefefefe]"
          type="search"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button type="submit" variant="outline">
          <Search />
        </Button>
      </form>
      <div></div>
    </div>
  );
}
