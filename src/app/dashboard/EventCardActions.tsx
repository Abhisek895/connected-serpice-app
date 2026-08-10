"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, BarChart3, Share2 } from "lucide-react";

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

  const targetUrl = customUrl ? customUrl : `/p/${slug}`;

  const handleCopy = () => {
    const absoluteUrl = `${window.location.origin}${targetUrl}`;
    navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const absoluteUrl = `${window.location.origin}${targetUrl}`;
    const shareMessage = `I made a special surprise for you! 💖 Open this link: ${absoluteUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "A Special Surprise For You 💖",
          text: "I made something special for you!",
          url: absoluteUrl,
        });
        return;
      } catch (e) {
        // User cancelled or fallback
      }
    }

    // Fallback: Open WhatsApp share directly
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 1. View Answers & Log */}
      <Link
        href={`/dashboard/analytics/${eventId}`}
        data-tour="view-answers-log"
        className="w-full bg-white border border-rose-100 text-rose-600 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-50 transition flex items-center justify-center gap-2 shadow-sm"
      >
        <BarChart3 className="w-4 h-4" />
        View Answers & Log
      </Link>

      {/* 2. Flex Sharing Bar: Copy Direct Link + Share to Loved One + Open Live */}
      <div className="flex gap-1.5">
        <button
          onClick={handleCopy}
          data-tour="copy-direct-link"
          className="flex-1 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1.5 shadow-sm truncate"
          title="Copy direct link to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Direct Link"}
        </button>

        <button
          onClick={handleShare}
          data-tour="share-loved-one"
          className="px-3 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-rose-200"
          title="Share to your loved one via WhatsApp / Messaging"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share 💖
        </button>

        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
          title="Open Live Page"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
