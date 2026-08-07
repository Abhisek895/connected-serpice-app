import Link from "next/link";
import { Plus, Eye, Heart, CalendarClock, MoreVertical } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Events</h1>
          <p className="text-slate-500 mt-1">Manage and track your digital memories.</p>
        </div>
        <Link href="/builder" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition shadow-md shadow-slate-200">
          <Plus className="w-5 h-5" />
          Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Event Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              Proposal
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">Proposal for Priya</h3>
          
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Active (Expires in 10 days)
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm"><Eye className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Views</p>
                <p className="text-lg font-bold text-slate-900">145</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl text-rose-500 shadow-sm"><Heart className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">YES!</p>
                <p className="text-lg font-bold text-slate-900">1</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
              Edit
            </button>
            <button className="flex-1 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-100 transition">
              Share Link
            </button>
          </div>
        </div>
        
        {/* Empty State / Create New Card */}
        <Link href="/builder" className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition min-h-[300px]">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Create New Event</h3>
          <p className="text-sm text-center mt-2 max-w-[200px]">Start building your next digital memory page.</p>
        </Link>
      </div>
    </div>
  );
}
