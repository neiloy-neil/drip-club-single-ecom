"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase's recovery link sets a session automatically via the URL hash.
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message || "Failed to reset password")
    } else {
      setDone(true)
      setTimeout(() => router.push("/account"), 2000)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-drip-black mb-2">Set New Password</h1>
          <p className="text-sm text-drip-text-muted">Choose a new password for your DRIP account.</p>
        </div>

        {done ? (
          <div className="p-6 bg-drip-muted rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-drip-success/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-drip-success" />
            </div>
            <h2 className="font-heading font-bold text-xl">Password Updated</h2>
            <p className="text-sm text-drip-text-muted">Redirecting you to your account...</p>
          </div>
        ) : !ready ? (
          <div className="p-6 bg-drip-muted rounded-2xl text-center space-y-2">
            <p className="text-sm text-drip-text-muted">
              This link is invalid or has expired.{" "}
              <Link href="/forgot-password" className="font-bold text-drip-black hover:text-drip-gold">
                Request a new one
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-drip-text-muted">Confirm Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-drip-muted border border-transparent focus:border-drip-gold focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-drip-black text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-drip-gold hover:shadow-lg hover:shadow-drip-gold/20 transition-all duration-300 rounded-full text-xs disabled:opacity-50"
            >
              {loading ? "Updating..." : <> Update Password <ArrowRight className="w-4 h-4" /> </>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
