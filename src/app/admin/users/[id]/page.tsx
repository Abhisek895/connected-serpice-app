"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, ShieldAlert, Mail, Activity, Ban, ShieldCheck, Loader2 } from "lucide-react";
import { adminFetch } from "@/components/admin/api";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAdminAuth();
  
  const [user, setUser] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, insightData] = await Promise.all([
          adminFetch(`users/${id}/detail`),
          adminFetch(`users/${id}/ai-insight`).catch(() => null)
        ]);
        setUser(userData);
        setInsight(insightData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleBanToggle = async () => {
    setIsActionLoading(true);
    try {
      const action = user.isBanned ? "unban" : "ban";
      await adminFetch(`users/${id}/${action}`, {
        method: "PUT",
        body: JSON.stringify({ reason: `Admin ${action} via dashboard` })
      });
      setUser({ ...user, isBanned: !user.isBanned });
    } catch (err) {
      alert("Action failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setIsActionLoading(true);
    try {
      await adminFetch(`users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      setUser({ ...user, role: newRole });
      alert(`Role successfully changed to ${newRole}`);
    } catch (err: any) {
      alert("Failed to change role. You might not have permission.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return <div className="text-white">User not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.username || "Unknown"}</h2>
                  <p className="text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isBanned ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {user.isBanned ? "BANNED" : "ACTIVE"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Role</div>
                <div className="mt-1 font-medium text-slate-300">{user.role}</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Trust Score</div>
                <div className="mt-1 font-medium text-slate-300">{user.trustScore}</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Joined</div>
                <div className="mt-1 font-medium text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Reports (Target)</div>
                <div className="mt-1 font-medium text-slate-300">{user.reports2?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          {insight && (
            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" /> AI Safety Profile
              </h3>
              <div className="flex gap-3 items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  insight.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                  insight.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {insight.riskLevel} RISK
                </span>
                {insight.anomalyDetected && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">Anomaly Detected</span>
                )}
              </div>
              <div className="text-sm text-slate-300 bg-[#0a0f1e] p-4 rounded-lg border border-slate-800 whitespace-pre-wrap">
                {insight.behaviorSummary}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {currentUser?.role === 'super_admin' && user.role !== 'super_admin' && (
            <div className="bg-[#111827] border border-indigo-500/30 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-indigo-400 mb-4">Role Management</h3>
              <p className="text-xs text-slate-400 mb-3">As super_admin, you can assign roles to this user.</p>
              <select
                disabled={isActionLoading}
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={handleBanToggle}
                disabled={isActionLoading || user.role === 'super_admin'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition border ${
                  user.isBanned 
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Ban className="w-4 h-4" />
                {user.isBanned ? "Unban User" : "Ban User"}
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-slate-700">
                <ShieldCheck className="w-4 h-4" />
                Suspend Account
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-slate-700">
                <Mail className="w-4 h-4" />
                Send Email Warning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrainCircuit(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.224 4.668ab4.3 4.3 0 0 0-.204 2.103 4.002 4.002 0 0 0 3.143 3.143 4.18 4.18 0 0 0 2.102-.204 4 4 0 0 0 4.668-5.224A3 3 0 0 0 12 5Z" />
      <path d="M8.5 2v1.5" />
      <path d="M2.5 8h1.5" />
      <path d="M12 12.5a4 4 0 0 0 4-4" />
      <path d="M16 8.5h4" />
      <path d="M16 12.5v4" />
    </svg>
  );
}
