"use client"
import { useEffect } from "react"
import { useRecentlyViewed, RecentProduct } from "@/hooks/useRecentlyViewed"

export function RecentlyViewedTracker({ product }: { product: RecentProduct }) {
  const { addItem } = useRecentlyViewed()
  useEffect(() => {
    addItem(product)
    // Fire funnel event
    fetch("/api/store/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "product_view", productId: product.id, value: product.price }),
    }).catch(() => {})
  }, [product.id])
  return null
}
