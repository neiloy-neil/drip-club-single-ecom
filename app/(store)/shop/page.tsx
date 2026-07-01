import prisma from "@/lib/prisma"
import ProductCard from "@/components/store/ProductCard"
import { serialize } from "@/lib/utils"
import Link from "next/link"
import { Grid3X3, List as ListIcon } from "lucide-react"

import { getActiveFlashSaleBatch, applyFlashSaleDiscount } from "@/lib/flashSale"
import ShopFilters from "@/components/store/ShopFilters"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string
    brandId?: string
    size?: string
    color?: string
    sort?: string
    take?: string
    sale?: string
    minPrice?: string
    maxPrice?: string
    search?: string
  }>
}) {
  const params = await searchParams
  const categoryId = params.categoryId || ""
  const brandId = params.brandId || ""
  const size = params.size || ""
  const color = params.color || ""
  const sort = params.sort || "newest"
  const saleOnly = params.sale === "true"
  const minPrice = params.minPrice || ""
  const maxPrice = params.maxPrice || ""
  const search = params.search || ""
  const take = parseInt(params.take || "12")

  let orderBy: any = { createdAt: "desc" }
  if (sort === "price-asc") orderBy = { price: "asc" }
  if (sort === "price-desc") orderBy = { price: "desc" }

  const where: any = { isActive: true }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
    ]
  }
  if (categoryId) where.categoryId = categoryId
  if (brandId) where.brandId = brandId
  if (saleOnly) where.comparePrice = { not: null }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = Number(minPrice)
    if (maxPrice) where.price.lte = Number(maxPrice)
  }
  if (size || color) {
    where.variants = { some: {} }
    if (size) where.variants.some.size = size
    if (color) where.variants.some.color = color
  }

  const [products, totalProducts, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: true, variants: true },
      orderBy,
      take,
    }).catch(() => []),
    prisma.product.count({ where }).catch(() => 0),
    prisma.category.findMany({ where: { isActive: true } }).catch(() => []),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).catch(() => []),
  ])

  const hasMore = totalProducts > take

  const flashSaleMap = await getActiveFlashSaleBatch(
    products.map((p: any) => ({ id: p.id, categoryId: p.categoryId }))
  ).catch(() => new Map())

  const current = { categoryId, brandId, size, color, sort, minPrice, maxPrice, sale: params.sale || "", search }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-drip-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-drip-black mb-2">
            {search ? `"${search}"` : "Shop All"}
          </h1>
          <p className="text-sm text-drip-text-muted">
            {search ? `${totalProducts} result${totalProducts !== 1 ? "s" : ""}` : `Showing ${products.length} of ${totalProducts} products`}
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <form className="flex items-center gap-2">
            <select
              name="sort"
              defaultValue={sort}
              className="border-none bg-drip-muted text-drip-text text-sm px-4 py-2 rounded-full focus:ring-1 focus:ring-drip-gold outline-none cursor-pointer"
              onChange={(e) => {
                // handled by form submit on change via hidden button below
              }}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
            {brandId && <input type="hidden" name="brandId" value={brandId} />}
            {size && <input type="hidden" name="size" value={size} />}
            {color && <input type="hidden" name="color" value={color} />}
            {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
            {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
          </form>

          <div className="hidden md:flex items-center gap-1 bg-drip-muted p-1 rounded-full text-drip-text-muted">
            <button className="p-1.5 bg-white rounded-full shadow-sm text-drip-black">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:text-drip-black transition-colors">
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filters sidebar — handles both desktop (inline) and mobile (drawer) */}
        <ShopFilters
          categories={categories as any}
          brands={brands as any}
          current={current}
        />

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-drip-muted rounded-2xl border border-drip-border">
              <p className="text-drip-text-muted">No products found matching your criteria.</p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2 bg-white border border-drip-border rounded-full hover:border-drip-gold text-sm font-medium transition-colors"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-12">
                {serialize(products).map((product: any) => {
                  const sale = flashSaleMap.get(product.id)
                  const flashSalePrice = sale
                    ? applyFlashSaleDiscount(Number(product.price), sale)
                    : undefined
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      flashSalePrice={flashSalePrice}
                      flashSaleLabel={
                        sale
                          ? sale.discountType === "PERCENTAGE"
                            ? `${sale.discountValue}% off`
                            : `৳${sale.discountValue} off`
                          : undefined
                      }
                    />
                  )
                })}
              </div>

              {hasMore && (
                <div className="mt-16 text-center border-t border-drip-border pt-8">
                  <p className="text-xs text-drip-text-muted mb-4">
                    Showing {products.length} of {totalProducts}
                  </p>
                  <Link
                    href={`/shop?take=${take + 12}${categoryId ? `&categoryId=${categoryId}` : ""}${size ? `&size=${size}` : ""}${color ? `&color=${color}` : ""}${sort !== "newest" ? `&sort=${sort}` : ""}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}`}
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

