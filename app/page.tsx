import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Banner from "@/public/main-banner-white.png";

export const metadata = {
  title: "Chi Boards",
  description: "Chi Boards - Premium Mechanical Keyboard Products",
};
export default async function Page() {
  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen bg-black text-white"
      style={{
        backgroundImage: 'url("/grid-bg-black.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div>
          <Image src={Banner} alt="main-banner" height={200} width={400} />
          <p className="text-white text-xl">Product Catalog</p>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row gap-8 items-center">
          <Link href="/catalog">
            <Button variant={"default"}>Shop now</Button>
          </Link>
          <Link href="https://www.facebook.com/chiboardstore" target="_blank" rel="noopener noreferrer">
            <Button variant={"outline"} className=" text-white bg-transparent border-transparent flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Visit our Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
