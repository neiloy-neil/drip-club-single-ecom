"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Printer, AlertTriangle, ShieldCheck, Tag, X, Send, MessageSquare, Phone, PhoneCall } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { CustomerRisk } from "@/lib/customerRisk"

const RISK_BADGE_CLASS: Record<string, string> = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
}

export default function OrderDetailsClient({
  initialOrder,
  customerRisk,
}: {
  initialOrder: any
  customerRisk?: CustomerRisk | null
}) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>(initialOrder.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [msgText, setMsgText] = useState("")
  const [msgLoading, setMsgLoading] = useState(false)
  const codVerified = tags.includes("cod-verified")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [deliveryData, setDeliveryData] = useState({
    courier: order.delivery?.courier || "PATHAO",
    consignmentId: order.delivery?.consignmentId || "",
    trackingCode: order.delivery?.trackingCode || "",
  })

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        const updated = await res.json()
        setOrder({ ...order, status: updated.status })
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (paymentStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus })
      })
      if (res.ok) {
        const updated = await res.json()
        setOrder({ ...order, paymentStatus: updated.paymentStatus })
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch(`/api/admin/orders/${initialOrder.id}/messages`)
      .then(r => r.json()).then(d => setMessages(d.messages || [])).catch(() => {})
  }, [initialOrder.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addTag = async () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
    if (!t || tags.includes(t)) { setTagInput(""); return }
    const next = [...tags, t]
    setTags(next)
    setTagInput("")
    await fetch(`/api/admin/orders/${order.id}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: next }),
    })
  }

  const removeTag = async (t: string) => {
    const next = tags.filter(x => x !== t)
    setTags(next)
    await fetch(`/api/admin/orders/${order.id}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: next }),
    })
  }

  const sendMessage = async () => {
    if (!msgText.trim()) return
    setMsgLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText }),
      })
      if (res.ok) {
        const d = await res.json()
        setMessages(prev => [...prev, d.message])
        setMsgText("")
      }
    } finally {
      setMsgLoading(false) }
  }

  const saveDelivery = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryData)
      })
      if (res.ok) {
        toast.success("Delivery information saved")
        router.refresh()
      } else {
        toast.error("Failed to save delivery info")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <a href={`/order/${order.id}/invoice`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> View / Print Invoice
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Size: {item.size} | Color: {item.color}</p>
                    </div>
                    <div className="text-right">
                      <p>৳{item.price.toString()} x {item.quantity}</p>
                      <p className="font-bold">৳{(item.price * item.quantity).toString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t space-y-2 text-right">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span> <span>৳{order.subtotal.toString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping:</span> <span>৳{order.shippingCharge.toString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount:</span> <span>-৳{order.discount.toString()}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Total:</span> <span>৳{order.total.toString()}</span></div>
                {Number(order.depositAmount) > 0 && (
                  <div className={`flex justify-between text-sm ${order.depositPaid ? "text-green-700" : "text-orange-700"}`}>
                    <span>{order.depositPaid ? "Advance paid (bKash)" : "Advance payment pending"}:</span>
                    <span>৳{order.depositAmount.toString()}</span>
                  </div>
                )}
                {order.depositPaid && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Due on delivery (cash):</span>
                    <span>৳{(Number(order.total) - Number(order.depositAmount)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Delivery Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Courier</label>
                  <select 
                    value={deliveryData.courier} 
                    onChange={e => setDeliveryData({...deliveryData, courier: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="PATHAO">Pathao</option>
                    <option value="STEADFAST">Steadfast</option>
                    <option value="SELF">Self Delivery</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consignment ID</label>
                  <input 
                    type="text" 
                    value={deliveryData.consignmentId} 
                    onChange={e => setDeliveryData({...deliveryData, consignmentId: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Tracking Code</label>
                  <input 
                    type="text" 
                    value={deliveryData.trackingCode} 
                    onChange={e => setDeliveryData({...deliveryData, trackingCode: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <Button onClick={saveDelivery} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Delivery Info"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer & Shipping</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">{order.shippingName}</p>
                <p>{order.shippingPhone}</p>
                <p className="mt-2">{order.shippingAddress}</p>
                <p>{order.shippingArea}, {order.shippingDistrict}</p>
                <p>{order.shippingDivision}</p>
              </div>
              {order.note && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <strong>Note: </strong> {order.note}
                </div>
              )}
              {customerRisk && customerRisk.riskLevel !== "NEW" && (
                <div className={`mt-4 p-3 rounded-md border text-xs space-y-1 ${RISK_BADGE_CLASS[customerRisk.riskLevel]}`}>
                  <div className="flex items-center gap-2 font-bold">
                    {customerRisk.riskLevel === "HIGH" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {customerRisk.riskLevel} risk customer
                  </div>
                  <p>
                    {customerRisk.delivered} delivered / {customerRisk.returnedOrCancelled} returned or cancelled
                    {" "}({Math.round((customerRisk.successRate ?? 0) * 100)}% success rate, {customerRisk.totalOrders} total orders)
                  </p>
                  {customerRisk.riskLevel === "HIGH" && (
                    <p className="font-medium">Consider requiring an advance payment before confirming.</p>
                  )}
                </div>
              )}
              {customerRisk && customerRisk.riskLevel === "NEW" && customerRisk.totalOrders <= 1 && (
                <div className="mt-4 p-3 rounded-md border bg-muted text-xs text-muted-foreground">
                  First order from this phone number — no delivery history yet.
                </div>
              )}
            </CardContent>
          </Card>

          {order.paymentMethod === "COD" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4" /> COD Verification</CardTitle></CardHeader>
              <CardContent>
                <button
                  onClick={() => codVerified ? removeTag("cod-verified") : (setTags(t => [...t, "cod-verified"]), fetch(`/api/admin/orders/${order.id}/tags`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: [...tags, "cod-verified"] }) }))}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${codVerified ? "border-green-500 bg-green-50 text-green-700" : "border-dashed border-slate-300 text-slate-500 hover:border-slate-400"}`}
                >
                  <PhoneCall className="h-4 w-4" />
                  {codVerified ? "✓ Phone call verified" : "Mark as phone-verified"}
                </button>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">Confirm customer intent before processing COD order</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Status Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <select 
                  value={order.status} 
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PACKED">Packed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <label className="text-sm font-medium">Payment Status</label>
                <div className="flex justify-between items-center bg-muted p-2 rounded">
                  <span className="font-medium">{order.paymentMethod}</span>
                  <Badge variant="outline">{order.paymentStatus}</Badge>
                </div>
                <select 
                  value={order.paymentStatus} 
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIAL">Partial (deposit only)</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-4 w-4" /> Order Tags</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {tags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTag()}
                  placeholder="vip, gift, express…"
                  className="flex-1 h-8 rounded-md border border-input bg-transparent px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button size="sm" variant="outline" onClick={addTag} className="h-8 text-xs">Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Customer Messages</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>}
                {messages.map((m: any) => (
                  <div key={m.id} className={`flex ${m.fromAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs ${m.fromAdmin ? "bg-slate-800 text-white" : "bg-muted text-foreground"}`}>
                      <p>{m.message}</p>
                      <p className={`text-[10px] mt-0.5 ${m.fromAdmin ? "text-slate-400" : "text-muted-foreground"}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2 pt-1 border-t">
                <input
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Reply to customer…"
                  className="flex-1 h-8 rounded-md border border-input bg-transparent px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button size="sm" onClick={sendMessage} disabled={msgLoading} className="h-8 px-3">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {order.statusLogs.map((log: any, i: number) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-indigo-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded border border-slate-200 shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 text-sm">{log.status}</div>
                        <time className="text-xs font-medium text-slate-500">{new Date(log.createdAt).toLocaleDateString()}</time>
                      </div>
                      <div className="text-slate-500 text-xs">{log.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
