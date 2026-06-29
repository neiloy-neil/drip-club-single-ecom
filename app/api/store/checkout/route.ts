import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, address, paymentMethod, subtotal, shippingCharge, total, userId } = body

    if (!items?.length || !address || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Re-validate prices and stock from DB — never trust client-sent prices
    const variantIds = items.map((i: any) => i.variantId)
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { price: true, isActive: true } } },
    })

    const variantMap = Object.fromEntries(variants.map((v) => [v.id, v]))

    for (const item of items) {
      const variant = variantMap[item.variantId]
      if (!variant || !variant.product.isActive) {
        return NextResponse.json({ error: `Product "${item.name}" is no longer available` }, { status: 400 })
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({
          error: `Only ${variant.stock} unit(s) of "${item.name}" (${item.size}) left in stock`,
        }, { status: 400 })
      }
    }

    // Compute server-side totals from DB prices
    const serverSubtotal = items.reduce((sum: number, item: any) => {
      const variant = variantMap[item.variantId]
      return sum + Number(variant.product.price) * item.quantity
    }, 0)

    const order = await prisma.$transaction(async (tx) => {
      // Re-check stock inside transaction to prevent race conditions
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for item: ${item.name} (${item.size})`)
        }
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      const orderCount = await tx.order.count()
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`

      return tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          status: "PENDING",
          paymentStatus: "UNPAID",
          paymentMethod,
          total,
          subtotal: serverSubtotal,
          shippingCharge: shippingCharge ?? 0,
          discount: Math.max(0, serverSubtotal - subtotal), // capture any coupon/loyalty discount
          shippingName: address.name,
          shippingPhone: address.phone,
          shippingAddress: address.fullAddress,
          shippingArea: address.area,
          shippingDistrict: address.district,
          shippingDivision: address.division,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.name,
              variantId: item.variantId,
              quantity: item.quantity,
              price: Number(variantMap[item.variantId].product.price),
              size: item.size || "Default",
              color: item.color || "Default",
            })),
          },
        },
      })
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error: any) {
    console.error("Checkout error", error)
    const isStockError = error.message?.includes("stock") || error.message?.includes("available")
    return NextResponse.json({ error: error.message }, { status: isStockError ? 400 : 500 })
  }
}
