"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Loader2, Ban, CheckCircle2, Trash2, AlertCircle, AlertTriangle, X, ExternalLink, Users as UsersIcon, Gift } from "lucide-react";
import { getAdminUsers, deleteAdminUser, toggleSuspendAdminUser, toggleUserPlanAdminAction } from "@/app/admin/actions";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Deletion Confirmation Modal State
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ id: string; email: string; name?: string } | null>(null);

  useEffect(() => { loadUsers(); }, [roleFilter]);

  async function loadUsers(searchQuery = search) {
    setIsLoading(true);
    try {
      const data = await getAdminUsers(searchQuery, roleFilter);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleTogglePlan = async (userId: string, currentPlan: string) => {
    setActionLoadingId(userId);
    setMessage(null);
    try {
      const res = await toggleUserPlanAdminAction(userId);
      if (res.success) {
        const updatedPlan = res.user?.plan;
        setMessage({
          type: "success",
          text: `User plan updated to ${updatedPlan}.`,
        });
        setUsers(users.map(u => u.id === userId ? { ...u, plan: updatedPlan } : u));
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update user plan." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSuspend = async (userId: string, currentRole: string) => {
    setActionLoadingId(userId);
    setMessage(null);
    try {
      const res = await toggleSuspendAdminUser(userId);
      if (res.success) {
        const isNowSuspended = res.user?.role === "SUSPENDED";
        setMessage({
          type: "success",
          text: `User ${isNowSuspended ? "suspended/disabled" : "reactivated"} successfully.`,
        });
        setUsers(users.map(u => u.id === userId ? { ...u, role: res.user?.role } : u));
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update user status." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDeleteUser = async (userId: string, userEmail: string) => {
    setActionLoadingId(userId);
    setMessage(null);
    try {
      const res = await deleteAdminUser(userId);
      if (res.success) {
        setMessage({ type: "success", text: `Account for ${userEmail} permanently deleted.` });
        setUsers(users.filter(u => u.id !== userId));
        setTotal(prev => prev - 1);
        setDeleteConfirmUser(null);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete user." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const roleColors: Record<string, string> = {
    super_admin: "text-purple-400 bg-purple-400/10 border border-purple-400/20",
    admin: "text-blue-400 bg-blue-400/10 border border-blue-400/20",
    moderator: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
    USER: "text-slate-400 bg-slate-800/50 border border-slate-700",
    SUSPENDED: "text-rose-400 bg-rose-500/10 border border-rose-500/30 font-bold",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            User Management
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {total} Total
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">All registered OurStory users with disable &amp; deletion controls.</p>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        <form onSubmit={(e) => { e.preventDefault(); loadUsers(); }} className="flex-1 w-full max-w-md relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
          <option value="SUSPENDED">Suspended / Disabled</option>
        </select>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role / Status</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Referred By</th>
                  <th className="px-4 py-3 font-semibold">Referrals Made</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Total Spending</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => {
                  const isActionBusy = actionLoadingId === u.id;
                  const isSuspended = u.role === "SUSPENDED";
                  const totalSpentPaise = u.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="group block"
                          title="Click to view full user profile & manage promotion"
                        >
                          <div className="font-bold text-slate-200 group-hover:text-indigo-400 transition flex items-center gap-1.5 text-xs">
                            {u.name || "Unnamed User"}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-400 transition" />
                          </div>
                          <div className="text-[11px] text-slate-500 group-hover:text-slate-400 transition">{u.email}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${roleColors[u.role] || roleColors.USER}`}>
                          {isSuspended ? "🚫 SUSPENDED" : u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleTogglePlan(u.id, u.plan)}
                          disabled={isActionBusy}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition border flex items-center gap-1 ${
                            u.plan === "PREMIUM"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                          } disabled:opacity-50`}
                          title={`Click to switch plan to ${u.plan === "PREMIUM" ? "FREE" : "PREMIUM"}`}
                        >
                          {u.plan === "PREMIUM" ? "👑 PREMIUM" : "FREE"}
                        </button>
                      </td>

                      {/* Referred By */}
                      <td className="px-4 py-3 text-xs">
                        {u.referredBy ? (
                          <div>
                            <div className="font-bold text-slate-200 text-xs">{u.referredBy.name || "User"}</div>
                            <div className="text-[11px] text-slate-400">{u.referredBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Direct / Organic</span>
                        )}
                      </td>

                      {/* Referrals Made */}
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-indigo-400 text-xs">{u._count?.referrals ?? 0}</span>
                          <span className="text-slate-400 text-[11px]">users</span>
                        </div>
                        {(u.walletBalance ?? 0) > 0 && (
                          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            Earned: ₹{(u.walletBalance / 100).toFixed(0)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-400 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>

                      {/* Total Spending */}
                      <td className="px-4 py-3 text-xs">
                        <div className={`font-bold text-xs ${totalSpentPaise > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                          ₹{(totalSpentPaise / 100).toFixed(0)}
                        </div>
                        {totalSpentPaise > 0 && (
                          <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                            {u.payments?.length ?? 0} {u.payments?.length === 1 ? "purchase" : "purchases"}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Suspend / Disable Button */}
                          <button
                            onClick={() => handleToggleSuspend(u.id, u.role)}
                            disabled={isActionBusy}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
                              isSuspended
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            } disabled:opacity-50`}
                            title={isSuspended ? "Reactivate User" : "Suspend & Disable User"}
                          >
                            {isActionBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isSuspended ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Enable
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" /> Disable
                              </>
                            )}
                          </button>

                          {/* Delete Button (Triggers Modal) */}
                          <button
                            onClick={() => setDeleteConfirmUser({ id: u.id, email: u.email, name: u.name })}
                            disabled={isActionBusy}
                            className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                            title="Delete User Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#111827] border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center"
            >
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Delete User Account?</h3>

              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 text-left text-xs text-rose-200 leading-relaxed space-y-1.5">
                <p className="font-semibold text-rose-300">
                  Are you sure you want to permanently delete account for <strong className="text-white underline">{deleteConfirmUser.email}</strong>?
                </p>
                <p className="text-rose-400/90 font-medium">
                  This will erase all user events and payments!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteUser(deleteConfirmUser.id, deleteConfirmUser.email)}
                  disabled={actionLoadingId === deleteConfirmUser.id}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoadingId === deleteConfirmUser.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete Account
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
