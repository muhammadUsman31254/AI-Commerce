import type { Metadata } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urdu",
});

export const metadata: Metadata = {
  title: "AI-Commerce | Clay & Craft",
  description: "AI-powered e-commerce dashboard for home-based Pakistani sellers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${urdu.variable}`}>
      <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
