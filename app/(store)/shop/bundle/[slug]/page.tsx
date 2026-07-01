import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import BundleAddToCart from "./BundleAddToCart"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const bundle = await prisma.bundle.findUnique({ where: { slug, isActive: true } }).catch(() => null)
  if (!bundle) return { title: "Bundle Not Found" }
  return { title: `${bundle.name} Bundle`, description: bundle.description || "" }
}

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bundle = await prisma.bundle.findUnique({
    where: { slug, isActive: true },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              variants: true,
            },
          },
        },
      },
    },
  }).catch(() => null)

  if (!bundle) notFound()

  const originalTotal = bundle.items.reduce((s, item) => s + Number(item.product.price) * item.quantity, 0)
  const saving = originalTotal - Number(bundle.price)

  return (
    <div className="bg-drip-bg min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product grid */}
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-drip-gold">Bundle Deal</span>
            <h1 className="text-3xl font-heading font-bold text-drip-black mt-1 mb-2">{bundle.name}</h1>
            {bundle.description && <p className="text-drip-text-muted mb-8">{bundle.description}</p>}

            <div className="space-y-4">
              {bundle.items.map((item, idx) => {
                const image = item.product.images[0]?.url
                return (
                  <div key={item.id} className="flex gap-4 bg-white rounded-xl p-4 border border-drip-border">
                    {idx > 0 && <div className="self-center text-xl font-bold text-drip-text-muted shrink-0">+</div>}
                    {image && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-drip-black">{item.product.name}</h3>
                      <p className="text-sm text-drip-text-muted">{item.quantity > 1 ? `×${item.quantity}` : ""}</p>
                      <p className="font-mono text-sm text-drip-text-muted line-through">৳{Number(item.product.price).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-2xl border border-drip-border p-6 sticky top-24 space-y-4">
              {bundle.image && (
                <div className="rounded-xl overflow-hidden aspect-square mb-4">
                  <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Bundle Price</p>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-3xl font-mono font-bold text-drip-black">৳{Number(bundle.price).toLocaleString()}</span>
                  <span className="text-lg font-mono text-drip-text-muted line-through mb-0.5">৳{originalTotal.toLocaleString()}</span>
                </div>
                {saving > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-drip-success/10 text-drip-success rounded-full text-xs font-bold">
                    You save ৳{saving.toLocaleString()}
                  </div>
                )}
              </div>
              <BundleAddToCart bundle={JSON.parse(JSON.stringify(bundle))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
