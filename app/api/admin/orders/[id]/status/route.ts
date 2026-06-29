import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { id } = await params
    const body = await req.json()
    const { status, paymentStatus } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
      updateData.payment = {
        update: { status: paymentStatus }
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData
    })

    if (status) {
      await prisma.orderStatusLog.create({
        data: {
          orderId: id,
          status,
          note: `Status updated to ${status} via Admin Panel`
        }
      })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
