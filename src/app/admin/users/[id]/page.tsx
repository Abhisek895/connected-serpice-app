"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, ShieldAlert, Mail, Ban, ShieldCheck, Loader2, FileHeart, CreditCard, Gift, Users as UsersIcon, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { getAdminUserById, updateAdminUserRole, toggleUserPlanAdminAction, toggleSuspendAdminUser, banAdminUserAction, sendEmailAdminUserAction } from "@/app/admin/actions";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAdminAuth();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<"suspend" | "ban" | "email" | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getAdminUserById(id as string)
      .then((data) => {
        setUser(data);
        setEmailSubject(`Important Notice for ${data?.name || data?.email}`);
        setEmailMessage(`Hello ${data?.name || "User"},\n\nWe are writing regarding your OurStory account (${data?.email})...\n\nBest regards,\nOurStory Team`);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRoleChange = async (newRole: string) => {
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;
    setIsActionLoading(true);
    try {
      await updateAdminUserRole(id as string, newRole);
      setUser({ ...user, role: newRole });
    } catch (err: any) {
      alert(err.message || "Failed to change role.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePlanToggle = async () => {
    const targetPlan = user.plan === "PREMIUM" ? "FREE" : "PREMIUM";
    if (!confirm(`Switch this user's plan to "${targetPlan}" in SQLite Database?`)) return;
    setIsActionLoading(true);
    try {
      const res = await toggleUserPlanAdminAction(id as string);
      if (res.success) {
        setUser({ ...user, plan: res.user.plan });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update plan.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const executeSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) return;
    setIsActionLoading(true);
    try {
      const res = await sendEmailAdminUserAction(id as string, emailSubject, emailMessage);
      setActionSuccessMsg(res.message || `Email sent to ${user.email}!`);
      setConfirmModal(null);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to send email.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const executeSuspendAccount = async () => {
    setIsActionLoading(true);
    try {
      const res = await toggleSuspendAdminUser(id as string);
      if (res.success) {
        setUser({ ...user, role: res.user.role });
        setActionSuccessMsg(`Account successfully ${res.user.role === "SUSPENDED" ? "suspended" : "reactivated"}!`);
        setConfirmModal(null);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to suspend account.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const executeBanUser = async () => {
    setIsActionLoading(true);
    try {
      const res = await banAdminUserAction(id as string);
      if (res.success) {
        setUser({ ...user, role: res.user.role });
        setActionSuccessMsg(`User successfully ${res.user.role === "BANNED" ? "banned" : "unbanned"}!`);
        setConfirmModal(null);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to ban user.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (!user) return <div className="text-white p-6">User not found.</div>;

  const roleColors: Record<string, string> = {
    super_admin: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    admin: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    moderator: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    USER: "text-slate-400 bg-slate-800 border-slate-700",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name || "Unnamed User"}</h2>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${roleColors[user.role] || roleColors.USER}`}>
                {user.role}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Plan</div>
                <div className="mt-1 font-medium text-slate-300">{user.plan}</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Pages Created</div>
                <div className="mt-1 font-medium text-slate-300">{user.events?.length ?? 0}</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Payments</div>
                <div className="mt-1 font-medium text-slate-300">{user.payments?.length ?? 0}</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Referrals</div>
                <div className="mt-1 font-medium text-amber-400">{user.referrals?.length ?? 0} Referred</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Wallet Balance</div>
                <div className="mt-1 font-medium text-emerald-400 font-bold">₹{((user.walletBalance ?? 0) / 100).toFixed(0)}</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Joined</div>
                <div className="mt-1 font-medium text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Memory Pages */}
          {user.events?.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FileHeart className="w-4 h-4 text-rose-400" /> Memory Pages</h3>
              <div className="space-y-2">
                {user.events.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between text-sm bg-[#0a0f1e] px-4 py-2.5 rounded-lg border border-slate-800">
                    <span className="font-mono text-indigo-400 text-xs">/p/{e.slug}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${e.status === "PUBLISHED" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>{e.status}</span>
                    <span className="text-slate-500 text-xs">{new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {user.payments?.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-400" /> Payments</h3>
              <div className="space-y-2">
                {user.payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-[#0a0f1e] px-4 py-2.5 rounded-lg border border-slate-800">
                    <span className="text-indigo-400 text-xs uppercase">{p.plan}</span>
                    <span className="text-emerald-400 font-bold">₹{(p.amount / 100).toFixed(2)}</span>
                    <span className={`text-xs ${p.status === "SUCCESS" ? "text-emerald-400" : "text-amber-400"}`}>{p.status}</span>
                    <span className="text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          {/* Plan Promotion / Demotion Card */}
          <div className="bg-[#111827] border border-amber-500/30 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">👑 Plan &amp; Promotion</h3>
            <p className="text-xs text-slate-400 mb-4">Current Database Plan: <span className="font-black text-amber-300 uppercase">{user.plan}</span></p>
            <button
              onClick={handlePlanToggle}
              disabled={isActionLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                user.plan === "PREMIUM"
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 shadow-md shadow-amber-500/20"
              }`}
            >
              {user.plan === "PREMIUM" ? "Demote to FREE User" : "Promote to PREMIUM 👑"}
            </button>
          </div>

          {currentUser?.role === "super_admin" && user.role !== "super_admin" && (
            <div className="bg-[#111827] border border-indigo-500/30 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-indigo-400 mb-3">Role Management</h3>
              <p className="text-xs text-slate-400 mb-3">Change this user&apos;s access role.</p>
              <select
                disabled={isActionLoading}
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition disabled:opacity-60"
              >
                <option value="USER">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setConfirmModal("email")}
                disabled={isActionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 disabled:opacity-60 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-sky-400" /> Send Email
              </button>
              <button
                onClick={() => setConfirmModal("suspend")}
                disabled={isActionLoading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition border disabled:opacity-60 cursor-pointer ${
                  user.role === "SUSPENDED"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> {user.role === "SUSPENDED" ? "Unsuspend Account" : "Suspend Account"}
              </button>
              <button
                onClick={() => setConfirmModal("ban")}
                disabled={isActionLoading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition border disabled:opacity-60 cursor-pointer ${
                  user.role === "BANNED"
                    ? "bg-rose-500 text-white border-rose-400 hover:bg-rose-600"
                    : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20"
                }`}
              >
                <Ban className="w-4 h-4" /> {user.role === "BANNED" ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>

          {/* Referrals & Referral Earnings Table (Under Quick Actions) */}
          <div className="bg-[#111827] border border-amber-500/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                <Gift className="w-4 h-4 text-amber-400 shrink-0" /> Referrals &amp; Earnings ({user.referrals?.length ?? 0})
              </h3>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                ₹{((user.walletBalance ?? 0) / 100).toFixed(0)}
              </span>
            </div>

            {user.referrals?.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {user.referrals.map((refUser: any) => {
                  const hasPaid = refUser.payments?.length > 0;
                  const matchingTxn = user.walletTxns?.find(
                    (t: any) => t.type === "REFERRAL_EARNED" && (t.description?.includes(refUser.email?.split("@")[0]) || t.referenceId === refUser.payments?.[0]?.id)
                  );
                  const earnedPaise = matchingTxn ? matchingTxn.amount : (hasPaid ? 50000 : 0);

                  return (
                    <div key={refUser.id} className="flex items-center justify-between text-xs bg-[#0a0f1e] px-3.5 py-2.5 rounded-lg border border-slate-800">
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="font-bold text-slate-200 truncate">{refUser.name || "User"}</div>
                        <div className="text-[11px] text-slate-400 truncate">{refUser.email}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${hasPaid ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border border-amber-500/20"}`}>
                          {hasPaid ? `+₹${(earnedPaise / 100).toFixed(0)}` : "Pending"}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{new Date(refUser.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 text-xs italic bg-[#0a0f1e] rounded-lg border border-slate-800">
                No referrals recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Custom Confirmation & Action Modals ── */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#111827] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center"
            >
              <button
                onClick={() => setConfirmModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {confirmModal === "suspend" && (
                <>
                  <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner">
                    <AlertTriangle className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {user.role === "SUSPENDED" ? "Unsuspend Account?" : "Suspend Account?"}
                  </h3>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-left text-xs text-amber-200 leading-relaxed space-y-1.5">
                    <p className="font-semibold text-amber-300">
                      Are you sure you want to {user.role === "SUSPENDED" ? "reactivate" : "suspend"} this account (<strong className="text-white underline">{user.email}</strong>)?
                    </p>
                    <p className="text-amber-400/90 font-medium">
                      {user.role === "SUSPENDED"
                        ? "This will restore user login access to the dashboard."
                        : "This user will not be able to log in or create proposals until unsuspended."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeSuspendAccount}
                      disabled={isActionLoading}
                      className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Suspend"}
                    </button>
                  </div>
                </>
              )}

              {confirmModal === "ban" && (
                <>
                  <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-inner">
                    <Ban className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {user.role === "BANNED" ? "Unban User?" : "Ban User?"}
                  </h3>

                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 text-left text-xs text-rose-200 leading-relaxed space-y-1.5">
                    <p className="font-semibold text-rose-300">
                      Are you sure you want to {user.role === "BANNED" ? "unban" : "ban"} this user (<strong className="text-white underline">{user.email}</strong>)?
                    </p>
                    <p className="text-rose-400/90 font-medium">
                      {user.role === "BANNED"
                        ? "This will remove the ban and allow login."
                        : "This will immediately revoke active sessions and permanently block access."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeBanUser}
                      disabled={isActionLoading}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Ban"}
                    </button>
                  </div>
                </>
              )}

              {confirmModal === "email" && (
                <>
                  <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-400 shadow-inner">
                    <Mail className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">Send Admin Email</h3>
                  <p className="text-xs text-slate-400 mb-4">To: <strong className="text-sky-300">{user.email}</strong></p>

                  <div className="space-y-3 text-left mb-6">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Subject</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Message Body</label>
                      <textarea
                        rows={4}
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeSendEmail}
                      disabled={isActionLoading || !emailSubject.trim() || !emailMessage.trim()}
                      className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Email"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
