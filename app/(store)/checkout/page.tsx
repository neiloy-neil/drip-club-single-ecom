import CheckoutForm from "@/components/store/CheckoutForm"
import { ShieldCheck } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function CheckoutPage() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["free_shipping_above", "shipping_charge", "enabled_payment_methods", "tax_enabled", "tax_rate", "tax_label"] } },
  }).catch(() => [])

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const freeShippingThreshold = Number(map.free_shipping_above || 1000)
  const shippingChargeAmount = Number(map.shipping_charge || 60)
  const enabledMethods = map.enabled_payment_methods
    ? map.enabled_payment_methods.split(",").map((s) => s.trim())
    : ["COD", "BKASH", "NAGAD"]
  const taxEnabled = map.tax_enabled === "true"
  const taxRate = Number(map.tax_rate || 0) // percentage e.g. 5 = 5%
  const taxLabel = map.tax_label || "VAT"

  return (
    <div className="bg-drip-bg min-h-screen pt-8 pb-24 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-drip-black mb-2">Checkout</h1>
          <p className="text-xs text-drip-text-muted flex items-center gap-1 uppercase tracking-widest font-medium">
            <ShieldCheck className="w-4 h-4 text-drip-success" /> Secure 256-bit SSL Encryption
          </p>
        </div>

        <CheckoutForm
          freeShippingThreshold={freeShippingThreshold}
          shippingChargeAmount={shippingChargeAmount}
          enabledPaymentMethods={enabledMethods}
          taxEnabled={taxEnabled}
          taxRate={taxRate}
          taxLabel={taxLabel}
        />
      </div>
    </div>
  )
}
