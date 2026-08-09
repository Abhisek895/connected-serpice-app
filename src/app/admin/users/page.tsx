"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ShieldAlert } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/components/admin/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  async function loadUsers(searchQuery = search) {
    setIsLoading(true);
    try {
      let url = `users?limit=50&offset=0`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (roleFilter) url += `&role=${encodeURIComponent(roleFilter)}`;

      const data = await adminFetch(url);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const roleColors: Record<string, string> = {
    super_admin: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    admin: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    moderator: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    user: "text-slate-400 bg-slate-800/50 border-slate-700",
  };

  const columns = [
    {
      key: "username",
      header: "User",
      render: (u: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-200">{u.username || "Unknown"}</span>
          <span className="text-xs text-slate-500">{u.email}</span>
        </div>
      )
    },
    {
      key: "role",
      header: "Role",
      render: (u: any) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[u.role] || roleColors.user}`}>
          {u.role}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (u: any) => {
        if (u.isBanned) return <span className="text-rose-400 text-xs font-medium bg-rose-500/10 px-2 py-1 rounded">Banned</span>;
        if (u.isSuspended) return <span className="text-amber-400 text-xs font-medium bg-amber-500/10 px-2 py-1 rounded">Suspended</span>;
        return <span className="text-emerald-400 text-xs font-medium">Active</span>;
      }
    },
    {
      key: "trustScore",
      header: "Trust Score",
      render: (u: any) => {
        const score = u.trustScore || 100;
        let color = "text-emerald-400";
        if (score < 50) color = "text-rose-400";
        else if (score < 80) color = "text-amber-400";
        return <span className={`font-bold ${color}`}>{score}</span>;
      }
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u: any) => <span className="text-slate-400 text-sm">{new Date(u.createdAt).toLocaleDateString()}</span>
    }
  ];

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
          <p className="text-slate-400 text-sm mt-1">Manage accounts, roles, and safety actions.</p>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full max-w-md relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        isLoading={isLoading} 
        onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
      />
    </div>
  );
}
