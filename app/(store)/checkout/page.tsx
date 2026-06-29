import CheckoutForm from "@/components/store/CheckoutForm"
import { ShieldCheck } from "lucide-react"

export default function CheckoutPage() {
  return (
    <div className="bg-drip-bg min-h-screen pt-8 pb-24 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-drip-black mb-2">Checkout</h1>
          <p className="text-xs text-drip-text-muted flex items-center gap-1 uppercase tracking-widest font-medium">
            <ShieldCheck className="w-4 h-4 text-drip-success" /> Secure 256-bit SSL Encryption
          </p>
        </div>
        
        <CheckoutForm />
      </div>
    </div>
  )
}
