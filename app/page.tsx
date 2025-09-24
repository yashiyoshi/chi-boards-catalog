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
          <p className="text-white">Product Catalog</p>
        </div>
        <div className="mt-12">
          <Link href="/catalog">
            <Button variant={"default"}>Shop now!</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
