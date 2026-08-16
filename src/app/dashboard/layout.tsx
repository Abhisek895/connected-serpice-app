import DashboardSidebar from "./DashboardSidebar";

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
    </div>
  );
}
