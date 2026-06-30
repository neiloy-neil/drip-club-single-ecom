"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type Staff = {
  id: string
  name: string
  email: string
  role: string
}

export function SettingsClient({
  initialSettings,
  initialStaff,
}: {
  initialSettings: Record<string, string>
  initialStaff: Staff[]
}) {
  const router = useRouter()

  const [storeName, setStoreName] = useState(initialSettings["store_name"] || "")
  const [storeTagline, setStoreTagline] = useState(initialSettings["store_tagline"] || "")
  const [storeDescription, setStoreDescription] = useState(initialSettings["store_description"] || "")
  const [supportEmail, setSupportEmail] = useState(initialSettings["support_email"] || "")
  const [supportPhone, setSupportPhone] = useState(initialSettings["support_phone"] || "")
  const [socialFacebook, setSocialFacebook] = useState(initialSettings["social_facebook"] || "")
  const [socialInstagram, setSocialInstagram] = useState(initialSettings["social_instagram"] || "")
  const [socialTiktok, setSocialTiktok] = useState(initialSettings["social_tiktok"] || "")
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialSettings["free_shipping_above"] || "")
  const [shippingChargeAmount, setShippingChargeAmount] = useState(initialSettings["shipping_charge"] || "60")
  const [enabledCOD, setEnabledCOD] = useState(
    !initialSettings["enabled_payment_methods"] || initialSettings["enabled_payment_methods"].includes("COD")
  )
  const [enabledBkash, setEnabledBkash] = useState(
    !initialSettings["enabled_payment_methods"] || initialSettings["enabled_payment_methods"].includes("BKASH")
  )
  const [enabledNagad, setEnabledNagad] = useState(
    !initialSettings["enabled_payment_methods"] || initialSettings["enabled_payment_methods"].includes("NAGAD")
  )
  const [bkashNumber, setBkashNumber] = useState(initialSettings["bkash_merchant_number"] || "")
  const [nagadNumber, setNagadNumber] = useState(initialSettings["nagad_merchant_number"] || "")
  const [isSaving, setIsSaving] = useState(false)

  // Tax / VAT
  const [taxEnabled, setTaxEnabled] = useState(initialSettings["tax_enabled"] === "true")
  const [taxRate, setTaxRate] = useState(initialSettings["tax_rate"] || "")
  const [taxLabel, setTaxLabel] = useState(initialSettings["tax_label"] || "VAT")
  const [isTaxSaving, setIsTaxSaving] = useState(false)

  // COD Deposit (RTO/fraud prevention)
  const [codDepositEnabled, setCodDepositEnabled] = useState(initialSettings["cod_deposit_enabled"] === "true")
  const [codDepositAmount, setCodDepositAmount] = useState(initialSettings["cod_deposit_amount"] || "100")
  const [isDepositSaving, setIsDepositSaving] = useState(false)

  // Tracking & SEO
  const [ga4Id, setGa4Id] = useState(initialSettings["ga4_id"] || "")
  const [metaPixelId, setMetaPixelId] = useState(initialSettings["meta_pixel_id"] || "")
  const [clarityId, setClarityId] = useState(initialSettings["clarity_id"] || "")
  const [metaTitle, setMetaTitle] = useState(initialSettings["meta_title"] || "")
  const [metaDescription, setMetaDescription] = useState(initialSettings["meta_description"] || "")
  const [isTrackingSaving, setIsTrackingSaving] = useState(false)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("STAFF")
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            store_name: storeName,
            store_tagline: storeTagline,
            store_description: storeDescription,
            support_email: supportEmail,
            support_phone: supportPhone,
            social_facebook: socialFacebook,
            social_instagram: socialInstagram,
            social_tiktok: socialTiktok,
            free_shipping_above: freeShippingThreshold,
            shipping_charge: shippingChargeAmount,
            enabled_payment_methods: [
              enabledCOD && "COD",
              enabledBkash && "BKASH",
              enabledNagad && "NAGAD",
            ].filter(Boolean).join(","),
            bkash_merchant_number: bkashNumber,
            nagad_merchant_number: nagadNumber,
          },
        }),
      })
      if (res.ok) {
        toast.success("Settings saved successfully")
        router.refresh()
      } else {
        toast.error("Failed to save settings")
      }
    } catch {
      toast.error("Error saving settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDeposit = async () => {
    setIsDepositSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            cod_deposit_enabled: codDepositEnabled,
            cod_deposit_amount: codDepositAmount,
          },
        }),
      })
      if (res.ok) {
        toast.success("Deposit settings saved")
        router.refresh()
      } else {
        toast.error("Failed to save deposit settings")
      }
    } catch {
      toast.error("Error saving deposit settings")
    } finally {
      setIsDepositSaving(false)
    }
  }

  const handleSaveTax = async () => {
    setIsTaxSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            tax_enabled: taxEnabled,
            tax_rate: taxRate,
            tax_label: taxLabel,
          },
        }),
      })
      if (res.ok) {
        toast.success("Tax settings saved")
        router.refresh()
      } else {
        toast.error("Failed to save tax settings")
      }
    } catch {
      toast.error("Error saving tax settings")
    } finally {
      setIsTaxSaving(false)
    }
  }

  const handleSaveTracking = async () => {
    setIsTrackingSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            ga4_id: ga4Id,
            meta_pixel_id: metaPixelId,
            clarity_id: clarityId,
            meta_title: metaTitle,
            meta_description: metaDescription,
          },
        }),
      })
      if (res.ok) {
        toast.success("Tracking settings saved")
        router.refresh()
      } else {
        toast.error("Failed to save tracking settings")
      }
    } catch {
      toast.error("Error saving tracking settings")
    } finally {
      setIsTrackingSaving(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/settings/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      if (res.ok) {
        toast.success(`Staff member added successfully`)
        setIsInviteOpen(false)
        setInviteEmail("")
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to add staff member")
      }
    } catch {
      toast.error("Error adding staff member")
    }
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/settings/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        toast.success("Role updated")
        router.refresh()
      } else {
        toast.error("Failed to update role")
      }
    } catch {
      toast.error("Error updating role")
    }
  }

  const handleRemoveStaff = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}'s staff access? They will become a regular customer.`)) return
    try {
      const res = await fetch(`/api/admin/settings/staff/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Staff member removed")
        router.refresh()
      } else {
        toast.error("Failed to remove staff member")
      }
    } catch {
      toast.error("Error removing staff member")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Store Information</CardTitle>
          <CardDescription>Update your store's basic information and configurations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tagline</label>
            <Input value={storeTagline} onChange={(e) => setStoreTagline(e.target.value)} placeholder="Wear Your Story" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Description</label>
            <textarea
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Shown in the site footer"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Input value="BDT (৳)" disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Free Shipping Threshold (৳)</label>
              <Input type="number" min="0" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping Charge (৳)</label>
              <Input type="number" min="0" value={shippingChargeAmount} onChange={(e) => setShippingChargeAmount(e.target.value)} />
              <p className="text-xs text-muted-foreground">Charged when order is below threshold</p>
            </div>
          </div>
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Payment Methods at Checkout</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={enabledCOD} onChange={(e) => setEnabledCOD(e.target.checked)} />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={enabledBkash} onChange={(e) => setEnabledBkash(e.target.checked)} />
                bKash
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={enabledNagad} onChange={(e) => setEnabledNagad(e.target.checked)} />
                Nagad
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">bKash Merchant Number</label>
              <Input value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nagad Merchant Number</label>
              <Input value={nagadNumber} onChange={(e) => setNagadNumber(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@yourstore.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Phone</label>
              <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" />
            </div>
          </div>
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Social Links</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Facebook</label>
                <Input value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instagram</label>
                <Input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">TikTok</label>
                <Input value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/..." />
              </div>
            </div>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash on Delivery Deposit</CardTitle>
          <CardDescription>
            Require a small advance payment via bKash before confirming Cash on Delivery orders.
            Reduces fake orders and failed deliveries (RTO) — stores using this report 40-50% fewer returns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="text-sm font-bold">Require deposit on all COD orders</p>
              <p className="text-xs text-muted-foreground mt-1">
                When off, a deposit is still automatically requested from customers flagged as high-risk
                (based on their own delivery history on this store).
              </p>
            </div>
            <Switch checked={codDepositEnabled} onCheckedChange={setCodDepositEnabled} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deposit Amount (৳)</label>
            <Input
              type="number"
              min="0"
              value={codDepositAmount}
              onChange={(e) => setCodDepositAmount(e.target.value)}
              placeholder="100"
            />
            <p className="text-xs text-muted-foreground">Recommended: ৳100–200. Paid via bKash, remainder collected on delivery.</p>
          </div>
          <Button onClick={handleSaveDeposit} disabled={isDepositSaving}>
            {isDepositSaving ? "Saving..." : "Save Deposit Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax / VAT</CardTitle>
          <CardDescription>Configure tax that is calculated and shown at checkout. Leave disabled if your prices already include tax.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="text-sm font-bold">Enable Tax at Checkout</p>
              <p className="text-xs text-muted-foreground mt-1">Tax is calculated on the subtotal and shown as a separate line item.</p>
            </div>
            <Switch checked={taxEnabled} onCheckedChange={setTaxEnabled} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <Input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="e.g. 5 for 5%" disabled={!taxEnabled} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Label</label>
              <Input value={taxLabel} onChange={(e) => setTaxLabel(e.target.value)} placeholder="VAT" disabled={!taxEnabled} />
              <p className="text-xs text-muted-foreground">Shown next to the tax line at checkout (e.g. "VAT", "GST")</p>
            </div>
          </div>
          <Button onClick={handleSaveTax} disabled={isTaxSaving}>
            {isTaxSaving ? "Saving..." : "Save Tax Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking & SEO</CardTitle>
          <CardDescription>Configure analytics and default SEO metadata. Changes take effect on the next page load.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Analytics IDs</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Google Analytics 4 (GA4)
                <span className="text-xs text-muted-foreground font-normal">e.g. G-XXXXXXXXXX</span>
              </label>
              <Input value={ga4Id} onChange={(e) => setGa4Id(e.target.value)} placeholder="G-XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Meta Pixel ID
                <span className="text-xs text-muted-foreground font-normal">e.g. 123456789012345</span>
              </label>
              <Input value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} placeholder="123456789012345" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Microsoft Clarity ID
                <span className="text-xs text-muted-foreground font-normal">e.g. abc123xyz</span>
              </label>
              <Input value={clarityId} onChange={(e) => setClarityId(e.target.value)} placeholder="abc123xyz" />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Default SEO</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Title</label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="DRIP | Wear Your Story" />
              <p className="text-xs text-muted-foreground">Used as the default page title and OG title.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Modern Bangladeshi clothing brand. Shop premium fashion..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters recommended.</p>
            </div>
          </div>

          <Button onClick={handleSaveTracking} disabled={isTrackingSaving}>
            {isTrackingSaving ? "Saving..." : "Save Tracking & SEO"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>Manage administrators and staff members.</CardDescription>
          </div>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger render={<Button>Add Staff Member</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Staff Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="staff@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={inviteRole} onValueChange={(val) => setInviteRole(val || "STAFF")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff (Limited Access)</SelectItem>
                      <SelectItem value="ADMIN">Administrator (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add Staff Member</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white dark:bg-neutral-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">No staff members yet.</TableCell>
                  </TableRow>
                ) : (
                  initialStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Select value={staff.role} onValueChange={(val) => handleRoleChange(staff.id, val || "")}>
                          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveStaff(staff.id, staff.name)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
