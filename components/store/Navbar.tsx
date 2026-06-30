"use client"

import Link from "next/link"
import { Search, Heart, User, Menu, X } from "lucide-react"
import { useState } from "react"
import { useCartStore } from "@/store/useCartStore"
import { useWishlistStore } from "@/store/useWishlistStore"
import CartDrawer from "@/components/store/CartDrawer"
import SearchModal from "@/components/store/SearchModal"

type NavCategory = { id: string; name: string; slug: string }

export default function Navbar({
  freeShippingThreshold = 1000,
  storeName = "DRIP",
  storeTagline = "Wear Your Story",
  categories = [],
}: {
  freeShippingThreshold?: number
  storeName?: string
  storeTagline?: string
  categories?: NavCategory[]
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const navCategories = categories.slice(0, 4)

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-drip-black text-drip-surface text-center py-2 text-xs md:text-sm font-medium tracking-wide overflow-hidden">
        <p className="whitespace-nowrap">Free delivery on orders above ৳{freeShippingThreshold} 🚚</p>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-drip-border bg-drip-surface/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4 md:w-1/3">
            <button
              className="md:hidden p-2 -ml-2 text-drip-text"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex flex-col">
              <span className="font-heading font-bold text-2xl md:text-3xl tracking-tight leading-none">{storeName}</span>
              <span className="text-[10px] uppercase tracking-widest text-drip-text-muted leading-tight mt-0.5 hidden md:block">{storeTagline}</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-8 w-1/3">
            <Link href="/" className="text-sm font-medium hover:text-drip-gold transition-colors">Home</Link>
            <Link href="/shop" className="text-sm font-medium hover:text-drip-gold transition-colors">Shop</Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?categoryId=${cat.id}`}
                className="text-sm font-medium hover:text-drip-gold transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/shop?sort=newest" className="text-sm font-medium hover:text-drip-gold transition-colors">New Arrivals</Link>
            <Link href="/shop?sale=true" className="text-sm font-medium text-drip-error hover:text-drip-error/80 transition-colors">Sale</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center justify-end gap-3 md:gap-5 w-1/3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-drip-text hover:text-drip-gold transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Link href="/wishlist" className="p-2 hidden md:block relative text-drip-text hover:text-drip-gold transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-drip-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/login" className="p-2 hidden md:block text-drip-text hover:text-drip-gold transition-colors" aria-label="Account">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </Link>

            <CartDrawer itemCount={itemCount} freeShippingThreshold={freeShippingThreshold} />
          </div>

        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-drip-surface p-8 flex flex-col gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-2xl">{storeName}</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 text-lg font-medium">
              <Link href="/" onClick={() => setMobileOpen(false)} className="hover:text-drip-gold transition-colors">Home</Link>
              <Link href="/shop" onClick={() => setMobileOpen(false)} className="hover:text-drip-gold transition-colors">Shop</Link>
              {navCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?categoryId=${cat.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="hover:text-drip-gold transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/shop?sort=newest" onClick={() => setMobileOpen(false)} className="hover:text-drip-gold transition-colors">New Arrivals</Link>
              <Link href="/shop?sale=true" onClick={() => setMobileOpen(false)} className="text-drip-error">Sale</Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="hover:text-drip-gold transition-colors flex items-center gap-2">
                Wishlist {wishlistCount > 0 && <span className="bg-drip-error text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
              </Link>
              <Link href="/account" onClick={() => setMobileOpen(false)} className="hover:text-drip-gold transition-colors">My Account</Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="hover:text-drip-gold transition-colors">Cart ({itemCount})</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
