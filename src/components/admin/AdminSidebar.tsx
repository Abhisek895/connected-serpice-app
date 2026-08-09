"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Flag,
  ShieldAlert,
  BrainCircuit,
  ListOrdered,
  Mail,
  Activity,
  LogOut,
  ChevronRight,
  CreditCard
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthProvider";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  if (pathname === "/admin/login") return null;

  const navItems = [
    { name: "Overview", href: "/admin/overview", icon: LayoutDashboard, roles: ["admin", "super_admin", "moderator"] },
    { name: "Users", href: "/admin/users", icon: Users, roles: ["admin", "super_admin"] },
    { name: "Payments", href: "/admin/payments", icon: CreditCard, roles: ["admin", "super_admin"] },
    { name: "Reports", href: "/admin/reports", icon: Flag, roles: ["admin", "super_admin", "moderator"] },
    { name: "Content", href: "/admin/content", icon: ShieldAlert, roles: ["admin", "super_admin", "moderator"] },
    { name: "AI Insights", href: "/admin/ai-insights", icon: BrainCircuit, roles: ["super_admin"] },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: ListOrdered, roles: ["super_admin"] },
    { name: "Email Tools", href: "/admin/email", icon: Mail, roles: ["super_admin"] },
    { name: "System Health", href: "/admin/system", icon: Activity, roles: ["super_admin"] },
  ];

  const visibleNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  const roleColors: Record<string, string> = {
    super_admin: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    admin: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    moderator: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };

  const roleIcons: Record<string, string> = {
    super_admin: "👑",
    admin: "🛡️",
    moderator: "✅",
  };

  return (
    <aside className="w-64 bg-[#0a0f1e] border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 text-slate-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin/overview">
          <h1 className="text-xl font-bold text-indigo-500 tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            VibePass Admin
          </h1>
        </Link>
      </div>

      {user && (
        <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center gap-3">
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-100 truncate flex items-center gap-2">
              {user.username}
              <span title={user.role} className="text-lg">{roleIcons[user.role]}</span>
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition text-sm ${isActive
                ? "bg-indigo-500/10 text-indigo-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-indigo-500/50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition font-medium text-sm"
        >
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-rose-400" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
