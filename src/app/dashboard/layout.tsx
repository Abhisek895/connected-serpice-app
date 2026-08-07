import Link from "next/link";
import { LayoutDashboard, PlusCircle, Settings, LogOut, BarChart3 } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
