"use client";

import { useState } from "react";
import {
  FolderGit2,
  Cloud,
  ImageIcon,
  Music,
  Video,
  FileText,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  Search,
  Filter,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import UploadsViewer, { Lightbox } from "./UploadsViewer";
import { AnimatePresence, motion } from "framer-motion";

type UploadsTabsProps = {
  usersData: any[];
  allEvents?: any[];
  blobs: any[];
};

function formatBytes(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr?: string | Date) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function UploadsTabs({ usersData = [], allEvents = [], blobs = [] }: UploadsTabsProps) {
  const [activeTab, setActiveTab] = useState<"grouped" | "gallery">("gallery");
  const [blobList, setBlobList] = useState<any[]>(blobs || []);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "images" | "audio" | "video" | "others">("all");

  // Interactive Action Modals state
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [replaceTarget, setReplaceTarget] = useState<any | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState("uploads");
  const [isUploading, setIsUploading] = useState(false);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast("URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // ─── FILTERING ─────────────────────────────────────────────────────────────
  const isImageBlob = (b: any) =>
    b.pathname?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || b.contentType?.startsWith("image/");
  const isAudioBlob = (b: any) =>
    b.pathname?.match(/\.(mp3|wav|ogg|m4a)$/i) || b.contentType?.startsWith("audio/");
  const isVideoBlob = (b: any) =>
    b.pathname?.match(/\.(mp4|webm|mov)$/i) || b.contentType?.startsWith("video/");
  const isOtherBlob = (b: any) => !isImageBlob(b) && !isAudioBlob(b) && !isVideoBlob(b);

  const filteredBlobs = blobList.filter((b) => {
    const matchesQuery =
      !searchQuery.trim() ||
      b.pathname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (categoryFilter === "images") return isImageBlob(b);
    if (categoryFilter === "audio") return isAudioBlob(b);
    if (categoryFilter === "video") return isVideoBlob(b);
    if (categoryFilter === "others") return isOtherBlob(b);
    return true;
  });

  const images = filteredBlobs.filter(isImageBlob);
  const audio = filteredBlobs.filter(isAudioBlob);
  const video = filteredBlobs.filter(isVideoBlob);
  const others = filteredBlobs.filter(isOtherBlob);

  // ─── DELETE ACTION ──────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/blobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: deleteTarget.url,
          pathname: deleteTarget.pathname,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete blob");
      }

      setBlobList((prev) => prev.filter((b) => b.url !== deleteTarget.url));
      showToast(`Deleted ${deleteTarget.pathname || "file"}`);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(`Error deleting blob: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── REPLACE ACTION ─────────────────────────────────────────────────────────
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTarget || !replacementFile) return;

    setIsReplacing(true);
    try {
      const formData = new FormData();
      formData.append("file", replacementFile);
      formData.append("oldUrl", replaceTarget.url);
      formData.append("pathname", replaceTarget.pathname);

      const res = await fetch("/api/admin/blobs", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to replace blob");
      }

      // Update in local state with cache-busting parameter
      const cacheBustedUrl = `${data.blob.url}${data.blob.url.includes("?") ? "&" : "?"}t=${Date.now()}`;
      setBlobList((prev) =>
        prev.map((b) =>
          b.pathname === replaceTarget.pathname || b.url === replaceTarget.url
            ? { ...b, ...data.blob, url: cacheBustedUrl }
            : b
        )
      );

      showToast(`Replaced ${replaceTarget.pathname} successfully!`);
      setReplaceTarget(null);
      setReplacementFile(null);
      setReplacementPreview(null);
    } catch (err: any) {
      alert(`Error replacing blob: ${err.message}`);
    } finally {
      setIsReplacing(false);
    }
  };

  // ─── UPLOAD NEW ACTION ──────────────────────────────────────────────────────
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", uploadFolder);

      const res = await fetch("/api/admin/blobs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload blob");
      }

      setBlobList((prev) => [data.blob, ...prev]);
      showToast(`Uploaded ${data.blob.pathname} successfully!`);
      setIsUploadOpen(false);
      setUploadFile(null);
    } catch (err: any) {
      alert(`Error uploading blob: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm border border-emerald-300"
          >
            <Check className="w-4 h-4 text-slate-950" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex p-1 space-x-1 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("grouped")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "grouped"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            User Templates
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "gallery"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Cloud className="w-4 h-4" />
            Raw Blob Explorer
            <span className="ml-1.5 px-2 py-0.5 text-xs font-black rounded-full bg-emerald-500/30 text-emerald-300">
              {blobList.length}
            </span>
          </button>
        </div>

        {activeTab === "gallery" && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Blob
          </button>
        )}
      </div>

      {/* Lightbox for Gallery */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "grouped" ? (
          <UploadsViewer usersData={usersData} allEvents={allEvents} />
        ) : (
          <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            {/* Header & Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-emerald-400" />
                  Raw Blob Explorer
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Showing {filteredBlobs.length} of {blobList.length} raw files physically stored in your Vercel cloud bucket.
                </p>
              </div>

              {/* Search Bar & Category Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pathname..."
                    className="w-full sm:w-60 pl-9 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  {(["all", "images", "audio", "video", "others"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition whitespace-nowrap ${
                        categoryFilter === cat
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Photos Section */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <ImageIcon className="w-4 h-4 text-blue-400" /> All Cloud Photos ({images.length})
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {images.map((blob) => (
                    <div
                      key={blob.url}
                      className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 bg-slate-950 transition shadow-md flex flex-col justify-between"
                    >
                      {/* Image Thumbnail with Overlay */}
                      <div
                        onClick={() => setLightboxUrl(blob.url)}
                        className="relative aspect-square overflow-hidden cursor-pointer bg-slate-900"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={blob.url}
                          alt={blob.pathname}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplaceTarget(blob);
                              setReplacementFile(null);
                              setReplacementPreview(null);
                            }}
                            title="Replace Image"
                            className="p-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white shadow transition hover:scale-110"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(blob);
                            }}
                            title="Delete Image"
                            className="p-2 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white shadow transition hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(blob.url);
                            }}
                            title="Copy URL"
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white shadow transition hover:scale-110"
                          >
                            {copiedUrl === blob.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Card Info Footer */}
                      <div className="p-2 bg-slate-950 text-slate-400 border-t border-slate-800/80">
                        <p className="text-[11px] font-semibold text-slate-300 truncate" title={blob.pathname}>
                          {blob.pathname.split("/").pop()}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>{formatBytes(blob.size)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReplaceTarget(blob);
                              setReplacementFile(null);
                              setReplacementPreview(null);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                          >
                            Replace
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Section */}
            {audio.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Music className="w-4 h-4 text-purple-400" /> All Cloud Audio ({audio.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {audio.map((blob) => (
                    <div
                      key={blob.url}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 space-y-2.5 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate" title={blob.pathname}>
                            {blob.pathname}
                          </p>
                          <p className="text-[10px] text-slate-500">{formatBytes(blob.size)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setReplaceTarget(blob);
                              setReplacementFile(null);
                              setReplacementPreview(null);
                            }}
                            title="Replace Audio"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(blob)}
                            title="Delete Audio"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(blob.url)}
                            title="Copy URL"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            {copiedUrl === blob.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <audio controls className="w-full h-8 outline-none rounded-lg" src={blob.url} preload="metadata" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Section */}
            {video.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Video className="w-4 h-4 text-rose-400" /> All Cloud Video ({video.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {video.map((blob) => (
                    <div
                      key={blob.url}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-200 truncate flex-1" title={blob.pathname}>
                          {blob.pathname}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setReplaceTarget(blob);
                              setReplacementFile(null);
                              setReplacementPreview(null);
                            }}
                            title="Replace Video"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(blob)}
                            title="Delete Video"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(blob.url)}
                            title="Copy URL"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <video controls className="w-full aspect-video object-cover bg-black rounded-lg" src={blob.url} preload="metadata" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Others Section */}
            {others.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <FileText className="w-4 h-4 text-amber-400" /> Other Files ({others.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {others.map((blob) => (
                    <div
                      key={blob.url}
                      className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-xs text-slate-300 truncate" title={blob.pathname}>
                          {blob.pathname}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setReplaceTarget(blob);
                            setReplacementFile(null);
                            setReplacementPreview(null);
                          }}
                          title="Replace File"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(blob)}
                          title="Delete File"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={blob.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredBlobs.length === 0 && (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Cloud className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium">No files found matching your search.</p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── REPLACE MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {replaceTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <RefreshCw className="w-5 h-5 text-indigo-400" />
                  Replace Cloud Storage Blob
                </div>
                <button
                  onClick={() => {
                    setReplaceTarget(null);
                    setReplacementFile(null);
                    setReplacementPreview(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-slate-400 text-xs">Target File Path:</p>
                  <p className="font-mono text-xs text-emerald-400 font-bold truncate">
                    {replaceTarget.pathname}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Current Size: {formatBytes(replaceTarget.size)}
                  </p>
                </div>

                {/* Side-by-side or Replacement Preview */}
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-1">
                    <p className="text-slate-400 text-[11px] font-semibold uppercase">Current Version</p>
                    <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                      {isImageBlob(replaceTarget) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={replaceTarget.url} alt="Current" className="w-full h-full object-cover" />
                      ) : isAudioBlob(replaceTarget) ? (
                        <Music className="w-8 h-8 text-purple-400" />
                      ) : (
                        <FileText className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-slate-400 text-[11px] font-semibold uppercase">New Version</p>
                    <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-dashed border-indigo-500/50 flex items-center justify-center relative">
                      {replacementPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={replacementPreview} alt="New Preview" className="w-full h-full object-cover" />
                      ) : replacementFile ? (
                        <div className="text-center p-2">
                          <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                          <p className="text-[11px] text-slate-300 font-semibold truncate">{replacementFile.name}</p>
                          <p className="text-[10px] text-slate-500">{formatBytes(replacementFile.size)}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 text-center px-2">Select new file below</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Choose Replacement File:</label>
                  <input
                    type="file"
                    accept={isImageBlob(replaceTarget) ? "image/*" : isAudioBlob(replaceTarget) ? "audio/*" : isVideoBlob(replaceTarget) ? "video/*" : "*"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setReplacementFile(file);
                        if (file.type.startsWith("image/")) {
                          setReplacementPreview(URL.createObjectURL(file));
                        } else {
                          setReplacementPreview(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">
                    Will overwrite physical blob at <span className="font-mono text-slate-300">{replaceTarget.pathname}</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setReplaceTarget(null);
                    setReplacementFile(null);
                    setReplacementPreview(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  disabled={isReplacing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReplaceSubmit}
                  disabled={!replacementFile || isReplacing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                >
                  {isReplacing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Overwriting Blob...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Confirm & Replace
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DELETE MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Permanently Delete File?</h3>
                  <p className="text-xs text-slate-400">This cannot be undone.</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <p className="text-slate-400">File to purge from cloud bucket:</p>
                <p className="font-mono text-rose-300 font-bold truncate">
                  {deleteTarget.pathname}
                </p>
                <p className="text-slate-500 text-[11px]">Size: {formatBytes(deleteTarget.size)}</p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                This will delete the raw asset physically from Vercel Cloud Storage. Any events or templates relying on this URL may no longer load this media.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Permanently Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── UPLOAD NEW MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                  Upload New Blob to Storage
                </div>
                <button
                  onClick={() => {
                    setIsUploadOpen(false);
                    setUploadFile(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Target Folder:</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="uploads">uploads/</option>
                    <option value="audio">audio/</option>
                    <option value="demos/surprise">demos/surprise/</option>
                    <option value="demos/birthday-wish">demos/birthday-wish/</option>
                    <option value="demos/im-sorry">demos/im-sorry/</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Select File:</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
                  />
                  {uploadFile && (
                    <p className="text-[11px] text-emerald-400 font-medium">
                      Selected: {uploadFile.name} ({formatBytes(uploadFile.size)})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setUploadFile(null);
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile || isUploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload to Bucket
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
