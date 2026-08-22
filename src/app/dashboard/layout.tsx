import DashboardSidebar from "./DashboardSidebar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans antialiased">
      {/* Sidebar & Mobile Top Navigation */}
      <DashboardSidebar />
      
      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-20 md:pt-6">
        <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile FAB — Create New + */}
      <Link
        href="/dashboard/builder"
        className="md:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-sm rounded-full shadow-xl shadow-rose-500/40 hover:shadow-rose-500/60 hover:scale-105 transition-all active:scale-95"
      >
        <span className="text-lg leading-none">+</span>
        <span>Create</span>
      </Link>
    </div>
  );
}
