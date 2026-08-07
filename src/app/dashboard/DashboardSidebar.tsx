"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, PlusCircle, Settings, LogOut, BarChart3, Bell, User } from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasUnread, setHasUnread] = useState(true);

  // When user visits Analytics, mark notifications as seen
  useEffect(() => {
    if (pathname.startsWith("/dashboard/analytics")) {
      setHasUnread(false);
    }
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create Event", href: "/dashboard/builder", icon: PlusCircle },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, badge: hasUnread ? "NEW" : null },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-bold text-rose-500 font-pacifico tracking-wider">OurStory</h1>
        </Link>
        
        {/* Notification Bell Icon */}
        <Link 
          href="/dashboard/analytics"
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
        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {session?.user?.image ? (
            <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full rounded-full object-cover" />
          ) : (
            session?.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />
          )}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-slate-900 truncate">
            {session?.user?.name || "Member Account"}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {session?.user?.email || "Signed In"}
          </p>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => {
                if (item.href === "/dashboard/analytics") {
                  setHasUnread(false);
                }
              }}
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
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
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
  );
}
