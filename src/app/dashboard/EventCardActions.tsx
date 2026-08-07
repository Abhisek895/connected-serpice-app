"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function EventCardActions({ 
  slug, 
  eventId, 
  isInstant,
  customUrl 
}: { 
  slug: string; 
  eventId: string; 
  isInstant?: boolean;
  customUrl?: string;
}) {
  const [copied, setCopied] = useState(false);

  const targetUrl = customUrl 
    ? `${window.location.origin}${customUrl}` 
    : `${window.location.origin}/p/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleCopy}
        className="flex-1 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1.5 shadow-sm"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Direct Link"}
      </button>
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
        title="Open Live Page"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
