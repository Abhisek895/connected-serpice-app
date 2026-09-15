"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Music,
  Video,
  FileJson,
  Calendar,
  User,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for Lightbox
export const Lightbox = ({ url, onClose }: { url: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
        <X className="w-6 h-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Expanded View" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};

type UploadsViewerProps = {
  usersData: any[]; // Grouped user data from server
};

export default function UploadsViewer({ usersData }: UploadsViewerProps) {
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const toggleUser = (userId: string) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const toggleEvent = (eventId: string) => {
    setExpandedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  if (usersData.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
        No user uploads found yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {usersData.map((user) => {
        const isUserExpanded = !!expandedUsers[user.id];
        
        return (
          <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {/* User Header (Clickable) */}
            <div 
              onClick={() => toggleUser(user.id)}
              className="flex items-center justify-between p-4 sm:p-5 bg-slate-950/50 hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">{user.name || "Unknown User"}</h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {user.events.length} Template(s)
                </span>
                {isUserExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
              </div>
            </div>

            {/* Expanded User Templates */}
            <AnimatePresence>
              {isUserExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-slate-800"
                >
                  <div className="p-4 space-y-4 bg-slate-900/50">
                    {user.events.map((event: any) => {
                      const isEventExpanded = !!expandedEvents[event.id];

                      // Parse custom data
                      let customDataObj: any = {};
                      try {
                        customDataObj = JSON.parse(event.customData || "{}");
                      } catch (e) {}

                      // Aggregate ALL images, audio, video
                      const images: string[] = [];
                      const audios: string[] = [];
                      const videos: string[] = [];

                      // From DB Media relation
                      event.media.forEach((m: any) => {
                        if (m.type === "IMAGE" || m.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) images.push(m.url);
                        else if (m.type === "AUDIO" || m.url.match(/\.(mp3|wav|ogg)$/i)) audios.push(m.url);
                        else if (m.type === "VIDEO" || m.url.match(/\.(mp4|webm)$/i)) videos.push(m.url);
                      });

                      // From customData
                      if (customDataObj.photoUrl) images.push(customDataObj.photoUrl);
                      if (customDataObj.image1) images.push(customDataObj.image1);
                      if (customDataObj.image2) images.push(customDataObj.image2);
                      if (customDataObj.customAudio) audios.push(customDataObj.customAudio);
                      if (customDataObj.customVideo) videos.push(customDataObj.customVideo);
                      
                      // Also scan arrays
                      if (Array.isArray(customDataObj.images)) {
                        customDataObj.images.forEach((img: any) => {
                           if (typeof img === 'string') images.push(img);
                           else if (img.url) images.push(img.url);
                        });
                      }

                      // Deduplicate
                      const uniqueImages = Array.from(new Set(images));
                      const uniqueAudios = Array.from(new Set(audios));
                      const uniqueVideos = Array.from(new Set(videos));
                      const hasCustomData = Object.keys(customDataObj).length > 0;

                      return (
                        <div key={event.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
                          {/* Template Header (Clickable) */}
                          <div 
                            onClick={() => toggleEvent(event.id)}
                            className="flex items-center justify-between p-3 hover:bg-slate-800/80 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <LayoutTemplate className="w-4 h-4 text-rose-400" />
                              <span className="font-semibold text-slate-200 text-sm">{event.theme?.title || event.theme?.name}</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(event.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Summary Badges */}
                              <div className="hidden sm:flex gap-2">
                                {uniqueImages.length > 0 && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{uniqueImages.length} Img</span>}
                                {uniqueAudios.length > 0 && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">{uniqueAudios.length} Audio</span>}
                                {uniqueVideos.length > 0 && <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">{uniqueVideos.length} Video</span>}
                              </div>
                              {isEventExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                            </div>
                          </div>

                          {/* Expanded Template Media */}
                          <AnimatePresence>
                            {isEventExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-slate-800 bg-slate-900"
                              >
                                <div className="p-4 space-y-5">
                                  
                                  {/* Photos Section */}
                                  {uniqueImages.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-blue-400" /> Photos
                                      </h4>
                                      <div className="flex flex-wrap gap-3">
                                        {uniqueImages.map((url, idx) => (
                                          <div 
                                            key={idx} 
                                            onClick={() => setLightboxUrl(url)}
                                            className="group relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 cursor-pointer transition shadow-lg"
                                          >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="Upload" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                               <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Audio Section */}
                                  {uniqueAudios.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Music className="w-4 h-4 text-purple-400" /> Audio
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {uniqueAudios.map((url, idx) => (
                                          <div key={idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                                            <audio controls className="w-full h-10 outline-none rounded-lg" src={url} />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Video Section */}
                                  {uniqueVideos.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Video className="w-4 h-4 text-rose-400" /> Video
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {uniqueVideos.map((url, idx) => (
                                          <div key={idx} className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                                            <video controls className="w-full h-40 object-cover bg-black" src={url} />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Raw Data Section */}
                                  {hasCustomData && (
                                    <div className="pt-2">
                                      <details className="group">
                                        <summary className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 flex items-center gap-2 list-none">
                                          <FileJson className="w-3.5 h-3.5" /> 
                                          View Raw JSON Data
                                        </summary>
                                        <div className="mt-3 p-3 bg-[#050810] rounded-xl border border-slate-800/80 overflow-x-auto">
                                          <pre className="text-[10px] text-slate-400 font-mono">
                                            {JSON.stringify(customDataObj, null, 2)}
                                          </pre>
                                        </div>
                                      </details>
                                    </div>
                                  )}

                                  {uniqueImages.length === 0 && uniqueAudios.length === 0 && uniqueVideos.length === 0 && !hasCustomData && (
                                    <div className="text-sm text-slate-500 italic p-2">No media or custom data found for this template.</div>
                                  )}

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
