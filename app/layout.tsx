import { Toaster } from "sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// फ़ाइल का नाम ठीक कर दिया गया है
const inter = localFont({
  src: "./fonts/Inter_18pt-Regular.ttf", // <--- यहाँ सही नाम डाल दिया है
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PrepWise",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased pattern`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
