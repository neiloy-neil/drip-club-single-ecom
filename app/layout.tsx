import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import Analytics from "@/components/Analytics";
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-mono" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drip.com.bd"

export async function generateMetadata(): Promise<Metadata> {
  let siteTitle = "DRIP | Wear Your Story"
  let siteDescription = "Modern Bangladeshi clothing brand. Shop premium t-shirts, shirts, dresses, kurtis and accessories. Free delivery above ৳1000."

  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["meta_title", "meta_description"] } },
    })
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    if (map["meta_title"]) siteTitle = map["meta_title"]
    if (map["meta_description"]) siteDescription = map["meta_description"]
  } catch { /* DB unavailable — use defaults */ }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteTitle,
      template: "%s | DRIP",
    },
    description: siteDescription,
    keywords: ["Bangladesh fashion", "clothing store", "online shopping BD", "DRIP fashion", "t-shirt", "kurti", "dress", "shirt Bangladesh"],
    authors: [{ name: "DRIP" }],
    creator: "DRIP",
    openGraph: {
      type: "website",
      locale: "en_BD",
      url: SITE_URL,
      siteName: "DRIP",
      title: siteTitle,
      description: siteDescription,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "DRIP Fashion" }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, playfair.variable, spaceGrotesk.variable)}>
      <body className="antialiased text-drip-text bg-drip-bg selection:bg-drip-gold/30">
        <Analytics />
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
