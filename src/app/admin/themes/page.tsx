"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Tag, Loader2, Check, X, Edit3, Eye, Search, Sparkles, Upload, ImageIcon, Type, AlignLeft } from "lucide-react";
import { getAdminThemes, upsertThemePricing } from "@/app/admin/actions";
import { demos } from "@/app/dashboard/demoConfig";
import { motion, AnimatePresence } from "framer-motion";
import ImageCropModal from "./ImageCropModal";

type PricingMap = Record<string, {
  price: number;
  durationDays: number;
  isActive: boolean;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
}>;

export default function AdminThemesPage() {
  const [pricingMap, setPricingMap] = useState<PricingMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit panel state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editDuration, setEditDuration] = useState(7);
  const [editActive, setEditActive] = useState(true);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnailUrl, setEditThumbnailUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [cropFileSrc, setCropFileSrc] = useState<string | null>(null);

  useEffect(() => { fetchThemes(); }, []);

  async function fetchThemes() {
    setIsLoading(true);
    try {
      const res = await getAdminThemes();
      if (res.success) {
        const map: PricingMap = {};
        res.themes.forEach((t: any) => {
          map[t.name] = {
            price: t.price,
            durationDays: t.durationDays,
            isActive: t.isActive,
            title: t.title,
            description: t.description,
            thumbnailUrl: t.thumbnailUrl,
          };
        });
        setPricingMap(map);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(demoId: string) {
    const p = pricingMap[demoId];
    const demo = demos.find(d => d.id === demoId);
    setSelectedId(demoId);
    setEditPrice(p ? p.price / 100 : 0);
    setEditDuration(p ? p.durationDays : 7);
    setEditActive(p ? p.isActive : true);
    setEditTitle(p?.title || demo?.title || "");
    setEditDescription(p?.description || demo?.description || "");
    const thumb = p?.thumbnailUrl || demo?.image || "";
    setEditThumbnailUrl(thumb);
    setThumbnailPreview(thumb);
    setJustSaved(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create local URL and open crop modal
    const url = URL.createObjectURL(file);
    setCropFileSrc(url);
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCropComplete(croppedBlob: Blob, previewUrl: string) {
    setCropFileSrc(null); // Close modal
    if (!selectedId) return;

    setIsUploading(true);
    setThumbnailPreview(previewUrl); // Show optimistic preview

    const form = new FormData();
    // Convert blob to file with extension based on MIME
    const ext = croppedBlob.type === "image/png" ? "png" : croppedBlob.type === "image/webp" ? "webp" : "jpg";
    form.append("file", new File([croppedBlob], `thumbnail.${ext}`, { type: croppedBlob.type }));
    form.append("demoId", selectedId);

    try {
      const res = await fetch("/api/admin/upload-thumbnail", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setEditThumbnailUrl(data.url);
      } else {
        alert("Upload failed: " + data.message);
        setThumbnailPreview(pricingMap[selectedId]?.thumbnailUrl || "");
      }
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function saveEdit() {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      await upsertThemePricing(
        selectedId,
        Math.round(editPrice * 100),
        editDuration,
        editActive,
        {
          title: editTitle || undefined,
          description: editDescription || undefined,
          thumbnailUrl: editThumbnailUrl || undefined,
        }
      );
      // Optimistic real-time update
      setPricingMap(prev => ({
        ...prev,
        [selectedId]: {
          price: Math.round(editPrice * 100),
          durationDays: editDuration,
          isActive: editActive,
          title: editTitle || null,
          description: editDescription || null,
          thumbnailUrl: editThumbnailUrl || null,
        }
      }));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const filteredDemos = useMemo(() =>
    demos.filter(d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.badge.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const selectedDemo = demos.find(d => d.id === selectedId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-400" /> Pricing &amp; Themes
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Click any template to edit its price, title, description, and thumbnail.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredDemos.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-medium">No templates match your search.</div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-2 mb-5">
            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Explore Demos &amp; Template Actions 💖
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredDemos.map((demo) => {
              const Icon = demo.icon;
              const p = pricingMap[demo.id];
              const price = p?.price ?? 0;
              const isActive = p?.isActive ?? true;
              const isSelected = selectedId === demo.id;
              // Use DB override or fallback to hardcoded
              const displayTitle = p?.title || demo.title;
              const displayThumb = p?.thumbnailUrl || demo.image;
              const displayDescription = p?.description || demo.description;

              return (
                <motion.div
                  key={demo.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-[#111827] rounded-2xl border overflow-hidden flex flex-col transition-all shadow-sm ${
                    isSelected
                      ? "border-indigo-500 shadow-indigo-500/20 shadow-lg ring-2 ring-indigo-500/30"
                      : "border-slate-800 hover:border-slate-600 hover:shadow-md"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden group">
                    <img
                      src={displayThumb}
                      alt={displayTitle}
                      className="w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent" />

                    {/* Badges container */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center pr-3">
                      <span className={`text-[9px] leading-[12px] px-2 py-1 rounded-full uppercase font-bold tracking-wider shadow-sm flex items-center gap-1 ${demo.badgeColor}`}>
                        {demo.badge}
                      </span>
                      {price > 0 ? (
                        <span className="text-[9px] leading-[12px] px-2 py-1 rounded-full uppercase font-bold tracking-wider shadow-sm bg-amber-400 text-amber-900 border border-amber-300">
                          ₹{(price / 100).toFixed(0)} / {p?.durationDays ?? 7}d
                        </span>
                      ) : (
                        <span className="text-[9px] leading-[12px] px-2 py-1 rounded-full uppercase font-bold tracking-wider shadow-sm bg-emerald-500/90 text-white border border-emerald-400/50">
                          Free
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      {isActive
                        ? <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">Active</span>
                        : <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600 font-bold uppercase">Disabled</span>
                      }
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 pb-2 flex-grow">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-1.5">
                      <Icon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      {displayTitle}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{displayDescription}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="p-4 pt-2.5 space-y-1.5 border-t border-slate-800">
                    <a
                      href={demo.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-slate-400" /> 1. Preview Demo</span>
                      <span className="text-[10px] text-slate-500 font-normal">Test Live</span>
                    </a>

                    {demo.hasInstantUse && (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-800/50 text-slate-500 text-xs font-bold flex items-center justify-between opacity-60 cursor-default select-none">
                        <span>2. Use As-Is (Instant)</span>
                        <span className="text-[10px] font-normal">Direct Link</span>
                      </div>
                    )}

                    <button
                      onClick={() => openEdit(demo.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-700 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-transparent hover:border-indigo-500/30"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        {demo.hasInstantUse ? "3." : "2."} Edit Pricing &amp; Content
                      </span>
                      <span className="text-[10px] opacity-80 font-normal">
                        {isSelected ? "Editing below ↓" : "Title / Thumb / Price"}
                      </span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── FULL EDIT PANEL ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedId && selectedDemo && (
          <motion.div
            key="edit-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="bg-[#111827] border border-indigo-500/40 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/5"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                  <img src={thumbnailPreview || selectedDemo.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{editTitle || selectedDemo.title}</h3>
                  <p className="text-slate-500 text-xs">Editing template content &amp; pricing</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* ── CONTENT SECTION ── */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" /> Template Content
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Thumbnail Image
                    </label>
                    <div
                      className="relative h-44 bg-slate-900 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 overflow-hidden group cursor-pointer transition"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                          <ImageIcon className="w-10 h-10 mb-2" />
                          <span className="text-xs font-medium">Click to upload</span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition flex flex-col items-center gap-1 text-white">
                          {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8" />
                              <span className="text-xs font-bold">Replace thumbnail</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <p className="text-xs text-slate-500 mt-1.5">JPEG, PNG or WebP recommended. Replaces the default thumbnail.</p>
                  </div>

                  {/* Title + Description */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Template Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                        placeholder={selectedDemo.title}
                      />
                      <p className="text-xs text-slate-500 mt-1.5">Leave blank to use the default title.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlignLeft className="w-3 h-3" /> Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                        placeholder={selectedDemo.description}
                      />
                      <p className="text-xs text-slate-500 mt-1.5">Leave blank to use the default description.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800" />

              {/* ── PRICING SECTION ── */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Pricing &amp; Availability
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">₹</span>
                      <input
                        type="number" min="0" value={editPrice}
                        onChange={e => setEditPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                        placeholder="0 = Free"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Enter 0 to make it free.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (Days)</label>
                    <input
                      type="number" min="1" value={editDuration}
                      onChange={e => setEditDuration(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Days event stays live after purchase.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visibility</label>
                    <select
                      value={editActive ? "true" : "false"}
                      onChange={e => setEditActive(e.target.value === "true")}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    >
                      <option value="true">✅ Active — visible to users</option>
                      <option value="false">🚫 Disabled — hidden from users</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Preview bar */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Live Preview:</span>
                <span className="font-bold text-white">{editTitle || selectedDemo.title}</span>
                {editPrice > 0
                  ? <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded-full">₹{editPrice.toFixed(0)} · {editDuration} days</span>
                  : <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">Free</span>
                }
                {editActive
                  ? <span className="ml-auto text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Visible ✅</span>
                  : <span className="ml-auto text-slate-400 text-xs font-bold bg-slate-700 px-2 py-0.5 rounded-full border border-slate-600">Hidden 🚫</span>
                }
              </div>

              {/* Save buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveEdit}
                  disabled={isSaving || isUploading}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 min-w-[170px] justify-center"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : justSaved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                  {isSaving ? "Saving…" : justSaved ? "Saved! ✓" : "Confirm & Save All"}
                </button>
                <button onClick={() => setSelectedId(null)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">
                  Cancel
                </button>
                <AnimatePresence>
                  {justSaved && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-emerald-400 text-sm font-medium"
                    >
                      Changes are live on the dashboard! 🚀
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cropFileSrc && (
          <ImageCropModal
            imageSrc={cropFileSrc}
            onCancel={() => setCropFileSrc(null)}
            onComplete={handleCropComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
