"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Ticket, Loader2, ShieldAlert, Check, X } from "lucide-react";
import { getAdminCoupons, createCoupon, updateCoupon, toggleCoupon, deleteCoupon } from "../actions";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("FIXED");
  const [newValue, setNewValue] = useState(0);
  const [newMaxUses, setNewMaxUses] = useState<number | "">(1000);
  const [isUnlimitedTotalUses, setIsUnlimitedTotalUses] = useState<boolean>(false);
  const [newMaxUsesPerUser, setNewMaxUsesPerUser] = useState<number | "">(1);
  const [isUnlimitedPerUser, setIsUnlimitedPerUser] = useState<boolean>(false);
  const [newExpiry, setNewExpiry] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        code: newCode.toUpperCase().trim(),
        discountType: newType,
        discountValue: newType === "FIXED" ? newValue * 100 : newValue, // FIXED in paise, PERCENT inside 0-100
        isActive: true,
      };

      if (!isUnlimitedTotalUses && newMaxUses !== "") {
        data.maxUses = Number(newMaxUses);
      } else {
        data.maxUses = null; // Unlimited total site uses
      }

      if (!isUnlimitedPerUser && newMaxUsesPerUser !== "") {
        data.maxUsesPerUser = Number(newMaxUsesPerUser);
      } else {
        data.maxUsesPerUser = null; // Unlimited per user account
      }

      if (newExpiry) data.expiresAt = new Date(newExpiry).toISOString();

      await createCoupon(data);
      setIsCreating(false);
      setNewCode("");
      setNewValue(0);
      setNewMaxUses(1000);
      setIsUnlimitedTotalUses(false);
      setNewMaxUsesPerUser(1);
      setIsUnlimitedPerUser(false);
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
        const res = await deleteCoupon(id);
        setDeletingId(null);
        if (res && res.success) {
          fetchCoupons();
        } else {
          alert(res?.error || "Failed to delete coupon");
        }
      } catch (err: any) {
        alert(err?.message || "Failed to delete coupon");
        setDeletingId(null);
      }
    } else {
      // First click = ask for confirmation inline
      setDeletingId(id);
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
          <p className="text-slate-400 text-sm mt-1">Create and manage promotional discount codes with custom total & per-user usage limits.</p>
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
        <form onSubmit={handleCreate} className="bg-[#111827] border border-indigo-500/30 p-6 rounded-xl space-y-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Coupon Code *</label>
              <input required type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold uppercase" placeholder="e.g. SAVE20" />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Discount Type *</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold">
                <option value="FIXED">Fixed Amount (₹)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Discount Value *</label>
              <input required type="number" min="0" value={newValue} onChange={e => setNewValue(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold" placeholder={newType === "FIXED" ? "e.g. 50" : "e.g. 100"} />
            </div>

            {/* Max Total Uses */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300">Max Total Uses</label>
                <label className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold cursor-pointer hover:text-indigo-300">
                  <input
                    type="checkbox"
                    checked={isUnlimitedTotalUses}
                    onChange={(e) => {
                      setIsUnlimitedTotalUses(e.target.checked);
                      if (e.target.checked) setNewMaxUses("");
                      else setNewMaxUses(1000);
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <span>Unlimited</span>
                </label>
              </div>
              <input
                type="number"
                min="1"
                disabled={isUnlimitedTotalUses}
                value={isUnlimitedTotalUses ? "" : newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                placeholder={isUnlimitedTotalUses ? "Unlimited total uses" : "e.g. 1000"}
              />
            </div>

            {/* Max Uses Per User */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300">Max Uses Per User</label>
                <label className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold cursor-pointer hover:text-indigo-300">
                  <input
                    type="checkbox"
                    checked={isUnlimitedPerUser}
                    onChange={(e) => {
                      setIsUnlimitedPerUser(e.target.checked);
                      if (e.target.checked) setNewMaxUsesPerUser("");
                      else setNewMaxUsesPerUser(1);
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <span>Unlimited</span>
                </label>
              </div>
              <input
                type="number"
                min="1"
                disabled={isUnlimitedPerUser}
                value={isUnlimitedPerUser ? "" : newMaxUsesPerUser}
                onChange={(e) => setNewMaxUsesPerUser(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                placeholder={isUnlimitedPerUser ? "Unlimited per account" : "e.g. 1 (1 use per account)"}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Expiry Date (Optional)</label>
              <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100" />
            </div>
          </div>

          <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold transition shadow-md">Create Coupon</button>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Total Uses</th>
                <th className="px-6 py-4 font-semibold">Per User Limit</th>
                <th className="px-6 py-4 font-semibold">Expiry</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {coupons.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No coupons found.</td></tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-400">{coupon.code}</td>
                  <td className="px-6 py-4 text-slate-200 font-medium">
                    {coupon.discountType === "FIXED" ? `₹${(coupon.discountValue / 100).toFixed(2)}` : `${coupon.discountValue}%`}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">
                    {coupon.usedCount} / {coupon.maxUses !== null && coupon.maxUses !== undefined ? coupon.maxUses : "∞"}
                  </td>
                  <td className="px-6 py-4 text-rose-300 font-semibold">
                    {coupon.maxUsesPerUser ? `${coupon.maxUsesPerUser}x / user` : "Unlimited"}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggle(coupon.id)}
                      className={`text-xs px-3 py-1 rounded font-medium transition ${coupon.isActive ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"}`}
                    >
                      {coupon.isActive ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className={`text-xs px-3 py-1 rounded font-medium transition ${deletingId === coupon.id ? "bg-rose-600 text-white font-bold animate-pulse" : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"}`}
                    >
                      {deletingId === coupon.id ? "Confirm Delete?" : "Delete"}
                    </button>
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
