"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, ShieldAlert, Mail, Ban, ShieldCheck, Loader2, FileHeart, CreditCard } from "lucide-react";
import { getAdminUserById, updateAdminUserRole } from "@/app/admin/actions";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAdminAuth();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAdminUserById(id as string)
      .then(setUser)
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

        {/* Actions */}
        <div className="space-y-4">
          {currentUser?.role === "super_admin" && user.role !== "super_admin" && (
            <div className="bg-[#111827] border border-indigo-500/30 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-indigo-400 mb-3">Role Management</h3>
              <p className="text-xs text-slate-400 mb-3">Change this user's access role.</p>
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

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-slate-700">
                <Mail className="w-4 h-4" /> Send Email
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-slate-700">
                <ShieldCheck className="w-4 h-4" /> Suspend Account
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition border border-rose-500/20">
                <Ban className="w-4 h-4" /> Ban User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
