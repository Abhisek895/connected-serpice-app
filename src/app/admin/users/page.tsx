"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, ShieldAlert } from "lucide-react";
import { getAdminUsers } from "@/app/admin/actions";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

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

  const roleColors: Record<string, string> = {
    super_admin: "text-purple-400 bg-purple-400/10 border border-purple-400/20",
    admin: "text-blue-400 bg-blue-400/10 border border-blue-400/20",
    moderator: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
    USER: "text-slate-400 bg-slate-800/50 border border-slate-700",
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
          <p className="text-slate-400 text-sm mt-1">All registered OurStory users from the local database.</p>
        </div>
      </div>

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
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{u.name || "—"}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || roleColors.USER}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded">{u.plan}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
