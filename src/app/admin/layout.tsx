import AdminAuthProvider from "@/components/admin/AdminAuthProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "VibePass Admin",
  description: "Admin & CEO Dashboard for VibePass",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0f1e] font-sans antialiased text-slate-300 selection:bg-indigo-500/30">
        <AdminSidebar />
        
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
