import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Generate a secure token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      create: { userId: user.id, token, expiresAt },
      update: { token, expiresAt },
    })

    // TODO: Send email with reset link
    // The reset link would be: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}
    // Wire up an email provider (e.g. Resend, SendGrid) here
    console.info(`[Password Reset] Token for ${user.email}: ${token}`)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Forgot password error", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
