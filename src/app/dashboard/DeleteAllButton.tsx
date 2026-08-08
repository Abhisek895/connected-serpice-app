"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteAllEventsAction } from "./builder/actions";

export default function DeleteAllButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL your saved events and links? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteAllEventsAction();
      if (res.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete all events:", err);
    }
    setIsDeleting(false);
  };

  return (
    <button
      onClick={handleDeleteAll}
      disabled={isDeleting}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-red-200"
    >
      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Delete All
    </button>
  );
}
