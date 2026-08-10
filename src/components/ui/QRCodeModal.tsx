"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, QrCode, Download, Copy, CheckCircle2 } from "lucide-react";

interface QRCodeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function QRCodeModal({ url, title, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=f43f5e&data=${encodeURIComponent(
    url
  )}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-rose-100 relative text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-5">Scan with any smartphone camera to open the page</p>

        {/* QR Code Container */}
        <div className="bg-gradient-to-tr from-rose-50 to-purple-50 p-4 rounded-2xl border border-rose-100 inline-block mb-5 shadow-inner">
          <img
            src={qrImageUrl}
            alt="Proposal QR Code"
            className="w-48 h-48 rounded-xl bg-white p-2 shadow-sm object-contain mx-auto"
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-200 text-xs font-mono text-slate-600 truncate">
          {url}
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyUrl}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition shadow-md shadow-rose-200 flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download QR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
