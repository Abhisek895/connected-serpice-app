"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Settings, LogOut, Bell, User, Menu, X, ChevronRight, ShieldAlert, Gift, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasUnread, setHasUnread] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/dashboard/notifications")) {
      setHasUnread(false);
    }
    setMobileMenuOpen(false);
  }, [pathname]);

  const plan = (session?.user as any)?.plan || "FREE";
  const role = (session?.user as any)?.role;
  const isAdmin = role === "super_admin" || role === "admin";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: hasUnread },
    { name: "Earn & Referrals 💰", href: "/dashboard/referral", icon: Gift },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ] as { name: string; href: string; icon: any; badge?: boolean }[];

  const planConfig: Record<string, { label: string; color: string }> = {
    FREE:     { label: "Free",         color: "bg-slate-700/60 text-slate-400 border-slate-600/40" },
    PREMIUM:  { label: "✨ Premium",   color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    LIFETIME: { label: "💎 Lifetime",  color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  };
  const planBadge = planConfig[plan] ?? planConfig.FREE;

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "bg-white" : "bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/40"}`}>

      {/* ── Logo ── */}
      <div className={`p-5 border-b ${mobile ? "border-slate-100" : "border-slate-800/60"} flex items-center justify-between`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:shadow-rose-500/50 transition-all">
            <Sparkles className="w-4 h-4 text-white fill-white" />
          </div>
          <h1 className={`text-xl font-bold font-pacifico tracking-wider ${mobile ? "text-rose-500" : "text-white"}`}>
            OurStory
          </h1>
        </Link>
        {/* Bell */}
        <Link
          href="/dashboard/notifications"
          onClick={() => setHasUnread(false)}
          className={`p-2 rounded-full relative transition ${
            hasUnread
              ? mobile ? "bg-rose-50 text-rose-500" : "bg-rose-500/15 text-rose-400"
              : mobile ? "bg-slate-50 text-slate-400 hover:bg-slate-100" : "bg-slate-800/50 text-slate-500 hover:bg-slate-700/60 hover:text-slate-300"
          }`}
        >
          <Bell className="w-4 h-4" />
          {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />}
        </Link>
      </div>

      {/* ── User Info ── */}
      {session?.user && (
        <div className={`px-4 py-3 border-b ${mobile ? "border-slate-100 bg-rose-50/30" : "border-slate-800/40 bg-slate-900/30"} flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ring-2 ${mobile ? "bg-rose-100 text-rose-600 ring-rose-200" : "bg-rose-500/20 text-rose-300 ring-rose-500/30"}`}>
            {session.user.image
              ? <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full rounded-full object-cover" />
              : (session.user.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />)
            }
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <p className={`text-xs font-bold truncate ${mobile ? "text-slate-900" : "text-slate-100"}`}>
                {session.user.name || "Member"}
              </p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${planBadge.color}`}>
                {planBadge.label}
              </span>
            </div>
            <p className={`text-[10px] truncate ${mobile ? "text-slate-400" : "text-slate-500"}`}>
              {session.user.email}
            </p>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          const isReferral = item.href === "/dashboard/referral";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? mobile
                    ? "bg-rose-50 text-rose-600"
                    : "bg-rose-500/15 text-rose-300 shadow-sm shadow-rose-900/20"
                  : isReferral && !isActive
                    ? mobile
                      ? "text-amber-600 hover:bg-amber-50"
                      : "text-amber-400/90 hover:bg-amber-500/10 hover:text-amber-300"
                    : mobile
                      ? "text-slate-700 hover:bg-slate-50"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? (mobile ? "text-rose-500" : "text-rose-400") : isReferral && !isActive ? (mobile ? "text-amber-500" : "text-amber-400") : ""}`} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && <span className="w-2 h-2 bg-rose-500 rounded-full" />}
                {isActive && <ChevronRight className={`w-3.5 h-3.5 ${mobile ? "text-rose-400" : "text-rose-500/50"}`} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Admin Panel & Sign Out ── */}
      <div className={`p-3 border-t ${mobile ? "border-slate-100" : "border-slate-800/60"} space-y-2`}>
        {isAdmin && (
          <Link
            href="/admin/overview"
            className="flex items-center justify-between px-3.5 py-2.5 w-full rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs tracking-wide shadow-md shadow-rose-900/40 border border-rose-400/40 transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-white fill-white group-hover:rotate-12 transition-transform" />
              <span>Admin Panel</span>
            </div>
            <span className="text-sm">🛡️</span>
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all ${
            mobile
              ? "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
              : "text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
          }`}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-400/40">
            <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-bold text-rose-500 font-pacifico tracking-wider">OurStory</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/notifications"
            onClick={() => setHasUnread(false)}
            className={`p-2 rounded-full relative transition ${hasUnread ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"}`}
          >
            <Bell className="w-5 h-5" />
            {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition">
            {mobileMenuOpen ? <X className="w-6 h-6 text-rose-500" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-4/5 max-w-sm z-50 shadow-2xl overflow-y-auto"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside className="w-64 hidden md:flex h-screen sticky top-0 shrink-0 flex-col border-r border-slate-800/60 shadow-2xl shadow-slate-950/20">
        <SidebarContent />
      </aside>
    </>
  );
}
