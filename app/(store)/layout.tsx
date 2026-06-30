import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import prisma from "@/lib/prisma";

const SETTING_KEYS = [
  "free_shipping_above",
  "store_name",
  "store_tagline",
  "store_description",
  "support_email",
  "support_phone",
  "social_facebook",
  "social_instagram",
  "social_tiktok",
]

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    prisma.setting.findMany({ where: { key: { in: SETTING_KEYS } } }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }).catch(() => []),
  ])

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const freeShippingThreshold = settingsMap.free_shipping_above ? parseInt(settingsMap.free_shipping_above, 10) : 1000

  const branding = {
    storeName: settingsMap.store_name || "DRIP",
    storeTagline: settingsMap.store_tagline || "Wear Your Story",
    storeDescription:
      settingsMap.store_description ||
      "Modern Bangladeshi clothing for the bold and elegant. We blend minimal aesthetics with premium quality.",
    supportEmail: settingsMap.support_email || "support@drip.com.bd",
    supportPhone: settingsMap.support_phone || "+880 1700 000000",
    socialFacebook: settingsMap.social_facebook || "",
    socialInstagram: settingsMap.social_instagram || "",
    socialTiktok: settingsMap.social_tiktok || "",
  }

  return (
    <div className="min-h-screen flex flex-col bg-drip-bg text-drip-text">
      <Navbar
        freeShippingThreshold={freeShippingThreshold}
        storeName={branding.storeName}
        storeTagline={branding.storeTagline}
        categories={categories}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer branding={branding} categories={categories} />
    </div>
  );
}
