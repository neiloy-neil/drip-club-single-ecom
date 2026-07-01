"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Users, Package, Ticket, Gift, Truck,
  BarChart, Settings, PlusCircle, Building2, ClipboardList, Receipt, FileText,
  Zap, Percent, Tag, RotateCcw, Globe, Link2, MapPin, Layers, ScrollText,
  ShoppingBasket, Upload, CreditCard, Workflow, Wallet, Award, TrendingUp,
  Sliders, ChevronRight, Crown, Calendar, Warehouse, Download, LineChart, PieChart,
  RefreshCw, Search, ChevronDown
} from "lucide-react"

type NavItem = { href: string; icon: any; label: string }
type NavGroup = { label: string; icon: any; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: "Catalog",
    icon: ShoppingBag,
    items: [
      { href: "/admin/products", icon: ShoppingBag, label: "Products" },
      { href: "/admin/categories", icon: Tag, label: "Categories" },
      { href: "/admin/brands", icon: Award, label: "Brands" },
      { href: "/admin/bundles", icon: Layers, label: "Bundles" },
      { href: "/admin/inventory", icon: Package, label: "Inventory" },
      { href: "/admin/products/import", icon: Upload, label: "Import CSV" },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    items: [
      { href: "/admin/orders", icon: ShoppingCart, label: "All Orders" },
      { href: "/admin/orders/new", icon: PlusCircle, label: "New Order" },
      { href: "/admin/returns", icon: RotateCcw, label: "Returns & RMA" },
      { href: "/admin/abandoned-carts", icon: ShoppingBasket, label: "Abandoned Carts" },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    items: [
      { href: "/admin/customers", icon: Users, label: "All Customers" },
      { href: "/admin/store-credit", icon: Wallet, label: "Store Credit" },
      { href: "/admin/loyalty", icon: Gift, label: "Loyalty Points" },
      { href: "/admin/memberships", icon: Crown, label: "Memberships" },
      { href: "/admin/affiliates", icon: Link2, label: "Affiliates" },
    ],
  },
  {
    label: "Marketing",
    icon: Zap,
    items: [
      { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
      { href: "/admin/flash-sales", icon: Zap, label: "Flash Sales" },
      { href: "/admin/auto-discounts", icon: Percent, label: "Auto Discounts" },
      { href: "/admin/price-rules", icon: TrendingUp, label: "Price Rules" },
      { href: "/admin/gift-cards", icon: CreditCard, label: "Gift Cards" },
      { href: "/admin/order-bumps", icon: ChevronRight, label: "Order Bumps" },
      { href: "/admin/workflows", icon: Workflow, label: "Workflows" },
    ],
  },
  {
    label: "Finance",
    icon: Receipt,
    items: [
      { href: "/admin/suppliers", icon: Building2, label: "Suppliers" },
      { href: "/admin/purchase-orders", icon: ClipboardList, label: "Purchase Orders" },
      { href: "/admin/expenses", icon: Receipt, label: "Expenses" },
    ],
  },
  {
    label: "Shipping",
    icon: Truck,
    items: [
      { href: "/admin/shipping-zones", icon: MapPin, label: "Shipping Zones" },
      { href: "/admin/delivery", icon: Truck, label: "Delivery Methods" },
      { href: "/admin/locations", icon: Warehouse, label: "Locations" },
    ],
  },
  {
    label: "Checkout & UX",
    icon: Sliders,
    items: [
      { href: "/admin/checkout-fields", icon: Sliders, label: "Checkout Fields" },
      { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
    ],
  },
  {
    label: "Content",
    icon: Globe,
    items: [
      { href: "/admin/blog", icon: Globe, label: "Blog" },
      { href: "/admin/pages", icon: FileText, label: "Pages" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart,
    items: [
      { href: "/admin/reports", icon: BarChart, label: "Reports" },
      { href: "/admin/analytics/products", icon: LineChart, label: "Product Analytics" },
      { href: "/admin/analytics/cohorts", icon: PieChart, label: "Cohort & LTV" },
      { href: "/admin/export", icon: Download, label: "Export Data" },
    ],
  },
  {
    label: "Admin",
    icon: Settings,
    items: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
      { href: "/admin/audit-log", icon: ScrollText, label: "Audit Log" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [search, setSearch] = useState("")

  // Which groups are open — default open whichever group contains the active path
  const defaultOpen = navGroups.reduce<Record<string, boolean>>((acc, g) => {
    const hasActive = g.items.some(
      (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
    )
    acc[g.label] = hasActive
    return acc
  }, {})
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(defaultOpen)

  const query = search.toLowerCase().trim()

  const toggle = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  // Flat filtered list when searching
  const allItems = navGroups.flatMap((g) => g.items)
  const filtered = query ? allItems.filter((i) => i.label.toLowerCase().includes(query)) : null

  return (
    <nav className="flex flex-col gap-1 px-3">
      {/* Dashboard — always visible */}
      <Link
        href="/admin"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          pathname === "/admin"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        Dashboard
      </Link>

      {/* Search */}
      <div className="relative my-1">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu…"
          className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Filtered flat list */}
      {filtered ? (
        <div className="flex flex-col gap-0.5">
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No results</p>
          )}
          {filtered.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSearch("")}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      ) : (
        /* Grouped collapsible nav */
        <div className="flex flex-col gap-0.5 mt-1">
          {navGroups.map((group) => {
            const isOpen = !!openGroups[group.label]
            const hasActive = group.items.some(
              (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            )
            return (
              <div key={group.label}>
                <button
                  onClick={() => toggle(group.label)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    hasActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <group.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-border pl-3">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </nav>
  )
}
