import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Public endpoint — only exposes safe tracking/SEO keys
const PUBLIC_KEYS = ["ga4_id", "meta_pixel_id", "clarity_id", "meta_title", "meta_description", "store_name", "free_shipping_above"]

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    })
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    return NextResponse.json(map, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    })
  } catch {
    return NextResponse.json({})
  }
}
