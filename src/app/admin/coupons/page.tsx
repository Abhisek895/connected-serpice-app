"use client";

import { useEffect, useState } from "react";
import { Ticket, Loader2, ShieldAlert, Plus, Trash2, Power, X } from "lucide-react";
import { getAdminCoupons, createCoupon, toggleCoupon, deleteCoupon } from "@/app/admin/actions";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("FIXED");
  const [newValue, setNewValue] = useState(0);
  const [newMaxUses, setNewMaxUses] = useState<number | "">("");
  const [newExpiry, setNewExpiry] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setIsLoading(true);
    try {
      const res = await getAdminCoupons();
      if (res.success) {
        setCoupons(res.coupons);
      } else {
        setError("Failed to load coupons");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data: any = {
        code: newCode.toUpperCase(),
        discountType: newType,
        discountValue: newType === "FIXED" ? newValue * 100 : newValue, // FIXED in paise, PERCENT in pure integer
        isActive: true,
      };
      if (newMaxUses !== "") data.maxUses = Number(newMaxUses);
      if (newExpiry) data.expiresAt = new Date(newExpiry).toISOString();

      await createCoupon(data);
      setIsCreating(false);
      setNewCode("");
      setNewValue(0);
      setNewMaxUses("");
      setNewExpiry("");
      fetchCoupons();
    } catch (err) {
      alert("Failed to create coupon. Code might already exist.");
    }
  }

  async function handleToggle(id: string) {
    try {
      await toggleCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert("Failed to toggle coupon");
    }
  }

  async function handleDelete(id: string) {
    if (deletingId === id) {
      // Second click = confirmed
      try {
        await deleteCoupon(id);
        setDeletingId(null);
        fetchCoupons();
      } catch (err) {
        alert("Failed to delete coupon");
        setDeletingId(null);
      }
    } else {
      // First click = ask for confirmation inline
      setDeletingId(id);
      // Auto-cancel after 4 seconds if user doesn't confirm
      setTimeout(() => setDeletingId(prev => prev === id ? null : prev), 4000);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-400" /> Discount Coupons
          </h2>
          <p className="text-slate-400 text-sm mt-1">Create and manage promotional discount codes.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isCreating ? "Cancel" : "New Coupon"}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
          <h3 className="text-rose-400 font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Error
          </h3>
          <p className="text-sm text-slate-300 mt-1">{error}</p>
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-[#111827] border border-indigo-500/30 p-6 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Coupon Code *</label>
              <input required type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 uppercase" placeholder="e.g. SAVE20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Discount Type *</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200">
                <option value="FIXED">Fixed Amount (₹)</option>
                <option value="PERCENT">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Discount Value *</label>
              <input required type="number" min="1" value={newValue} onChange={e => setNewValue(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200" placeholder={newType === "FIXED" ? "e.g. 50" : "e.g. 20"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Max Uses (Optional)</label>
              <input type="number" min="1" value={newMaxUses} onChange={e => setNewMaxUses(e.target.value ? Number(e.target.value) : "")} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Expiry Date (Optional)</label>
              <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition">Create Coupon</button>
        </form>
      )}

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Uses</th>
                <th className="px-6 py-4 font-semibold">Expiry</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No coupons found.</td></tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-400">{coupon.code}</td>
                  <td className="px-6 py-4 text-slate-200 font-medium">
                    {coupon.discountType === "FIXED" ? `₹${(coupon.discountValue / 100).toFixed(2)}` : `${coupon.discountValue}%`}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {coupon.usedCount} / {coupon.maxUses || "∞"}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.isActive ? (
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold uppercase">Active</span>
                    ) : (
                      <span className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded text-xs font-bold uppercase">Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleToggle(coupon.id)}
                        className="p-1.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                        title={coupon.isActive ? "Disable" : "Enable"}
                      >
                        <Power className={`w-4 h-4 ${coupon.isActive ? "text-emerald-400" : "text-slate-500"}`} />
                      </button>

                      {deletingId === coupon.id ? (
                        // Inline confirm state
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-rose-400 font-bold">Sure?</span>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1.5 bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
