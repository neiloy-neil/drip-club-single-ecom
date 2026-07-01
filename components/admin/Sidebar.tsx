"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Users, Package, Ticket, Gift, Truck,
  BarChart, Settings, PlusCircle, Building2, ClipboardList, Receipt, FileText,
  Zap, Percent, Tag, RotateCcw, Globe, Link2, MapPin, Layers, ScrollText,
  ShoppingBasket, Upload, UserCog, LayoutList
} from "lucide-react"

const sidebarLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  // Products
  { href: "/admin/products", icon: ShoppingBag, label: "Products" },
  { href: "/admin/products/import", icon: Upload, label: "Import CSV" },
  { href: "/admin/bundles", icon: Layers, label: "Bundles" },
  { href: "/admin/categories", icon: Tag, label: "Categories" },
  // Orders
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/orders/new", icon: PlusCircle, label: "New Order" },
  { href: "/admin/returns", icon: RotateCcw, label: "Returns & RMA" },
  { href: "/admin/abandoned-carts", icon: ShoppingBasket, label: "Abandoned Carts" },
  // Customers
  { href: "/admin/customers", icon: Users, label: "Customers" },
  // Inventory & Supply
  { href: "/admin/inventory", icon: Package, label: "Inventory" },
  { href: "/admin/suppliers", icon: Building2, label: "Suppliers" },
  { href: "/admin/purchase-orders", icon: ClipboardList, label: "Purchase Orders" },
  { href: "/admin/expenses", icon: Receipt, label: "Expenses" },
  // Marketing
  { href: "/admin/flash-sales", icon: Zap, label: "Flash Sales" },
  { href: "/admin/auto-discounts", icon: Percent, label: "Auto Discounts" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/affiliates", icon: Link2, label: "Affiliates" },
  { href: "/admin/loyalty", icon: Gift, label: "Loyalty" },
  // Shipping
  { href: "/admin/shipping-zones", icon: MapPin, label: "Shipping Zones" },
  { href: "/admin/delivery", icon: Truck, label: "Delivery" },
  // Content
  { href: "/admin/blog", icon: Globe, label: "Blog" },
  { href: "/admin/pages", icon: FileText, label: "Pages" },
  // Analytics & Ops
  { href: "/admin/reports", icon: BarChart, label: "Reports" },
  { href: "/admin/audit-log", icon: ScrollText, label: "Audit Log" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}`))
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
