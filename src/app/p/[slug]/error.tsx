"use client"

import { useEffect } from "react"
import { HeartOff, RefreshCw } from "lucide-react"

export default function ProposalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Proposal page error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-rose-50 font-sans">
      <div className="bg-white p-4 rounded-full text-rose-500 shadow-md mb-4">
        <HeartOff className="w-12 h-12 text-rose-500" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Unable to Load Memory Page</h2>
      <p className="text-slate-600 max-w-md mb-6">
        We ran into a temporary issue loading this digital proposal page. Please try refreshing.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3.5 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition flex items-center gap-2 shadow-lg shadow-rose-200"
      >
        <RefreshCw className="w-5 h-5" /> Reload Page
      </button>
    </div>
  )
}
