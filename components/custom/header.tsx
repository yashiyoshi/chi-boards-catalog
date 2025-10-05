import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Banner from "@/public/main-banner-black.png";
import Image from "next/image";
import Link from "next/link";
import { Search, FileSpreadsheet } from "lucide-react";

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
      <div className="flex items-center">
        <Button 
          variant="default" 
          asChild
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white border-gray-900 flex-shrink-0"
        >
          <Link 
            href="https://docs.google.com/spreadsheets/d/1k0SNQkLJhUhsioxW2rJ6ENYXobY5irm3_LbztpKX6Ac/edit#gid=0" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">View Stock Sheet</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
