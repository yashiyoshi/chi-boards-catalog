import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Banner from "@/public/main-banner-black.png";
import Image from "next/image";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <div className="flex min-w-screen items-center justify-between p-8">
      <Image src={Banner} alt="main-banner" height={50} width={100} />
      <div className=" flex flex-row gap-2 w-1/2">
        <Input type="search" placeholder="Search for..." />
        <Button type="submit" variant="outline">
          <Search />
        </Button>
      </div>
      <div></div>
    </div>
  );
}
