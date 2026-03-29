import type { Metadata } from "next";
import { Roboto, Open_Sans } from "next/font/google"; 
import "./globals.css";
import { Providers } from "@/components/Providers";

// Highly readable, classic Enterprise body font
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  display: 'swap',
});

// Structural, sharp, highly professional structural font for headings
const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Reimbursement System",
  description: "Enterprise Expense & Reimbursement Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
