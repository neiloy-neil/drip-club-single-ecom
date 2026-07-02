import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendBackInStockAlert } from "@/lib/email"

export async function GET(req: Request) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find all active alerts where the variant is now back in stock
    const alerts = await prisma.stockAlert.findMany({
      where: { notified: false },
      include: {
        variant: {
          include: { product: { include: { images: { take: 1 } } } }
        }
      },
    })

    let sent = 0
    for (const alert of alerts) {
      if (!alert.variant || alert.variant.stock <= 0) continue

      try {
        await sendBackInStockAlert({
          to: alert.email,
          productName: alert.variant.product.name,
          productUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${alert.variant.product.slug}`,
          productImage: alert.variant.product.images[0]?.url,
          size: alert.variant.size,
          color: alert.variant.color,
        })
        await prisma.stockAlert.update({ where: { id: alert.id }, data: { notified: true } })
        sent++
      } catch {
        // continue to next alert
      }
    }

    return NextResponse.json({ sent, checked: alerts.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
