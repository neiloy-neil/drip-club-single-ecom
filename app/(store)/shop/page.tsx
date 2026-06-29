import prisma from "@/lib/prisma"
import ProductCard from "@/components/store/ProductCard"
import { serialize } from "@/lib/utils"
import Link from "next/link"
import { Filter, Grid3X3, List as ListIcon, X } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ categoryId?: string, size?: string, color?: string, sort?: string, take?: string }>
}) {
  const params = await searchParams;
  const categoryId = params.categoryId
  const size = params.size
  const color = params.color
  const sort = params.sort || "newest"
  
  const take = parseInt(params.take || "12")

  let orderBy: any = { createdAt: 'desc' }
  if (sort === "price-asc") orderBy = { price: 'asc' }
  if (sort === "price-desc") orderBy = { price: 'desc' }

  const where: any = { isActive: true }
  if (categoryId) where.categoryId = categoryId
  
  if (size || color) {
    where.variants = { some: {} }
    if (size) where.variants.some.size = size
    if (color) where.variants.some.color = color
  }

  const [products, totalProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: true, variants: true },
      orderBy,
      take,
    }).catch(() => []),
    prisma.product.count({ where }).catch(() => 0),
    prisma.category.findMany({ where: { isActive: true } }).catch(() => [])
  ])

  const hasMore = totalProducts > take;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-drip-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-drip-black mb-2">Shop All</h1>
          <p className="text-sm text-drip-text-muted">Showing {products.length} of {totalProducts} products</p>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          {/* Mobile Filter Trigger (Placeholder for client drawer - we'll just show sidebar on mobile for now with CSS or a basic toggle) */}
          <button className="md:hidden flex items-center gap-2 text-sm font-medium border border-drip-border px-4 py-2 rounded-full">
            <Filter className="w-4 h-4" /> Filter
          </button>
          
          <div className="flex items-center gap-4">
            <form className="flex items-center gap-2">
              <select name="sort" defaultValue={sort} className="border-none bg-drip-muted text-drip-text text-sm px-4 py-2 rounded-full focus:ring-1 focus:ring-drip-gold outline-none cursor-pointer">
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              {/* Hidden inputs to preserve other filters on sort change */}
              {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
              {size && <input type="hidden" name="size" value={size} />}
              {color && <input type="hidden" name="color" value={color} />}
            </form>
            
            <div className="hidden md:flex items-center gap-1 bg-drip-muted p-1 rounded-full text-drip-text-muted">
              <button className="p-1.5 bg-white rounded-full shadow-sm text-drip-black"><Grid3X3 className="w-4 h-4" /></button>
              <button className="p-1.5 hover:text-drip-black transition-colors"><ListIcon className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Filters Sidebar (Desktop) */}
        <div className="hidden lg:block w-64 shrink-0 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-widest">Filters</h3>
            {(categoryId || size || color) && (
              <Link href="/shop" className="text-xs text-drip-text-muted hover:text-drip-error transition-colors flex items-center gap-1">
                <X className="w-3 h-3" /> Clear All
              </Link>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Category</h4>
            <ul className="space-y-3 text-sm text-drip-text-muted">
              <li>
                <Link href="/shop" className={`flex items-center gap-3 hover:text-drip-gold transition-colors ${!categoryId ? "text-drip-black font-medium" : ""}`}>
                  <div className={`w-4 h-4 rounded border ${!categoryId ? "bg-drip-gold border-drip-gold" : "border-drip-border"}`} />
                  All Products
                </Link>
              </li>
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/shop?categoryId=${cat.id}`} className={`flex items-center gap-3 hover:text-drip-gold transition-colors ${categoryId === cat.id ? "text-drip-black font-medium" : ""}`}>
                    <div className={`w-4 h-4 rounded border ${categoryId === cat.id ? "bg-drip-gold border-drip-gold" : "border-drip-border"}`} />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Size</h4>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => {
                const isActive = size === s;
                // Construct URL keeping other params
                const params = new URLSearchParams();
                if (categoryId) params.set("categoryId", categoryId);
                if (color) params.set("color", color);
                if (sort !== "newest") params.set("sort", sort);
                if (!isActive) params.set("size", s); // toggle
                const href = `/shop?${params.toString()}`;
                
                return (
                  <Link key={s} href={href} className={`border px-3 py-1.5 text-xs rounded-full transition-colors ${isActive ? 'border-drip-black bg-drip-black text-white' : 'border-drip-border hover:border-drip-gold text-drip-text-muted'}`}>
                    {s}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Color</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Black', hex: '#000000' }, 
                { name: 'White', hex: '#FFFFFF' }, 
                { name: 'Navy', hex: '#1e3a8a' }, 
                { name: 'Olive', hex: '#4d7c0f' }, 
                { name: 'Beige', hex: '#f5f5dc' }
              ].map(c => {
                const isActive = color === c.name;
                const params = new URLSearchParams();
                if (categoryId) params.set("categoryId", categoryId);
                if (size) params.set("size", size);
                if (sort !== "newest") params.set("sort", sort);
                if (!isActive) params.set("color", c.name);
                const href = `/shop?${params.toString()}`;

                return (
                  <Link key={c.name} href={href} title={c.name} className={`w-8 h-8 rounded-full border-2 transition-all ${isActive ? 'border-drip-gold scale-110' : 'border-transparent hover:scale-110 shadow-sm'}`} style={{ backgroundColor: c.hex, border: isActive ? '2px solid #C9A84C' : c.hex === '#FFFFFF' ? '1px solid #E8E8E4' : 'none' }}>
                  </Link>
                )
              })}
            </div>
          </div>

        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-drip-muted rounded-2xl border border-drip-border">
              <p className="text-drip-text-muted">No products found matching your criteria.</p>
              <Link href="/shop" className="inline-block px-6 py-2 bg-white border border-drip-border rounded-full hover:border-drip-gold text-sm font-medium transition-colors">
                Clear Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-12">
                {serialize(products).map((product: any) => <ProductCard key={product.id} product={product} />)}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="mt-16 text-center border-t border-drip-border pt-8">
                  <p className="text-xs text-drip-text-muted mb-4">Showing {products.length} of {totalProducts}</p>
                  <Link 
                    href={`/shop?take=${take + 12}${categoryId ? `&categoryId=${categoryId}` : ''}${size ? `&size=${size}` : ''}${color ? `&color=${color}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
                    scroll={false}
                    className="inline-block px-12 py-3 bg-drip-surface border border-drip-border text-drip-black font-medium hover:border-drip-black rounded-full transition-colors"
                  >
                    Load More
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
