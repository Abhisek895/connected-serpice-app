"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Heart, HeartOff, Clock, Smartphone, Globe, ExternalLink, Calendar } from "lucide-react";

type ResponseItem = {
  id: string;
  action: string;
  device?: string | null;
  browser?: string | null;
  createdAt: string | Date;
};

type EventDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  themeName: string;
  status: string;
  createdAt: string | Date;
  responses: ResponseItem[];
};

export default function EventDetailsModal({
  isOpen,
  onClose,
  title,
  slug,
  themeName,
  status,
  createdAt,
  responses
}: EventDetailsModalProps) {
  if (!isOpen) return null;

  const views = responses.filter(r => r.action === "VIEWED").length;
  const accepts = responses.filter(r => r.action === "ACCEPTED").length;
  const rejects = responses.filter(r => r.action === "REJECTED").length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {themeName}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {status === 'PUBLISHED' ? 'Active' : 'Disabled'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" /> Published on {new Date(createdAt).toLocaleDateString()} &bull;
                <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline flex items-center gap-1">
                  /p/{slug} <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metrics Overview */}
          <div className="p-6 grid grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50/30">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <div className="bg-blue-50 text-blue-500 p-2 rounded-xl w-fit mx-auto mb-2">
                <Eye className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Total Views</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{views}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-100 text-center shadow-sm">
              <div className="bg-green-50 text-green-600 p-2 rounded-xl w-fit mx-auto mb-2">
                <Heart className="w-5 h-5 fill-green-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Yes! 😍 Answers</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{accepts}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <div className="bg-rose-50 text-rose-500 p-2 rounded-xl w-fit mx-auto mb-2">
                <HeartOff className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">No 🙈 Answers</p>
              <p className="text-2xl font-bold text-rose-500 mt-1">{rejects}</p>
            </div>
          </div>

          {/* Response Feed / Answers History */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" /> Recipient Answer Log & Activity
            </h4>

            {responses.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No responses recorded yet for this event link. Share your link to start receiving answers!
              </div>
            ) : (
              <div className="space-y-3">
                {responses.map((res) => {
                  const isAccepted = res.action === "ACCEPTED";
                  const isRejected = res.action === "REJECTED";
                  const isViewed = res.action === "VIEWED";

                  return (
                    <div
                      key={res.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                        isAccepted 
                          ? "bg-green-50/70 border-green-200 text-green-900"
                          : isRejected
                          ? "bg-rose-50/70 border-rose-200 text-rose-900"
                          : "bg-slate-50 border-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          isAccepted ? "bg-green-500 text-white" : isRejected ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isAccepted && <Heart className="w-5 h-5 fill-white" />}
                          {isRejected && <HeartOff className="w-5 h-5" />}
                          {isViewed && <Eye className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {isAccepted && "Answered: YES! 😍"}
                            {isRejected && "Answered: No 🙈"}
                            {isViewed && "Recipient Opened Page"}
                          </p>
                          <p className="text-xs opacity-75 mt-0.5 flex items-center gap-2">
                            <Smartphone className="w-3 h-3" /> {res.device || "Mobile/Web"} &bull; {new Date(res.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isAccepted ? "bg-green-200 text-green-800" : isRejected ? "bg-rose-200 text-rose-800" : "bg-slate-200 text-slate-700"
                      }`}>
                        {res.action}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
