import "./globals.css";
import { Inter } from "next/font/google";

export const metadata = {
  title: "Chi Boards",
  description: "A product catalog for Chi Boards",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen">
        <section className="flex-grow">
          <main>{children}</main>
        </section>
      </body>
    </html>
  );
}
