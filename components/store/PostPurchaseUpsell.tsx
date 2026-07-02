"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useCartStore } from "@/store/useCartStore"
import { toast } from "sonner"
import { Zap } from "lucide-react"

type Bump = {
  id: string
  headline: string
  description: string | null
  discountPct: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: { url: string }[]
    variants: { id: string; size: string; color: string; stock: number }[]
  }
}

export default function PostPurchaseUpsell({ orderTotal }: { orderTotal: number }) {
  const [bump, setBump] = useState<Bump | null>(null)
  const [added, setAdded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { addItem } = useCartStore()

  useEffect(() => {
    fetch("/api/store/order-bumps")
      .then(r => r.json())
      .then(d => {
        const eligible = (d.bumps || []).find((b: any) =>
          !b.triggerMinTotal || orderTotal >= Number(b.triggerMinTotal)
        )
        if (eligible) setBump(eligible)
      })
      .catch(() => {})
  }, [orderTotal])

  if (!bump || dismissed) return null

  const discountedPrice = Math.round(Number(bump.product.price) * (1 - bump.discountPct / 100))
  const defaultVariant = bump.product.variants.find(v => v.stock > 0) || bump.product.variants[0]

  const handleAdd = () => {
    if (!defaultVariant) return
    addItem({
      variantId: defaultVariant.id,
      productId: bump.product.id,
      name: bump.product.name,
      slug: bump.product.slug,
      size: defaultVariant.size,
      color: defaultVariant.color,
      price: discountedPrice,
      image: bump.product.images[0]?.url || null,
    })
    setAdded(true)
    toast.success("Added to your next order!")
  }

  return (
    <div className="mt-12 border-2 border-drip-gold/40 rounded-2xl overflow-hidden bg-drip-gold/5">
      <div className="bg-drip-gold/10 px-6 py-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-drip-gold fill-drip-gold" />
        <span className="text-xs font-bold uppercase tracking-widest text-drip-black">Exclusive one-time offer</span>
      </div>
      <div className="p-6 flex gap-6 items-center">
        <div className="relative h-24 w-20 shrink-0 rounded-lg overflow-hidden bg-drip-muted">
          <Image src={bump.product.images[0]?.url || "/placeholder.jpg"} alt={bump.product.name} fill sizes="80px" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base">{bump.headline}</p>
          {bump.description && <p className="text-sm text-drip-text-muted mt-1">{bump.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono font-bold text-lg text-drip-gold">৳{discountedPrice.toLocaleString()}</span>
            {bump.discountPct > 0 && (
              <>
                <span className="font-mono text-sm text-drip-text-muted line-through">৳{Number(bump.product.price).toLocaleString()}</span>
                <span className="text-xs font-bold text-drip-success bg-drip-success/10 px-2 py-0.5 rounded">-{bump.discountPct}%</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {added ? (
            <span className="px-4 py-2 text-sm font-bold text-drip-success border border-drip-success rounded-full">✓ Added!</span>
          ) : (
            <button onClick={handleAdd} className="px-4 py-2 bg-drip-black text-white text-sm font-bold rounded-full hover:bg-drip-gold transition-colors whitespace-nowrap">
              Yes, add it!
            </button>
          )}
          <button onClick={() => setDismissed(true)} className="text-xs text-drip-text-muted hover:text-drip-black transition-colors text-center">
            No thanks
          </button>
        </div>
      </div>
    </div>
  )
}
