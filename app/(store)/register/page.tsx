"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        return
      }
      // Auto sign-in after registration
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        toast.success("Account created! Please sign in.")
        router.push("/login")
      } else {
        toast.success("Welcome to DRIP! 🎉")
        router.push("/account")
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row-reverse animate-in fade-in duration-500">

      {/* Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-drip-surface">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-drip-black mb-2">Create Account</h1>
            <p className="text-sm text-drip-text-muted">Join the DRIP Club to start earning rewards.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 bg-drip-black text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-drip-gold hover:shadow-lg hover:shadow-drip-gold/20 transition-all duration-300 rounded-full text-xs disabled:opacity-50"
            >
              {loading ? "Creating Account..." : <> Create Account <ArrowRight className="w-4 h-4" /> </>}
            </button>
          </form>

          <p className="text-center text-sm text-drip-text-muted pt-4 border-t border-drip-border">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-drip-black hover:text-drip-gold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Image Side */}
      <div className="hidden md:block w-1/2 relative bg-drip-muted overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1920&auto=format&fit=crop"
          alt="DRIP Fashion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-heading font-bold mb-4">Unapologetic Style.</h2>
          <p className="text-lg opacity-90">
            Sign up to get 10% off your first order and start earning DRIP Club points.
          </p>
        </div>
      </div>
    </div>
  )
}
