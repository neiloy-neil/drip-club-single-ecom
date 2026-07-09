import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/store/ProductCard";
import { Truck, CreditCard, RefreshCw, Star } from "lucide-react";
import { serialize } from "@/lib/utils";

export default async function StoreHomepage() {
  const [banners, categories, newArrivals, featuredProducts] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.category.findMany({ where: { isActive: true }, take: 5, orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.product.findMany({ where: { isActive: true }, include: { category: true, images: true, variants: true }, take: 8, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.product.findMany({ where: { isActive: true, isFeatured: true }, include: { category: true, images: true, variants: true }, take: 4, orderBy: { createdAt: 'desc' } }).catch(() => [])
  ]);

  const allProductIds = [...new Set([...newArrivals.map((p: any) => p.id), ...featuredProducts.map((p: any) => p.id)])]
  const reviewAggs = allProductIds.length ? await prisma.review.groupBy({
    by: ['productId'],
    where: { productId: { in: allProductIds }, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  }).catch(() => []) : []
  const reviewMap = Object.fromEntries(reviewAggs.map((r: any) => [r.productId, r]))

  const heroBanner = banners[0] || {
    title: "Wear Your Story",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
    link: "/shop"
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* SECTION 1: Hero Banner */}
      <section className="relative w-full h-[90vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroBanner.image} alt="Hero" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="relative z-10 text-center space-y-6 max-w-3xl px-4 mt-20">
          <p className="text-drip-gold font-bold tracking-[0.2em] text-sm uppercase">NEW COLLECTION</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white tracking-tight leading-none">
            {heroBanner.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-light max-w-xl mx-auto">
            Discover the latest trends in fashion. Unapologetic style for the modern individual.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href={heroBanner.link || "/shop"} className="w-full sm:w-auto px-8 py-4 bg-drip-gold text-white font-medium hover:bg-yellow-600 transition-colors rounded-full">
              Shop Now
            </Link>
            <Link href="/lookbook" className="w-full sm:w-auto px-8 py-4 border border-white text-white font-medium hover:bg-white hover:text-black transition-colors rounded-full">
              View Lookbook
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          ↓
        </div>
      </section>

      {/* SECTION 2: Category Strip */}
      <section className="py-16 bg-drip-surface">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-4 pb-4 md:pb-0 hide-scrollbar snap-x">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/shop?categoryId=${cat.id}`} className="min-w-[200px] md:min-w-0 group relative block aspect-square rounded-xl overflow-hidden snap-center">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 200px, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                ) : (
                  <div className="w-full h-full bg-drip-muted flex items-center justify-center text-3xl font-heading text-drip-text/20 group-hover:scale-105 transition-transform duration-500 ease-out">
                    {cat.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:border-2 border-drip-gold transition-all duration-300 rounded-xl" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <h3 className="text-white font-bold tracking-wide uppercase text-sm">{cat.name}</h3>
                </div>
              </Link>
            ))}
            {/* Fallback Categories if db is empty */}
            {categories.length === 0 && ["Men", "Women", "Kids", "Accessories", "Sale"].map((name) => (
              <Link key={name} href={`/shop?category=${name.toLowerCase()}`} className="min-w-[200px] md:min-w-0 group relative block aspect-square rounded-xl overflow-hidden snap-center">
                 <div className="w-full h-full bg-drip-muted flex items-center justify-center text-3xl font-heading text-drip-text/20 group-hover:scale-105 transition-transform duration-500 ease-out">
                    {name.charAt(0)}
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:border-2 border-drip-gold transition-all duration-300 rounded-xl" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <h3 className="text-white font-bold tracking-wide uppercase text-sm">{name}</h3>
                  </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: New Arrivals */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 border-b border-drip-border pb-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-drip-black">New Arrivals</h2>
          <Link href="/shop?sort=newest" className="text-sm font-medium hover:text-drip-gold transition-colors pb-1">
            See All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {serialize(newArrivals).map((product: any) => <ProductCard key={product.id} product={product} avgRating={reviewMap[product.id]?._avg?.rating} reviewCount={reviewMap[product.id]?._count?.rating} />)}
        </div>
      </section>

      {/* SECTION 4: Featured Banner */}
      <section className="w-full bg-[#F5F3EE] overflow-hidden my-16">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 h-[400px] md:h-[600px] relative">
             <Image src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" alt="Summer Collection" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="w-full md:w-1/2 flex items-center justify-center p-12 lg:p-24 text-center md:text-left">
            <div className="max-w-md space-y-6">
              <p className="text-drip-gold font-bold tracking-widest text-xs uppercase">Limited Edition</p>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-drip-black leading-tight">
                Summer Collection 2024
              </h2>
              <p className="text-drip-text-muted leading-relaxed">
                Embrace the warmth with our newest line of breathable, sustainable fabrics designed for the ultimate comfort and effortless style.
              </p>
              <Link href="/shop?collection=summer-24" className="inline-block mt-4 px-8 py-3 bg-drip-black text-white rounded-full hover:bg-drip-gold transition-colors font-medium">
                Shop The Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Featured Picks */}
      {featuredProducts.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-drip-black mb-10 text-center">Featured Picks</h2>
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 pb-8 md:pb-0 hide-scrollbar snap-x">
            {serialize(featuredProducts).map((product: any) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0 snap-center">
                <ProductCard product={product} avgRating={reviewMap[product.id]?._avg?.rating} reviewCount={reviewMap[product.id]?._count?.rating} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: Why DRIP (Trust Signals) */}
      <section className="py-20 bg-drip-surface border-y border-drip-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-4 border border-transparent hover:border-drip-border rounded-2xl transition-colors">
              <Truck className="w-8 h-8 text-drip-gold" strokeWidth={1.5} />
              <h4 className="font-bold text-sm tracking-wide">Fast Delivery</h4>
              <p className="text-xs text-drip-text-muted">Nationwide within 3-5 days</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-4 border border-transparent hover:border-drip-border rounded-2xl transition-colors">
              <CreditCard className="w-8 h-8 text-drip-gold" strokeWidth={1.5} />
              <h4 className="font-bold text-sm tracking-wide">Easy Payment</h4>
              <p className="text-xs text-drip-text-muted">bKash, Nagad, and COD</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-4 border border-transparent hover:border-drip-border rounded-2xl transition-colors">
              <RefreshCw className="w-8 h-8 text-drip-gold" strokeWidth={1.5} />
              <h4 className="font-bold text-sm tracking-wide">Easy Returns</h4>
              <p className="text-xs text-drip-text-muted">7-day hassle-free returns</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-4 border border-transparent hover:border-drip-border rounded-2xl transition-colors">
              <Star className="w-8 h-8 text-drip-gold" strokeWidth={1.5} />
              <h4 className="font-bold text-sm tracking-wide">Quality Guaranteed</h4>
              <p className="text-xs text-drip-text-muted">Premium fabrics & finish</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Testimonials */}
      <section className="py-24 bg-[#F5F3EE]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-drip-black mb-4">What Our Community Says</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Tahsan R.", city: "Dhaka", text: "The quality is simply unmatched. Fits perfectly and the material feels premium. Definitely ordering again!" },
              { name: "Nadia I.", city: "Sylhet", text: "Loved the minimal aesthetic. The packaging was beautiful and delivery was super fast. Highly recommended." },
              { name: "Rahim M.", city: "Chattogram", text: "Best local brand right now. The style is modern yet very comfortable. The customer service was also great." },
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-drip space-y-4">
                <div className="flex text-drip-gold">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-drip-text text-sm leading-relaxed italic">"{review.text}"</p>
                <div className="pt-4 border-t border-drip-border">
                  <p className="font-bold text-sm">{review.name}</p>
                  <p className="text-xs text-drip-text-muted">{review.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
