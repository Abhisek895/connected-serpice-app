"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Send,
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Compass,
  Smile,
  AlertCircle,
  Share2,
} from "lucide-react";

export default function CreatorStatusPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${id}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Invitation not found");
      } else {
        setData(json.invitation);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStatus();
    }
  }, [id]);

  const invitationUrl = typeof window !== "undefined" ? `${window.location.origin}/i/${id}` : "";

  const handleCopy = () => {
    if (invitationUrl) {
      navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `I made something for you. 🌺\n\nOpen this when you have a minute ❤️\n\n${invitationUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161413] text-[#FDFBF7] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#FDFBF7]/60 tracking-wider">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#161413] text-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-[#C0422B] mb-3" />
        <h2 className="text-xl font-bold mb-1">Invitation Not Found</h2>
        <p className="text-xs text-[#FDFBF7]/60 mb-6">{error || "Could not find details for this link."}</p>
        <Link
          href="/puja"
          className="px-5 py-2.5 rounded-xl bg-[#631726] border border-[#D4AF37]/40 text-xs font-medium"
        >
          Create New Invitation
        </Link>
      </div>
    );
  }

  const custom = data.customData || {};
  const recipientName = custom.recipientName || "Your Recipient";
  const creatorName = custom.creatorName || "You";
  const latestResponse = data.latestResponse;
  const isAccepted = latestResponse?.action === "ACCEPTED";
  const isThinking = latestResponse?.action === "THINKING";
  const meta = latestResponse?.metadata || {};

  return (
    <div className="min-h-screen bg-[#161413] text-[#FDFBF7] font-sans p-4 sm:p-6 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6 pt-4 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FDFBF7]/10 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Status Dashboard
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
              Your invitation
            </h1>
          </div>
          <button
            onClick={fetchStatus}
            className="p-2 rounded-xl bg-[#24201D] border border-[#FDFBF7]/15 hover:border-[#D4AF37] text-[#FDFBF7]/80 hover:text-[#D4AF37] transition-all"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-5 rounded-3xl bg-[#211E1C] border border-[#D4AF37]/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#FDFBF7]/60">Recipient</span>
            <span className="text-xs font-bold text-[#FDFBF7]">{recipientName}</span>
          </div>

          <div className="pt-2 border-t border-[#FDFBF7]/10">
            <span className="text-xs text-[#FDFBF7]/60 block mb-2">Status:</span>
            {isAccepted ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#631726]/40 border border-[#D4AF37] text-sm font-bold text-[#FDFBF7] shadow-inner">
                <Heart className="w-4 h-4 fill-[#C0422B] text-[#C0422B]" />
                <span>Accepted</span>
              </div>
            ) : isThinking ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/50 text-sm font-semibold text-amber-300">
                <span>🌸 Thinking</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2E2926] border border-[#FDFBF7]/20 text-xs text-[#FDFBF7]/70">
                <span>⏳ Waiting for response</span>
              </div>
            )}
          </div>

          {latestResponse && (
            <p className="text-[10px] text-[#FDFBF7]/40">
              Updated {new Date(latestResponse.createdAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Recipient's Choices */}
        {latestResponse ? (
          <div className="p-5 rounded-3xl bg-[#FAF7F0] text-[#161413] border border-[#D4AF37]/40 shadow-xl space-y-4">
            <div className="border-b border-[#161413]/10 pb-2">
              <h3 className="font-editorial text-xl font-bold text-[#161413]">
                Their choices
              </h3>
              <p className="text-[11px] text-[#161413]/60">What {recipientName} picked for Puja</p>
            </div>

            <div className="space-y-3 text-xs">
              {meta.selectedVibe && (
                <div className="flex justify-between items-center py-1 border-b border-[#161413]/5">
                  <span className="text-[#161413]/70 font-medium">Puja vibe:</span>
                  <span className="font-bold text-[#631726] uppercase tracking-wide">
                    {meta.selectedVibe}
                  </span>
                </div>
              )}

              {meta.selectedAdventure && (
                <div className="flex justify-between items-center py-1 border-b border-[#161413]/5">
                  <span className="text-[#161413]/70 font-medium">Adventure style:</span>
                  <span className="font-bold text-[#161413]">
                    {meta.selectedAdventure}
                  </span>
                </div>
              )}

              {meta.selectedFoods && meta.selectedFoods.length > 0 && (
                <div className="py-1 border-b border-[#161413]/5">
                  <span className="text-[#161413]/70 font-medium block mb-1">Food preferences:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.selectedFoods.map((f: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#F2EBE0] border border-[#161413]/10 font-semibold text-[#161413] text-[11px]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {meta.selectedLocationPref && (
                <div className="flex justify-between items-center py-1 border-b border-[#161413]/5">
                  <span className="text-[#161413]/70 font-medium">Location preference:</span>
                  <span className="font-bold text-[#161413]">
                    {meta.selectedLocationPref}
                  </span>
                </div>
              )}

              {meta.recipientNote && (
                <div className="p-3 rounded-xl bg-[#F2EBE0] border-l-4 border-[#C0422B] mt-2">
                  <span className="text-[10px] font-bold text-[#C0422B] uppercase tracking-wide block mb-0.5">
                    Note from {recipientName}:
                  </span>
                  <p className="text-xs italic text-[#161413]/90">&ldquo;{meta.recipientNote}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-[#211E1C] border border-[#FDFBF7]/10 text-center space-y-2">
            <p className="text-xs text-[#FDFBF7]/70">
              No response recorded yet. Send the link to {recipientName} to get their choices!
            </p>
          </div>
        )}

        {/* Share & Action Center */}
        <div className="p-5 rounded-3xl bg-[#211E1C] border border-[#FDFBF7]/15 space-y-3">
          <span className="text-xs font-semibold text-[#D4AF37] block">
            Share invitation link
          </span>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/10">
            <input
              type="text"
              readOnly
              value={invitationUrl}
              className="flex-1 bg-transparent text-xs text-[#FDFBF7]/80 focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#631726] text-[11px] font-semibold text-[#FDFBF7] flex items-center gap-1 hover:bg-[#781C2E] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-4 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#25D366]/30 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <Link
              href={`/i/${id}`}
              target="_blank"
              className="py-2.5 px-4 rounded-xl bg-[#2E2926] border border-[#FDFBF7]/20 text-[#FDFBF7] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#38322E] transition-colors"
            >
              <span>Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
