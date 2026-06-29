import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createPayment } from "@/lib/bkash"

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.paymentStatus !== "UNPAID") {
      return NextResponse.json({ error: "Order is already paid or processing" }, { status: 400 })
    }

    // Amount needs to be converted if Decimal
    const amount = Number(order.total)
    
    // Call bKash Create API
    const { bkashURL, paymentID } = await createPayment(amount, orderId)

    // Save payment ID to Payment record
    await prisma.payment.upsert({
      where: { orderId: orderId },
      create: {
        orderId,
        method: "BKASH",
        status: "UNPAID",
        amount: order.total,
        gatewayResponse: { paymentID }
      },
      update: {
        gatewayResponse: { paymentID },
        status: "UNPAID",
      }
    })

    return NextResponse.json({ bkashURL })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
