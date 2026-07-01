"use client"

import { useState } from "react"
import { useCartStore } from "@/store/useCartStore"
import { useRouter } from "next/navigation"
import { MapPin, CreditCard, ClipboardCheck, ChevronRight, Check, Gift, MessageSquare, User } from "lucide-react"

export default function CheckoutForm({
  freeShippingThreshold = 1000,
  shippingChargeAmount = 60,
  enabledPaymentMethods = ["COD", "BKASH", "NAGAD"],
  taxEnabled = false,
  taxRate = 0,
  taxLabel = "VAT",
  giftWrapEnabled = false,
  giftWrapCharge = 50,
}: {
  freeShippingThreshold?: number
  shippingChargeAmount?: number
  enabledPaymentMethods?: string[]
  taxEnabled?: boolean
  taxRate?: number
  taxLabel?: string
  giftWrapEnabled?: boolean
  giftWrapCharge?: number
}) {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1 — address
  const [address, setAddress] = useState({ name: "", phone: "", division: "", district: "", area: "", fullAddress: "" })
  const [guestEmail, setGuestEmail] = useState("")
  const [isGuest, setIsGuest] = useState(false)

  // Step 2 — payment
  const [paymentMethod, setPaymentMethod] = useState(
    enabledPaymentMethods.includes("COD") ? "COD" : enabledPaymentMethods[0] || "COD"
  )
  const [depositInfo, setDepositInfo] = useState<{ required: boolean; amount: number } | null>(null)

  // Step 3 — extras
  const [orderNote, setOrderNote] = useState("")
  const [giftWrap, setGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState("")

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shippingCharge = subtotal >= freeShippingThreshold ? 0 : shippingChargeAmount
  const taxAmount = taxEnabled ? Math.round((subtotal * taxRate) / 100) : 0
  const giftWrapAmount = giftWrap ? giftWrapCharge : 0
  const total = subtotal + shippingCharge + taxAmount + giftWrapAmount

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
    try {
      const res = await fetch("/api/store/deposit-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: address.phone, total }),
      })
      if (res.ok) setDepositInfo(await res.json())
    } catch { /* non-critical */ }
  }

  const handleSubmitStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderRes = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          paymentMethod,
          subtotal,
          shippingCharge,
          total,
          note: orderNote || null,
          giftWrap,
          giftMessage: giftWrap ? giftMessage : null,
          giftWrapCharge: giftWrapAmount,
          isGuest,
          guestEmail: isGuest ? guestEmail : null,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error)

      if (paymentMethod === "COD" && orderData.depositAmount > 0) {
        const bkashRes = await fetch("/api/payments/bkash/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.orderId, type: "deposit" }),
        })
        const bkashData = await bkashRes.json()
        if (!bkashRes.ok) throw new Error(bkashData.error)
        clearCart()
        window.location.href = bkashData.bkashURL
      } else if (paymentMethod === "BKASH") {
        const bkashRes = await fetch("/api/payments/bkash/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.orderId }),
        })
        const bkashData = await bkashRes.json()
        if (!bkashRes.ok) throw new Error(bkashData.error)
        clearCart()
        window.location.href = bkashData.bkashURL
      } else if (paymentMethod === "NAGAD") {
        const nagadRes = await fetch("/api/payments/nagad/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.orderId }),
        })
        const nagadData = await nagadRes.json()
        if (!nagadRes.ok) throw new Error(nagadData.error)
        clearCart()
        window.location.href = nagadData.nagadURL
      } else {
        clearCart()
        router.push(`/order/${orderData.orderId}?placed=1`)
      }
    } catch (error: any) {
      alert("Failed to place order: " + error.message)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-drip-border rounded-2xl">
        <h2 className="text-2xl font-heading font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => router.push("/shop")} className="px-8 py-3 bg-drip-black text-white font-medium hover:bg-drip-gold transition-colors rounded-full">
          Continue Shopping
        </button>
      </div>
    )
  }

  const inputCls = "w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      <div className="w-full lg:w-2/3 space-y-6">

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2 md:px-10 relative">
          <div className="absolute top-4 left-0 w-full h-[1px] bg-drip-border -z-10" />
          {["Shipping", "Payment", "Extras & Review"].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2 bg-drip-bg px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= i + 1 ? "border-drip-black bg-drip-black text-white" : "border-drip-border bg-white text-drip-text-muted"}`}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${step >= i + 1 ? "text-drip-black" : "text-drip-text-muted"}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        <div className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${step === 1 ? "border-drip-black shadow-lg shadow-black/5" : "border-drip-border opacity-70"}`}>
          <div className="bg-drip-muted/30 px-6 py-4 flex items-center justify-between border-b border-drip-border">
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${step === 1 ? "text-drip-black" : "text-drip-text-muted"}`} />
              <h2 className="font-heading font-bold text-lg">Delivery Address</h2>
            </div>
            {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-drip-gold hover:text-drip-black transition-colors">Edit</button>}
          </div>

          {step === 1 && (
            <div className="p-6">
              {/* Guest vs account toggle */}
              <div className="flex gap-3 mb-6">
                <button type="button" onClick={() => setIsGuest(false)} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${!isGuest ? "bg-drip-black text-white border-drip-black" : "border-drip-border text-drip-text-muted hover:border-drip-black"}`}>
                  <User className="w-3.5 h-3.5 inline mr-1.5" />Login / Register
                </button>
                <button type="button" onClick={() => setIsGuest(true)} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${isGuest ? "bg-drip-black text-white border-drip-black" : "border-drip-border text-drip-text-muted hover:border-drip-black"}`}>
                  Continue as Guest
                </button>
              </div>

              {!isGuest && (
                <p className="text-xs text-drip-text-muted mb-4 p-3 bg-drip-muted rounded-lg">
                  <a href="/login?redirect=/checkout" className="text-drip-gold font-bold hover:underline">Log in</a> to use saved addresses & earn loyalty points. Or fill in below to continue as guest.
                </p>
              )}

              <form onSubmit={handleSubmitStep1} className="space-y-4">
                {isGuest && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Email (for order updates)</label>
                    <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Full Name *</label>
                    <input required value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Phone *</label>
                    <input required value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Division *</label>
                    <input required value={address.division} onChange={e => setAddress({ ...address, division: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">District *</label>
                    <input required value={address.district} onChange={e => setAddress({ ...address, district: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Area / Thana *</label>
                    <input required value={address.area} onChange={e => setAddress({ ...address, area: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Full Address *</label>
                    <textarea required rows={2} value={address.fullAddress} onChange={e => setAddress({ ...address, fullAddress: e.target.value })} className={`${inputCls} resize-none`} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-8 py-4 bg-drip-black text-white font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-drip-gold transition-colors rounded-full text-xs">
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
          {step > 1 && (
            <div className="p-6 text-sm text-drip-text-muted">
              <p className="font-medium text-drip-black">{address.name} ({address.phone})</p>
              <p>{address.fullAddress}, {address.area}, {address.district}, {address.division}</p>
              {isGuest && guestEmail && <p className="text-drip-gold mt-1 text-xs">Guest: {guestEmail}</p>}
            </div>
          )}
        </div>

        {/* Step 2: Payment */}
        <div className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${step === 2 ? "border-drip-black shadow-lg shadow-black/5" : "border-drip-border opacity-70"}`}>
          <div className="bg-drip-muted/30 px-6 py-4 flex items-center justify-between border-b border-drip-border">
            <div className="flex items-center gap-3">
              <CreditCard className={`w-5 h-5 ${step === 2 ? "text-drip-black" : "text-drip-text-muted"}`} />
              <h2 className="font-heading font-bold text-lg">Payment Method</h2>
            </div>
            {step > 2 && <button onClick={() => setStep(2)} className="text-xs font-bold uppercase tracking-widest text-drip-gold hover:text-drip-black transition-colors">Edit</button>}
          </div>

          {step === 2 && (
            <div className="p-6">
              <form onSubmit={handleSubmitStep2} className="space-y-4">
                {enabledPaymentMethods.includes("COD") && (
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === "COD" ? "border-drip-black bg-drip-muted/20 shadow-sm" : "border-drip-border hover:border-drip-black/30"}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="w-4 h-4 accent-drip-black" />
                    <div className="ml-4">
                      <span className="font-bold block text-sm">Cash on Delivery</span>
                      <span className="text-xs text-drip-text-muted">Pay in cash when your order arrives</span>
                      {paymentMethod === "COD" && depositInfo?.required && (
                        <p className="text-xs text-drip-gold font-medium mt-1.5">
                          ৳{depositInfo.amount} advance via bKash required. Remaining ৳{(total - depositInfo.amount).toLocaleString()} paid on delivery.
                        </p>
                      )}
                    </div>
                  </label>
                )}
                {enabledPaymentMethods.includes("BKASH") && (
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === "BKASH" ? "border-drip-black bg-drip-muted/20 shadow-sm" : "border-drip-border hover:border-drip-black/30"}`}>
                    <input type="radio" name="payment" value="BKASH" checked={paymentMethod === "BKASH"} onChange={() => setPaymentMethod("BKASH")} className="w-4 h-4 accent-drip-black" />
                    <div className="ml-4 flex items-center gap-2">
                      <span className="font-bold block text-sm">bKash</span>
                      <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Fast</span>
                    </div>
                  </label>
                )}
                {enabledPaymentMethods.includes("NAGAD") && (
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === "NAGAD" ? "border-drip-black bg-drip-muted/20 shadow-sm" : "border-drip-border hover:border-drip-black/30"}`}>
                    <input type="radio" name="payment" value="NAGAD" checked={paymentMethod === "NAGAD"} onChange={() => setPaymentMethod("NAGAD")} className="w-4 h-4 accent-drip-black" />
                    <div className="ml-4">
                      <span className="font-bold block text-sm">Nagad</span>
                    </div>
                  </label>
                )}
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-8 py-4 bg-drip-black text-white font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-drip-gold transition-colors rounded-full text-xs">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
          {step > 2 && (
            <div className="p-6 text-sm">
              <span className="font-bold text-drip-black bg-drip-muted px-3 py-1 rounded">
                {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
              </span>
            </div>
          )}
        </div>

        {/* Step 3: Extras & Review */}
        <div className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${step === 3 ? "border-drip-black shadow-lg shadow-black/5" : "border-drip-border opacity-70"}`}>
          <div className="bg-drip-muted/30 px-6 py-4 flex items-center border-b border-drip-border gap-3">
            <ClipboardCheck className={`w-5 h-5 ${step === 3 ? "text-drip-black" : "text-drip-text-muted"}`} />
            <h2 className="font-heading font-bold text-lg">Extras & Review</h2>
          </div>

          {step === 3 && (
            <div className="p-6 space-y-6">
              {/* Order note */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-drip-text-muted">
                  <MessageSquare className="w-4 h-4" /> Order Note / Special Instructions
                </label>
                <textarea
                  rows={3}
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  placeholder="Any special delivery instructions, preferred time, etc."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Gift wrap */}
              {giftWrapEnabled && (
                <div className="border border-drip-border rounded-xl overflow-hidden">
                  <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-drip-muted/20 transition-colors">
                    <input type="checkbox" checked={giftWrap} onChange={e => setGiftWrap(e.target.checked)} className="w-4 h-4 accent-drip-black rounded" />
                    <Gift className="w-5 h-5 text-drip-gold shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">Add Gift Wrapping</p>
                      <p className="text-xs text-drip-text-muted">Premium gift box with ribbon — ৳{giftWrapCharge}</p>
                    </div>
                    <span className="font-mono font-bold text-sm">+৳{giftWrapCharge}</span>
                  </label>
                  {giftWrap && (
                    <div className="border-t border-drip-border p-4 bg-drip-muted/10">
                      <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted block mb-2">Gift Message (max 160 characters)</label>
                      <textarea
                        rows={3}
                        maxLength={160}
                        value={giftMessage}
                        onChange={e => setGiftMessage(e.target.value)}
                        placeholder="Write a personal message for the recipient..."
                        className={`${inputCls} resize-none`}
                      />
                      <p className="text-xs text-drip-text-muted mt-1 text-right">{giftMessage.length}/160</p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-drip-text-muted">By placing this order you agree to our Terms of Service and Privacy Policy.</p>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-drip-black text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-drip-gold hover:shadow-lg hover:shadow-drip-gold/20 transition-all duration-300 rounded-full"
              >
                {loading ? "Processing Securely..." : "Confirm & Place Order"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white border border-drip-border rounded-2xl p-6 sticky top-24">
          <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4">
                <div className="h-20 w-16 bg-drip-muted shrink-0 rounded overflow-hidden">
                  <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-sm flex flex-col justify-center">
                  <h4 className="font-medium line-clamp-1">{item.name}</h4>
                  <p className="text-drip-text-muted text-xs mt-0.5">{item.size} / {item.color}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-drip-text-muted">Qty: {item.quantity}</span>
                    <span className="font-mono font-bold">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-drip-border pt-6 space-y-3 text-sm">
            <div className="flex justify-between text-drip-text-muted">
              <span>Subtotal</span>
              <span className="font-mono">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-drip-text-muted">
              <span>Shipping</span>
              <span className="font-mono">{shippingCharge === 0 ? "Free" : `৳${shippingCharge}`}</span>
            </div>
            {taxEnabled && taxAmount > 0 && (
              <div className="flex justify-between text-drip-text-muted">
                <span>{taxLabel} ({taxRate}%)</span>
                <span className="font-mono">৳{taxAmount.toLocaleString()}</span>
              </div>
            )}
            {giftWrap && (
              <div className="flex justify-between text-drip-text-muted">
                <span>Gift Wrapping</span>
                <span className="font-mono">৳{giftWrapCharge}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-drip-border pt-4 font-bold text-lg items-center">
              <span>Total</span>
              <span className="font-mono text-2xl">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
