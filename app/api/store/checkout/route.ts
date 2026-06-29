import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, address, paymentMethod, subtotal, shippingCharge, total, userId } = body

    // Create unique order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null, // Assuming anonymous checkout if no userId
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: paymentMethod,
        total: total,
        subtotal: subtotal,
        shippingCharge: shippingCharge,
        discount: 0,
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
            price: item.price,
            size: item.size || "Default",
            color: item.color || "Default",
          }))
        }
      }
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error: any) {
    console.error("Checkout error", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
