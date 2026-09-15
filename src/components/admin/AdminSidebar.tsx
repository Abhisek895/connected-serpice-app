"use client";

import { useState, useEffect } from "react";
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
  CreditCard,
  Tag,
  Ticket,
  Heart,
  Menu,
  X,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "./AdminAuthProvider";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") return null;

  const navItems = [
    { name: "Overview", href: "/admin/overview", icon: LayoutDashboard, roles: ["admin", "super_admin", "moderator"] },
    { name: "Users", href: "/admin/users", icon: Users, roles: ["admin", "super_admin"] },
    { name: "Pricing & Themes", href: "/admin/themes", icon: Tag, roles: ["admin", "super_admin"] },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket, roles: ["admin", "super_admin"] },
    { name: "Payments", href: "/admin/payments", icon: CreditCard, roles: ["admin", "super_admin"] },
    { name: "Reports", href: "/admin/reports", icon: Flag, roles: ["admin", "super_admin", "moderator"] },
    { name: "Content", href: "/admin/content", icon: ShieldAlert, roles: ["admin", "super_admin", "moderator"] },
    { name: "Cold Email", href: "/admin/cold-email", icon: Mail, roles: ["admin", "super_admin"] },
    { name: "AI Insights", href: "/admin/ai-insights", icon: BrainCircuit, roles: ["super_admin"] },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: ListOrdered, roles: ["super_admin"] },
    { name: "User Uploads", href: "/admin/uploads", icon: Database, roles: ["super_admin"] },
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

  const renderNavList = (isMobile = false) => (
    <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition text-sm ${
              isActive
                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold"
                : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              <span>{item.name}</span>
            </div>
            {isActive && <ChevronRight className="w-4 h-4 text-indigo-500/60" />}
          </Link>
        );
      })}
    </nav>
  );

  const renderUserInfo = () => {
    if (!user) return null;
    return (
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
        <div className="overflow-hidden min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className="text-sm font-bold text-slate-100 truncate">{user.username}</p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                roleColors[user.role] || "text-slate-400 border-slate-700"
              }`}
            >
              {roleIcons[user.role]} {user.role.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        </div>
      </div>
    );
  };

  const renderBottomActions = (isMobile = false) => (
    <div className="p-3 sm:p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
      <Link
        href="/dashboard"
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className="flex items-center justify-between px-3.5 py-2.5 w-full rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs tracking-wide shadow-md shadow-rose-900/40 border border-rose-400/40 transition group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-white fill-white group-hover:scale-110 transition-transform" />
          <span>User Portal</span>
        </div>
        <span className="text-sm">💖</span>
      </Link>

      <button
        onClick={() => {
          if (isMobile) setMobileMenuOpen(false);
          logout();
        }}
        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition font-medium text-sm cursor-pointer"
      >
        <LogOut className="w-4 h-4 text-slate-500" />
        Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* ── Mobile Top Header (Screens < 768px) ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-slate-800 px-3.5 flex items-center justify-between shadow-lg">
        <Link href="/admin/overview" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-100 tracking-wider">
            OurStory <span className="text-indigo-400 font-extrabold">Admin</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <span
              title={user.role}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border hidden xs:inline-flex items-center gap-1 ${
                roleColors[user.role] || "text-slate-400"
              }`}
            >
              {roleIcons[user.role]} {user.role.replace("_", " ")}
            </span>
          )}

          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center justify-center"
            title="User Portal"
          >
            <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Slide-out Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-xs z-50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0a0f1e] border-r border-slate-800 z-50 flex flex-col shadow-2xl text-slate-300"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <Link
                  href="/admin/overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-base font-bold text-indigo-400 tracking-wider">OurStory Admin</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderUserInfo()}
              {renderNavList(true)}
              {renderBottomActions(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sticky Sidebar (Screens >= 768px) ── */}
      <aside className="hidden md:flex md:w-64 bg-[#0a0f1e] border-r border-slate-800 flex-col h-screen sticky top-0 shrink-0 text-slate-300">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/overview" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500/40 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-100 tracking-wider">
              OurStory <span className="text-indigo-400 font-black">Admin</span>
            </h1>
          </Link>
        </div>

        {renderUserInfo()}
        {renderNavList(false)}
        {renderBottomActions(false)}
      </aside>
    </>
  );
}
