import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Database,
  Image as ImageIcon,
  Music,
  Video,
  FileJson,
  Calendar,
  User,
  LayoutTemplate
} from "lucide-react";

export const metadata = {
  title: "User Uploads | OurStory Admin",
};

export default async function AdminUploadsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "super_admin") {
    redirect("/admin/overview");
  }

  // Fetch all events (templates configured by users) with their associated media
  const events = await prisma.event.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      theme: {
        select: {
          name: true,
          title: true,
        },
      },
      media: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            User Uploads Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track user-uploaded media (photos, audio, videos) and custom data across all templates.
          </p>
        </div>
      </div>

      {/* Uploads List */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
            No user uploads found yet.
          </div>
        ) : (
          events.map((event) => {
            const hasCustomData = !!event.customData && event.customData !== "{}";
            
            // Analyze media types
            const images = event.media.filter(m => m.type === "IMAGE" || m.url.match(/\.(jpeg|jpg|gif|png)$/i));
            const audio = event.media.filter(m => m.type === "AUDIO" || m.url.match(/\.(mp3|wav|ogg)$/i));
            const video = event.media.filter(m => m.type === "VIDEO" || m.url.match(/\.(mp4|webm)$/i));
            
            // Check if custom data contains media (fallback if not in media table)
            let customDataObj: any = {};
            try {
               customDataObj = JSON.parse(event.customData || "{}");
            } catch (e) {}

            return (
              <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Meta Info */}
                  <div className="lg:w-1/3 space-y-3 border-r border-slate-800/50 pr-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-white truncate">{event.user?.name || "Unknown User"}</span>
                      <span className="text-xs text-slate-500 truncate">({event.user?.email})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <LayoutTemplate className="w-4 h-4 text-slate-500" />
                      Theme: <span className="text-rose-400 font-medium">{event.theme?.title || event.theme?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      Created: {new Date(event.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold border ${
                        event.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Right: Uploaded Content Details */}
                  <div className="lg:w-2/3 space-y-4">
                    {/* Media Badges */}
                    <div className="flex flex-wrap gap-3">
                      {images.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                          <ImageIcon className="w-4 h-4" /> {images.length} Image(s)
                        </div>
                      )}
                      {audio.length > 0 && (
                        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                          <Music className="w-4 h-4" /> {audio.length} Audio File(s)
                        </div>
                      )}
                      {video.length > 0 && (
                        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                          <Video className="w-4 h-4" /> {video.length} Video(s)
                        </div>
                      )}
                      {hasCustomData && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                          <FileJson className="w-4 h-4" /> Custom Data Saved
                        </div>
                      )}
                      {images.length === 0 && audio.length === 0 && video.length === 0 && !hasCustomData && (
                         <span className="text-sm text-slate-500 italic">No media or custom data uploaded yet.</span>
                      )}
                    </div>

                    {/* Previews */}
                    <div className="space-y-3">
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {images.map(img => (
                            <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt="User Upload" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Display some key custom data fields if present (like customAudio, customVideo from json) */}
                      {hasCustomData && (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-xs text-slate-400 font-mono mb-2">Custom Data Preview:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                            {customDataObj.customAudio && (
                              <div className="flex items-center gap-2 truncate">
                                <Music className="w-3.5 h-3.5 text-purple-400" />
                                <a href={customDataObj.customAudio} target="_blank" className="hover:text-indigo-400 underline truncate">Custom Audio Link</a>
                              </div>
                            )}
                            {customDataObj.customVideo && (
                              <div className="flex items-center gap-2 truncate">
                                <Video className="w-3.5 h-3.5 text-rose-400" />
                                <a href={customDataObj.customVideo} target="_blank" className="hover:text-indigo-400 underline truncate">Custom Video Link</a>
                              </div>
                            )}
                            {customDataObj.images && Array.isArray(customDataObj.images) && customDataObj.images.length > 0 && (
                               <div className="text-xs text-slate-400 col-span-full">
                                 + {customDataObj.images.length} images embedded in JSON.
                               </div>
                            )}
                          </div>
                          <details className="mt-2">
                            <summary className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">View Raw JSON</summary>
                            <pre className="mt-2 text-[10px] text-slate-400 overflow-x-auto p-2 bg-[#050810] rounded border border-slate-800 max-h-40">
                              {JSON.stringify(customDataObj, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
