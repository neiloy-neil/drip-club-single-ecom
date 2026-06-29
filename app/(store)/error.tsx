"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-drip-bg p-4 text-center">
      <div className="max-w-md w-full p-8 space-y-6">
        <div className="w-16 h-16 bg-drip-error/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-drip-error" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold text-drip-black">Oops! Something broke.</h2>
          <p className="text-drip-text-muted text-sm">
            We couldn't load this part of the store. Please try again.
          </p>
        </div>

        <div className="pt-4 flex gap-4 justify-center">
          <Button 
            onClick={() => reset()}
            className="bg-drip-black hover:bg-drip-gold text-white font-bold uppercase tracking-widest text-xs h-12 px-8 transition-colors"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
