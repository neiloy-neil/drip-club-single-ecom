import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, ShoppingCart, Activity, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import RevenueChart from "@/components/admin/RevenueChart"

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [ordersToday, customersTotal, productsCount, lowStockCount, revenueOrders, recentOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
    prisma.user.count({ where: { role: "CUSTOMER" } }).catch(() => 0),
    prisma.product.count().catch(() => 0),
    prisma.productVariant.count({ where: { stock: { lte: 5, gt: 0 } } }).catch(() => 0),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }).catch(() => []),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }).catch(() => []),
  ])

  // Group revenue by day over last 7 days
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sevenDaysAgo)
    date.setDate(date.getDate() + i)
    const dateStr = date.toDateString()
    const total = revenueOrders
      .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
      .reduce((sum, o) => sum + Number(o.total), 0)
    return { name: dayNames[date.getDay()], total }
  })

  const revenueToday = revenueOrders
    .filter((o) => new Date(o.createdAt).toDateString() === today.toDateString())
    .reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/orders">
            <Button variant="outline">View pending orders</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" /> Add product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{revenueToday.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-500" : ""}`}>{lowStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={revenueByDay} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      No recent orders
                    </TableCell>
                  </TableRow>
                )}
                {recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === "DELIVERED" ? "default" : "outline"}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">৳{Number(order.total).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
