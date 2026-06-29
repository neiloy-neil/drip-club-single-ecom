"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type Coupon = {
  id: string
  code: string
  type: string
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export function CouponClient({ data }: { data: Coupon[] }) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [code, setCode] = useState("")
  const [type, setType] = useState("PERCENTAGE")
  const [value, setValue] = useState("")
  const [minOrder, setMinOrder] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value: parseFloat(value),
          minOrderAmount: minOrder ? parseFloat(minOrder) : null,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt || null,
        }),
      })
      if (res.ok) {
        toast.success("Coupon created successfully")
        setIsDialogOpen(false)
        setCode(""); setValue(""); setMinOrder(""); setMaxUses(""); setExpiresAt("")
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to create coupon")
      }
    } catch {
      toast.error("Error creating coupon")
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (res.ok) {
        toast.success(`Coupon ${currentStatus ? "disabled" : "enabled"}`)
        router.refresh()
      } else {
        toast.error("Failed to update coupon")
      }
    } catch {
      toast.error("Error updating coupon")
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Coupon deleted")
        router.refresh()
      } else {
        toast.error("Failed to delete coupon")
      }
    } catch {
      toast.error("Error deleting coupon")
    }
  }

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger render={<Button>Create Coupon</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-neutral-700">Code</label>
              <Input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER50" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">Type</label>
              <Select value={type} onValueChange={(val) => setType(val || "PERCENTAGE")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FLAT">Flat Amount (৳)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">Value</label>
              <Input required type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">Min Order Amount (Optional)</label>
              <Input type="number" min="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">Max Uses (Optional)</label>
              <Input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">Expires At (Optional)</label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Save Coupon</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-white dark:bg-neutral-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">No coupons found.</TableCell>
              </TableRow>
            ) : (
              data.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-bold font-mono">{coupon.code}</TableCell>
                  <TableCell>{coupon.type}</TableCell>
                  <TableCell>{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `৳${coupon.value}`}</TableCell>
                  <TableCell>{coupon.minOrderAmount ? `৳${coupon.minOrderAmount}` : "—"}</TableCell>
                  <TableCell>{coupon.usedCount} / {coupon.maxUses || "∞"}</TableCell>
                  <TableCell>{coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}</TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleToggle(coupon.id, coupon.isActive)}>
                      {coupon.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(coupon.id, coupon.code)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
