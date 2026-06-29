import prisma from "@/lib/prisma"
import { CustomerClient } from "./CustomerClient"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search || ""

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' }
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Calculate total spent per user
  const customers = users.map((user) => {
    const totalSpent = user.orders
      .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
      .reduce((sum, order) => sum + Number(order.total), 0)

    return {
      id: user.id,
      name: user.name || "N/A",
      email: user.email,
      phone: user.phone || "N/A",
      role: user.role,
      joinedDate: user.createdAt.toISOString(),
      totalOrders: user.orders.length,
      totalSpent,
      orders: user.orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
      }))
    }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>
      <CustomerClient data={customers} />
    </div>
  )
}
