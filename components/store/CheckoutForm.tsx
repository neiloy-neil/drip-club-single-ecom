"use client"

import { useState } from "react"
import { useCartStore } from "@/store/useCartStore"
import { useRouter } from "next/navigation"
import { MapPin, CreditCard, ClipboardCheck, ChevronRight, Check } from "lucide-react"

export default function CheckoutForm() {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1 data
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    division: "",
    district: "",
    area: "",
    fullAddress: ""
  })

  // Step 2 data
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [depositInfo, setDepositInfo] = useState<{ required: boolean; amount: number } | null>(null)

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const shippingCharge = subtotal >= 1000 ? 0 : 100
  const total = subtotal + shippingCharge

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
    } catch {
      // non-critical — deposit will still be enforced server-side at order creation
    }
  }

  const handleSubmitStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderRes = await fetch('/api/store/checkout', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          paymentMethod,
          subtotal,
          shippingCharge,
          total,
        })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.error);

      if (paymentMethod === "COD" && orderData.depositAmount > 0) {
        // A deposit was required (store policy or this customer's delivery history) —
        // collect it via bKash before treating the order as confirmed.
        const bkashRes = await fetch('/api/payments/bkash/create', {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ orderId: orderData.orderId, type: "deposit" })
        });
        const bkashData = await bkashRes.json();
        if (!bkashRes.ok) throw new Error(bkashData.error);

        clearCart();
        window.location.href = bkashData.bkashURL;
      } else if (paymentMethod === "BKASH") {
        const bkashRes = await fetch('/api/payments/bkash/create', {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ orderId: orderData.orderId })
        });
        const bkashData = await bkashRes.json();
        if (!bkashRes.ok) throw new Error(bkashData.error);
        
        clearCart();
        window.location.href = bkashData.bkashURL;
      } else if (paymentMethod === "NAGAD") {
        const nagadRes = await fetch('/api/payments/nagad/create', {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ orderId: orderData.orderId })
        });
        const nagadData = await nagadRes.json();
        if (!nagadRes.ok) throw new Error(nagadData.error);
        
        clearCart();
        window.location.href = nagadData.nagadURL;
      } else {
        clearCart();
        router.push(`/order/${orderData.orderId}?payment=success`);
      }
    } catch (error: any) {
      console.error(error);
      alert("Failed to place order: " + error.message);
      setLoading(false);
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

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      
      <div className="w-full lg:w-2/3 space-y-6">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2 md:px-10 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-drip-border -z-10 -translate-y-1/2" />
          
          <div className="flex flex-col items-center gap-2 bg-drip-bg px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= 1 ? 'border-drip-black bg-drip-black text-white' : 'border-drip-border bg-white text-drip-text-muted'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-drip-black' : 'text-drip-text-muted'}`}>Shipping</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-drip-bg px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= 2 ? 'border-drip-black bg-drip-black text-white' : 'border-drip-border bg-white text-drip-text-muted'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-drip-black' : 'text-drip-text-muted'}`}>Payment</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-drip-bg px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= 3 ? 'border-drip-black bg-drip-black text-white' : 'border-drip-border bg-white text-drip-text-muted'}`}>
              3
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 3 ? 'text-drip-black' : 'text-drip-text-muted'}`}>Review</span>
          </div>
        </div>

        {/* Step 1: Address */}
        <div className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${step === 1 ? 'border-drip-black shadow-lg shadow-black/5' : 'border-drip-border opacity-70'}`}>
          <div className="bg-drip-muted/30 px-6 py-4 flex items-center justify-between border-b border-drip-border">
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${step === 1 ? 'text-drip-black' : 'text-drip-text-muted'}`} />
              <h2 className="font-heading font-bold text-lg">Delivery Address</h2>
            </div>
            {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-drip-gold hover:text-drip-black transition-colors">Edit</button>}
          </div>
          
          {step === 1 && (
            <div className="p-6">
              <form onSubmit={handleSubmitStep1} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Full Name</label>
                    <input required value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Phone Number</label>
                    <input required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Division</label>
                    <input required value={address.division} onChange={e => setAddress({...address, division: e.target.value})} className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">District</label>
                    <input required value={address.district} onChange={e => setAddress({...address, district: e.target.value})} className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Area / Thana</label>
                    <input required value={address.area} onChange={e => setAddress({...address, area: e.target.value})} className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Full Address (House, Road, etc.)</label>
                    <textarea required rows={2} value={address.fullAddress} onChange={e => setAddress({...address, fullAddress: e.target.value})} className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all resize-none" />
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
              <p>{address.fullAddress}</p>
              <p>{address.area}, {address.district}, {address.division}</p>
            </div>
          )}
        </div>

        {/* Step 2: Payment */}
        <div className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${step === 2 ? 'border-drip-black shadow-lg shadow-black/5' : 'border-drip-border opacity-70'}`}>
          <div className="bg-drip-muted/30 px-6 py-4 flex items-center justify-between border-b border-drip-border">
            <div className="flex items-center gap-3">
              <CreditCard className={`w-5 h-5 ${step === 2 ? 'text-drip-black' : 'text-drip-text-muted'}`} />
              <h2 className="font-heading font-bold text-lg">Payment Method</h2>
            </div>
            {step > 2 && <button onClick={() => setStep(2)} className="text-xs font-bold uppercase tracking-widest text-drip-gold hover:text-drip-black transition-colors">Edit</button>}
          </div>
          
          {step === 2 && (
            <div className="p-6">
              <form onSubmit={handleSubmitStep2} className="space-y-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'COD' ? 'border-drip-black bg-drip-muted/20 shadow-sm' : 'border-drip-border hover:border-drip-black/30'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 accent-drip-black" />
                  <div className="ml-4">
                    <span className="font-bold block text-sm">Cash on Delivery</span>
                    <span className="text-xs text-drip-text-muted">Pay in cash when your order arrives</span>
                    {paymentMethod === 'COD' && depositInfo?.required && (
                      <p className="text-xs text-drip-gold font-medium mt-1.5">
                        A ৳{depositInfo.amount} advance payment via bKash is required to confirm this order.
                        The remaining ৳{(total - depositInfo.amount).toLocaleString()} is paid on delivery.
                      </p>
                    )}
                  </div>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'BKASH' ? 'border-drip-black bg-drip-muted/20 shadow-sm' : 'border-drip-border hover:border-drip-black/30'}`}>
                  <input type="radio" name="payment" value="BKASH" checked={paymentMethod === 'BKASH'} onChange={() => setPaymentMethod('BKASH')} className="w-4 h-4 accent-drip-black" />
                  <div className="ml-4 flex items-center gap-2">
                    <span className="font-bold block text-sm">bKash</span>
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Fast</span>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'NAGAD' ? 'border-drip-black bg-drip-muted/20 shadow-sm' : 'border-drip-border hover:border-drip-black/30'}`}>
                  <input type="radio" name="payment" value="NAGAD" checked={paymentMethod === 'NAGAD'} onChange={() => setPaymentMethod('NAGAD')} className="w-4 h-4 accent-drip-black" />
                  <div className="ml-4">
                    <span className="font-bold block text-sm">Nagad</span>
                  </div>
                </label>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-8 py-4 bg-drip-black text-white font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-drip-gold transition-colors rounded-full text-xs">
                    Review Order <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
          {step > 2 && (
            <div className="p-6 text-sm">
              <span className="font-bold text-drip-black bg-drip-muted px-3 py-1 rounded">
                {paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}
              </span>
            </div>
          )}
        </div>

        {/* Step 3: Review */}
        <div className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${step === 3 ? 'border-drip-black shadow-lg shadow-black/5' : 'border-drip-border opacity-70'}`}>
          <div className="bg-drip-muted/30 px-6 py-4 flex items-center justify-between border-b border-drip-border">
            <div className="flex items-center gap-3">
              <ClipboardCheck className={`w-5 h-5 ${step === 3 ? 'text-drip-black' : 'text-drip-text-muted'}`} />
              <h2 className="font-heading font-bold text-lg">Review Order</h2>
            </div>
          </div>
          
          {step === 3 && (
            <div className="p-6">
              <p className="text-sm text-drip-text-muted mb-6">By clicking below, you agree to our Terms of Service and Privacy Policy.</p>
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

      <div className="w-full lg:w-1/3">
        <div className="bg-white border border-drip-border rounded-2xl p-6 sticky top-24">
          <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
