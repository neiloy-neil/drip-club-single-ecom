import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-heading" 
});
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-mono" // Reusing mono for numbers/prices
});

export const metadata: Metadata = {
  title: "DRIP | Wear Your Story",
  description: "Modern Bangladeshi clothing brand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(
      "font-sans", 
      inter.variable, 
      playfair.variable, 
      spaceGrotesk.variable
    )}>
      <body className="antialiased text-drip-text bg-drip-bg selection:bg-drip-gold/30">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
