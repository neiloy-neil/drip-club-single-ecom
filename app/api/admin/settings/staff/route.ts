import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { requireAdmin } from "@/lib/adminAuth"

export async function GET(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "STAFF"] }
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ staff })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const body = await req.json()
    const { email, role } = body

    if (!email || !["ADMIN", "STAFF"].includes(role)) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      if (user.role === "ADMIN" || user.role === "STAFF") {
        return NextResponse.json({ error: "User is already a staff member" }, { status: 400 })
      }
      user = await prisma.user.update({
        where: { email },
        data: { role },
      })
    } else {
      // Mock creating a new user with a random password if they don't exist
      user = await prisma.user.create({
        data: {
          email,
          role,
          name: email.split("@")[0],
          password: crypto.randomBytes(16).toString('hex'), // Temporary secure random password
        },
      })
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
