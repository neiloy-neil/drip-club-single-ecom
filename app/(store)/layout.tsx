import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import SessionProviderWrapper from "@/components/store/SessionProviderWrapper";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <div className="min-h-screen flex flex-col bg-drip-bg text-drip-text">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </SessionProviderWrapper>
  );
}
