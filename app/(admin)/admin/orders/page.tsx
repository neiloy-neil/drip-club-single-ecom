import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import OrdersFilters from "./OrdersFilters"
import AdminPagination from "@/components/admin/AdminPagination"

const PAGE_SIZE = 20

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PACKED: "bg-purple-100 text-purple-800 border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  RETURNED: "bg-orange-100 text-orange-800 border-orange-200",
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; paymentMethod?: string; page?: string }>
}) {
  const params = await searchParams
  const search = params.search || ""
  const status = params.status || ""
  const paymentMethod = params.paymentMethod || ""
  const page = Math.max(1, parseInt(params.page || "1"))
  const skip = (page - 1) * PAGE_SIZE

  const where: any = {
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { shippingName: { contains: search } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.order.count({ where }).catch(() => 0),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Orders{" "}
          <span className="text-sm font-normal text-muted-foreground ml-2">{total} total</span>
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <OrdersFilters
            currentSearch={search}
            currentStatus={status}
            currentPayment={paymentMethod}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium font-mono text-xs">{order.orderNumber}</TableCell>
                  <TableCell>{order.user?.name || order.shippingName}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString("en-BD")}</TableCell>
                  <TableCell className="font-mono">৳{Number(order.total).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-medium">{order.paymentMethod}</span>
                      <Badge variant="outline" className="w-fit text-[10px]">{order.paymentStatus}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminPagination page={page} totalPages={totalPages} basePath="/admin/orders" />
        </CardContent>
      </Card>
    </div>
  )
}
