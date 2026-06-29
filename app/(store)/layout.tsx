import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import SessionProviderWrapper from "@/components/store/SessionProviderWrapper";
import prisma from "@/lib/prisma";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const freeShippingSetting = await prisma.setting.findUnique({ where: { key: "free_shipping_above" } });
  const freeShippingThreshold = freeShippingSetting ? parseInt(freeShippingSetting.value, 10) : 1000;

  return (
    <SessionProviderWrapper>
      <div className="min-h-screen flex flex-col bg-drip-bg text-drip-text">
        <Navbar freeShippingThreshold={freeShippingThreshold} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </SessionProviderWrapper>
  );
}
