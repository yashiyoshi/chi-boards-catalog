import "./globals.css";
import { Inter } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
