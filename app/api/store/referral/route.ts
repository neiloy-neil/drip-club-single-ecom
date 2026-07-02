import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

// POST /api/store/referral — apply referral code on first order
// Called from checkout after order is created
export async function POST(req: Request) {
  try {
    const { referralCode, orderId } = await req.json()
    if (!referralCode || !orderId) return NextResponse.json({ ok: false })

    const affiliate = await prisma.affiliate.findFirst({ where: { referralCode } })
    if (!affiliate) return NextResponse.json({ ok: false })

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, id: true } })
    if (!order?.userId) return NextResponse.json({ ok: false })

    // Only give credit on the very first order
    const prevOrders = await prisma.order.count({ where: { userId: order.userId, id: { not: orderId } } })
    if (prevOrders > 0) return NextResponse.json({ ok: false, reason: "not_first_order" })

    // Don't reward self-referral
    if (affiliate.userId === order.userId) return NextResponse.json({ ok: false, reason: "self_referral" })

    const REWARD = 100

    // Give ৳100 store credit to the new customer
    await prisma.storeCredit.upsert({
      where: { userId: order.userId },
      create: { userId: order.userId, balance: REWARD },
      update: { balance: { increment: REWARD } },
    })
    await prisma.storeCreditTransaction.create({
      data: { userId: order.userId, amount: REWARD, type: "CREDIT", note: "Referral welcome bonus" },
    })

    // Give ৳100 store credit to the referrer
    await prisma.storeCredit.upsert({
      where: { userId: affiliate.userId },
      create: { userId: affiliate.userId, balance: REWARD },
      update: { balance: { increment: REWARD } },
    })
    await prisma.storeCreditTransaction.create({
      data: { userId: affiliate.userId, amount: REWARD, type: "CREDIT", note: `Referral reward — order ${orderId}` },
    })

    return NextResponse.json({ ok: true, reward: REWARD })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
