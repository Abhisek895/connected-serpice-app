"use client";

import { useState } from "react";
import { Mail, Send, Users, CheckCircle } from "lucide-react";

export default function EmailToolsPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Placeholder: integrate with Nodemailer/Resend/SendGrid when ready
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setSubject("");
    setBody("");
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Mail className="w-6 h-6 text-indigo-400" /> Email Tools
        </h2>
        <p className="text-slate-400 text-sm mt-1">Send announcements or newsletters to all registered users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Panel */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><Send className="w-4 h-4 text-indigo-400" /> Compose Broadcast Email</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Subject</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. New feature announcement!"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Message</label>
              <textarea
                required
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? "Sending..." : <><Send className="w-4 h-4" /> Send to All Users</>}
            </button>
            {sent && (
              <p className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4" /> Email queued successfully!
              </p>
            )}
          </form>
        </div>

        {/* Info Panel */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Recipients</h3>
          <p className="text-slate-400 text-sm">Emails will be sent to all verified registered users of OurStory.</p>
          <div className="bg-[#0a0f1e] border border-slate-700 rounded-lg p-4 text-sm text-slate-300 space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Email Provider</span><span>Configured via .env (Nodemailer)</span></div>
            <div className="flex justify-between"><span className="text-slate-500">From</span><span>noreply@ourstory.app</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Mode</span><span className="text-amber-400">Coming Soon — hook in SendGrid/Resend</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
