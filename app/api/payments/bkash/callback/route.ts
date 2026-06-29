import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { executePayment } from "@/lib/bkash"
import { awardPoints } from "@/lib/loyalty"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const paymentID = searchParams.get("paymentID")
    const status = searchParams.get("status")
    const orderId = searchParams.get("orderId") // Note: we passed orderId in callbackURL

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    if (!paymentID || !orderId) {
      return NextResponse.redirect(`${appUrl}/order/unknown?payment=failed`)
    }

    if (status !== "success") {
      return NextResponse.redirect(`${appUrl}/order/${orderId}?payment=failed`)
    }

    // Execute the payment
    const bkashData = await executePayment(paymentID)

    if (bkashData.statusCode && bkashData.statusCode !== "0000") {
      // Payment execution failed or was already executed
      return NextResponse.redirect(`${appUrl}/order/${orderId}?payment=failed`)
    }

    // Success! Update DB.
    const trxID = bkashData.trxID
    
    await prisma.payment.update({
      where: { orderId: orderId },
      data: {
        status: "PAID",
        transactionId: trxID,
        paidAt: new Date(),
        gatewayResponse: bkashData,
      }
    })

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED", // Auto-confirm paid orders
      }
    })

    await prisma.orderStatusLog.create({
      data: {
        orderId: orderId,
        status: "CONFIRMED",
        note: `Payment successful. bKash TrxID: ${trxID}`,
      }
    })

    if (order.userId) {
      try {
        await awardPoints(order.userId, orderId, Number(order.total))
      } catch (err) {
        console.error("Failed to award loyalty points:", err)
      }
    }

    return NextResponse.redirect(`${appUrl}/order/${orderId}?payment=success`)
  } catch (error: any) {
    console.error("bKash callback error", error)
    // fallback redirect
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId") || "unknown"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(`${appUrl}/order/${orderId}?payment=failed`)
  }
}
