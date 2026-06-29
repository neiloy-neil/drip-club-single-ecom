"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid email or password.")
    } else {
      router.refresh()
      // Redirect admins to admin panel, customers to account
      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()
      const role = sessionData?.user?.role
      router.push(role === "ADMIN" || role === "STAFF" ? "/admin" : "/account")
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row animate-in fade-in duration-500">

      {/* Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-drip-surface">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-drip-black mb-2">Welcome Back</h1>
            <p className="text-sm text-drip-text-muted">Enter your details to access your DRIP account.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Password</label>
                <Link href="/forgot-password" className="text-xs text-drip-text-muted hover:text-drip-black underline underline-offset-4 transition-colors">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-drip-black text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-drip-gold hover:shadow-lg hover:shadow-drip-gold/20 transition-all duration-300 rounded-full text-xs disabled:opacity-50"
            >
              {loading ? "Signing In..." : <> Sign In <ArrowRight className="w-4 h-4" /> </>}
            </button>
          </form>

          <p className="text-center text-sm text-drip-text-muted pt-4 border-t border-drip-border">
            Don't have an account? <Link href="/register" className="font-bold text-drip-black hover:text-drip-gold transition-colors">Sign up</Link>
          </p>

        </div>
      </div>

      {/* Image Side */}
      <div className="hidden md:block w-1/2 relative bg-drip-muted overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"
          alt="DRIP Fashion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-heading font-bold mb-4">Wear Your Story.</h2>
          <p className="text-lg opacity-90">Join the DRIP Club to earn points, get exclusive early access to drops, and manage your orders seamlessly.</p>
        </div>
      </div>

    </div>
  )
}
