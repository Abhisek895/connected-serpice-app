is is "use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, ExternalLink, Power, Loader2, BarChart2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { deleteEventAction, toggleEventStatusAction } from "./builder/actions";

export default function EventCardMenu({
  eventId,
  slug,
  isPublished,
  onOpenDetails
}: {
  eventId: string;
  slug: string;
  isPublished: boolean;
  onOpenDetails?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteEventAction(eventId);
      if (res.success) {
        setShowDeleteModal(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
    setIsDeleting(false);
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const res = await toggleEventStatusAction(eventId);
      if (res.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
    setIsToggling(false);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* View Answers & Details */}
          {onOpenDetails && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDetails();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
            >
              <BarChart2 className="w-4 h-4 text-rose-500" />
              View Answers & Log
            </button>
          )}

          {/* View Live Page */}
          <a
            href={`/p/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            View Live Page
          </a>

          {/* Toggle Status */}
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-left"
          >
            {isToggling ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Power className="w-4 h-4 text-amber-500" />}
            {isPublished ? "Disable Event" : "Enable Event"}
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* Delete Event Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              setShowDeleteModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition text-left"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            Delete Event
          </button>

        </div>
      )}

      {/* BEAUTIFUL CUSTOM DELETE CONFIRMATION MODAL CARD */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-100 relative overflow-hidden text-center"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Event?</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete Event
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
