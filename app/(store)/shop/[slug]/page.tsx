import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import { notFound } from "next/navigation"
import ProductGallery from "@/components/store/ProductGallery"
import VariantSelector from "@/components/store/VariantSelector"
import ProductCard from "@/components/store/ProductCard"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Truck, RefreshCw, ShieldCheck } from "lucide-react"

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
    }
  }).catch(() => null)

  if (!product) {
    notFound()
  }

  // Fetch related products
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categoryId: product.categoryId, 
      id: { not: product.id },
      isActive: true 
    },
    take: 4,
    include: { category: true, images: true, variants: true }
  }).catch(() => [])

  return (
    <div className="bg-drip-bg animate-in fade-in duration-500">
      
      {/* Breadcrumb - Minimal */}
      <div className="container mx-auto px-4 py-6 text-[10px] uppercase tracking-widest text-drip-text-muted">
        <a href="/" className="hover:text-drip-gold transition-colors">Home</a>
        <span className="mx-2">/</span>
        <a href="/shop" className="hover:text-drip-gold transition-colors">Shop</a>
        <span className="mx-2">/</span>
        <a href={`/shop?categoryId=${product.categoryId}`} className="hover:text-drip-gold transition-colors">{product.category?.name}</a>
        <span className="mx-2">/</span>
        <span className="text-drip-text font-bold">{product.name}</span>
      </div>

      <div className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery - Split layout on desktop, stacked on mobile */}
          <div className="w-full lg:w-3/5">
            <ProductGallery images={serialize(product.images)} />
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-2/5 flex flex-col pt-4 lg:pt-10 sticky top-20 h-max">

            {/* Title & Price */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-drip-black mb-4 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="font-mono text-2xl font-bold">৳{Number(product.price).toLocaleString()}</span>
                {product.comparePrice && (
                  <span className="font-mono text-lg text-drip-text-muted line-through">৳{Number(product.comparePrice).toLocaleString()}</span>
                )}
                {product.comparePrice && (
                  <span className="bg-drip-error/10 text-drip-error px-2 py-1 text-xs font-bold rounded uppercase tracking-widest">Sale</span>
                )}
              </div>
            </div>

            {/* Selectors */}
            <VariantSelector product={serialize(product)} />

            {/* Accordions for extra info */}
            <div className="mt-12 border-t border-drip-border">
              <Accordion defaultValue={["details"]} className="w-full">
                
                <AccordionItem value="details" className="border-drip-border">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-widest hover:text-drip-gold hover:no-underline">Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm text-drip-text-muted max-w-none" dangerouslySetInnerHTML={{ __html: product.description || "No description provided." }} />
                    {product.tags && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {product.tags.split(',').map((tag: string) => (
                          <span key={tag.trim()} className="px-3 py-1 bg-drip-muted text-xs text-drip-text-muted rounded-full border border-drip-border">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="delivery" className="border-drip-border">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-widest hover:text-drip-gold hover:no-underline">Delivery & Returns</AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm text-drip-text-muted">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-drip-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-drip-text">Standard Delivery</p>
                        <p>Delivered within 3-5 working days. Free on orders above ৳1000.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-drip-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-drip-text">Hassle-Free Returns</p>
                        <p>Return any unworn item within 7 days of delivery.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-drip-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-drip-text">Secure Checkout</p>
                        <p>We accept bKash, Nagad, and Cash on Delivery.</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>
            
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 md:mt-32">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-drip-black mb-10 text-center">Complete The Look</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {serialize(relatedProducts).map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
