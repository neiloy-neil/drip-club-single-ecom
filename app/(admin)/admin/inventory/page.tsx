import prisma from "@/lib/prisma"
import { InventoryClient } from "./InventoryClient"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { category?: string; stock?: string }
}) {
  const categoryId = searchParams.category
  const stockStatus = searchParams.stock

  const where: any = {}
  if (categoryId) {
    where.productId = {
      in: (await prisma.product.findMany({ where: { categoryId } })).map((p) => p.id),
    }
  }
  if (stockStatus) {
    if (stockStatus === "in_stock") where.stock = { gte: 5 }
    else if (stockStatus === "low_stock") where.stock = { gt: 0, lt: 5 }
    else if (stockStatus === "out_of_stock") where.stock = 0
  }

  const variants = await prisma.productVariant.findMany({
    where,
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { stock: "asc" },
  })

  const lowStockCount = await prisma.productVariant.count({
    where: { stock: { lt: 5 } },
  })

  const categories = await prisma.category.findMany()

  const data = variants.map((v) => ({
    id: v.id,
    productName: v.product.name,
    categoryName: v.product.category.name,
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock: v.stock,
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      </div>
      <InventoryClient 
        data={data} 
        categories={categories} 
        lowStockCount={lowStockCount} 
      />
    </div>
  )
}
