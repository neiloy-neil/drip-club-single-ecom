import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { logAudit } from "@/lib/auditLog"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const { status, adminNote, refundAmount } = await req.json()

  const updated = await prisma.returnRequest.update({
    where: { id },
    data: { status, adminNote: adminNote || null, refundAmount: refundAmount || null },
  })

  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    action: "return.status_changed",
    entityType: "ReturnRequest",
    entityId: id,
    after: { status, adminNote, refundAmount },
  })

  return NextResponse.json(updated)
}
