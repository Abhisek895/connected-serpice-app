"use client";

import { useState } from "react";
import { FolderGit2, Cloud, ImageIcon, Music, Video } from "lucide-react";
import UploadsViewer, { Lightbox } from "./UploadsViewer";
import { AnimatePresence, motion } from "framer-motion";

type UploadsTabsProps = {
  usersData: any[];
  blobs: any[];
};

export default function UploadsTabs({ usersData, blobs }: UploadsTabsProps) {
  const [activeTab, setActiveTab] = useState<"grouped" | "gallery">("grouped");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Group blobs by type
  const images = blobs.filter(b => b.pathname.match(/\.(jpeg|jpg|gif|png|webp)$/i) || b.contentType?.startsWith('image/'));
  const audio = blobs.filter(b => b.pathname.match(/\.(mp3|wav|ogg)$/i) || b.contentType?.startsWith('audio/'));
  const video = blobs.filter(b => b.pathname.match(/\.(mp4|webm)$/i) || b.contentType?.startsWith('video/'));
  // Others (json, pdf, etc.)
  const others = blobs.filter(b => !images.includes(b) && !audio.includes(b) && !video.includes(b));

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex p-1 space-x-1 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("grouped")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "grouped"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          User Templates
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "gallery"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Cloud className="w-4 h-4" />
          Cloud Storage Gallery
        </button>
      </div>

      {/* Lightbox for Gallery */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "grouped" ? (
          <UploadsViewer usersData={usersData} />
        ) : (
          <div className="space-y-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Cloud className="w-5 h-5 text-emerald-400" />
                   Raw Blob Explorer
                 </h2>
                 <p className="text-sm text-slate-400 mt-1">
                   Showing all {blobs.length} raw files physically stored in your Vercel cloud bucket.
                 </p>
               </div>
            </div>

            {/* Photos Grid */}
            {images.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <ImageIcon className="w-4 h-4 text-blue-400" /> All Cloud Photos ({images.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {images.map((blob) => (
                    <div 
                      key={blob.url} 
                      onClick={() => setLightboxUrl(blob.url)}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 cursor-pointer bg-slate-950 transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={blob.url} alt={blob.pathname} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Grid */}
            {audio.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Music className="w-4 h-4 text-purple-400" /> All Cloud Audio ({audio.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {audio.map((blob) => (
                    <div key={blob.url} className="bg-slate-950 p-3 rounded-xl border border-slate-700">
                      <p className="text-xs text-slate-400 truncate mb-2" title={blob.pathname}>{blob.pathname}</p>
                      <audio controls className="w-full h-10 outline-none rounded-lg" src={blob.url} preload="metadata" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Grid */}
            {video.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Video className="w-4 h-4 text-rose-400" /> All Cloud Video ({video.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {video.map((blob) => (
                    <div key={blob.url} className="bg-slate-950 p-3 rounded-xl border border-slate-700 overflow-hidden flex flex-col justify-between">
                       <p className="text-xs text-slate-400 truncate mb-2" title={blob.pathname}>{blob.pathname}</p>
                      <video controls className="w-full aspect-video object-cover bg-black rounded" src={blob.url} preload="metadata" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Files */}
            {others.length > 0 && (
               <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="font-bold text-slate-300 uppercase text-xs tracking-widest">
                    Other Files ({others.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {others.map((blob) => (
                       <a key={blob.url} href={blob.url} target="_blank" className="text-xs text-slate-400 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg hover:text-indigo-400 transition truncate max-w-[200px]">
                         {blob.pathname}
                       </a>
                    ))}
                  </div>
               </div>
            )}

            {blobs.length === 0 && (
              <div className="text-center p-8 text-slate-500 italic">
                No raw files found in Vercel Cloud Storage.
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
