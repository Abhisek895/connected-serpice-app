"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, PlusCircle, Settings, LogOut, Bell, User, Menu, X, ChevronRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasUnread, setHasUnread] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mark notification read when visiting analytics or notifications
  useEffect(() => {
    if (pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/dashboard/notifications")) {
      setHasUnread(false);
    }
    // Close mobile drawer on route change
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: hasUnread },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if ((session?.user as any)?.role === "super_admin" || (session?.user as any)?.role === "admin") {
    navItems.push({ name: "Admin Panel", href: "/admin/overview", icon: ShieldAlert });
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. MOBILE TOP HEADER (Visible < md)                       */}
      {/* ========================================================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-rose-500 font-pacifico tracking-wider">OurStory</h1>
        </Link>

        <div className="flex items-center gap-2">
          {/* Notification Bell Icon for Mobile */}
          <Link
            href="/dashboard/notifications"
            onClick={() => setHasUnread(false)}
            className={`p-2 rounded-full relative transition ${
              hasUnread ? "bg-rose-50 text-rose-500 hover:bg-rose-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-rose-500" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MOBILE DRAWER OVERLAY & PANEL (< md)                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header inside Drawer */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="font-bold text-slate-900 text-base">Navigation</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info Pill */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-rose-50/40">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      session?.user?.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {session?.user?.name || "Member Account"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {session?.user?.email || "Signed In"}
                    </p>
                  </div>
                </div>

                {/* Drawer Links */}
                <nav className="p-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-medium text-sm transition ${
                          isActive
                            ? "bg-rose-50 text-rose-600 shadow-sm"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Sign Out Section in Drawer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition font-semibold text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 3. DESKTOP SIDEBAR (Visible >= md)                         */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex h-screen sticky top-0 shrink-0">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-rose-500 font-pacifico tracking-wider">OurStory</h1>
          </Link>

          {/* Notification Bell Icon */}
          <Link
            href="/dashboard/notifications"
            onClick={() => setHasUnread(false)}
            className={`p-2 rounded-full relative transition ${
              hasUnread ? "bg-rose-50 text-rose-500 hover:bg-rose-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
            title={hasUnread ? "New recipient activity available" : "Notifications"}
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            )}
          </Link>
        </div>

        {/* User Info Pill */}
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full rounded-full object-cover" />
            ) : (
              session?.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />
            )}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {session?.user?.name || "Member Account"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {session?.user?.email || "Signed In"}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition ${
                  isActive
                    ? "bg-rose-50 text-rose-600 shadow-sm shadow-rose-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
