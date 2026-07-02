import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { sendLowStockAlert } from "@/lib/email"

const LOW_STOCK_THRESHOLD = 5

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { variantId } = await params
    const body = await request.json()
    const { stock } = body

    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json({ error: "Invalid stock value" }, { status: 400 })
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
      include: { product: { select: { name: true } } },
    })

    // Fire low stock alert email if stock dropped to threshold or out of stock
    if (stock <= LOW_STOCK_THRESHOLD) {
      sendLowStockAlert([{
        productName: variant.product.name,
        size: variant.size,
        color: variant.color,
        stock,
        sku: variant.sku,
      }]).catch(() => {})
    }

    return NextResponse.json({ variant })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
