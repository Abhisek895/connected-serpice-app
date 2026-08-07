"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-red-100 shadow-sm">
      <div className="bg-red-50 p-4 rounded-full text-red-500 mb-4">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 max-w-md mb-6">
        We encountered an error loading this dashboard section. Don't worry, your data is safe.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-md"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  )
}
