"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Heart, HeartOff, Clock, Smartphone, Globe, ExternalLink, Calendar, ChevronDown, ChevronUp, Bell, MousePointer2 } from "lucide-react";
import Link from "next/link";
import { demos } from "../../demoConfig";

type ResponseItem = {
  id: string;
  action: string;
  device?: string | null;
  browser?: string | null;
  createdAt: string | Date;
};

type AnalyticsClientProps = {
  event: any;
  customData: any;
};

export default function AnalyticsClient({ event, customData }: AnalyticsClientProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const responses: ResponseItem[] = event.responses || [];

  const views = responses.filter(r => r.action === "VIEWED").length;
  const accepts = responses.filter(r => r.action === "ACCEPTED").length;
  const rejects = responses.filter(r => r.action === "REJECTED").length;

  const demoId = customData.demoId || "ankita-surprise";
  const demo = demos.find(d => d.id === demoId) || demos[0];
  const Icon = demo.icon;
  const title = customData.title || `Proposal for ${event.theme.name}`;

  // Group responses into sessions
  type SessionData = {
    id: string;
    startTime: Date;
    viewedAction?: ResponseItem;
    actions: ResponseItem[];
    acceptsCount: number;
    rejectsCount: number;
  };

  const sessions: SessionData[] = [];
  let currentSession: SessionData | null = null;

  const sortedResponses = [...responses].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sortedResponses.forEach((res) => {
    if (res.action === "VIEWED") {
      if (currentSession && currentSession.actions.length === 0 && (new Date(res.createdAt).getTime() - currentSession.startTime.getTime()) < 5000) {
        return;
      }
      if (currentSession) sessions.unshift(currentSession);
      currentSession = { id: res.id, startTime: new Date(res.createdAt), viewedAction: res, actions: [], acceptsCount: 0, rejectsCount: 0 };
    } else {
      if (!currentSession) {
        currentSession = { id: res.id, startTime: new Date(res.createdAt), actions: [], acceptsCount: 0, rejectsCount: 0 };
      }
      currentSession.actions.push(res);
      if (res.action === "ACCEPTED") currentSession.acceptsCount++;
      if (res.action === "REJECTED") currentSession.rejectsCount++;
    }
  });
  if (currentSession) sessions.unshift(currentSession);

  const toggleSession = (id: string) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-8">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-3">
            <span className={`${demo.badgeColor} px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm`}>
              <Icon className="w-3.5 h-3.5" /> {demo.title.replace(/ 💖| 🎂| ❤️| 🌸| 🌿/g, '')}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {event.status === 'PUBLISHED' ? 'Active' : 'Disabled'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4" /> Published on {new Date(event.createdAt).toLocaleDateString()} &bull;
            <a href={`/p/${event.slug}`} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline flex items-center gap-1 font-medium">
              /p/{event.slug} <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center shadow-sm max-w-sm w-full">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl w-fit mx-auto mb-3">
              <Eye className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Total Views</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{views}</p>
          </div>
        </div>
      </div>

      {/* Response Feed / Answers History */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6 px-2">
          <Clock className="w-5 h-5 text-rose-500" /> Recipient Visit Log
        </h2>

        {responses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-dashed border-slate-200">
            No responses recorded yet for this event link. Share your link to start receiving answers!
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4 pl-4">Time & Device</div>
              <div className="col-span-4 text-center">Summary</div>
              <div className="col-span-4 text-right pr-4">Action</div>
            </div>

            <div className="divide-y divide-slate-100">
              {sessions.filter(s => s.actions.length > 0).length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm bg-white">
                  No interactions recorded yet. The link has been viewed, but no buttons were clicked.
                </div>
              ) : (
                sessions.filter(s => s.actions.length > 0).map((session) => {
                  const isExpanded = expandedSessionId === session.id;
                  const hasActions = session.actions.length > 0;

                  return (
                    <div key={session.id} className={`transition-colors ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                      {/* Table Row */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">

                        {/* Column 1: Time & Device */}
                        <div className="col-span-1 md:col-span-4 flex items-center gap-3 pl-2 md:pl-4">
                          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                            {session.viewedAction?.device?.toLowerCase().includes("mobile") ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">
                              {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {session.startTime.toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Column 2: Summary */}
                        <div className="col-span-1 md:col-span-4 flex justify-start md:justify-center">
                          {hasActions ? (
                            <div className="flex items-center gap-2">
                              {session.acceptsCount > 0 && (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm border border-green-200">
                                  {session.acceptsCount} <Heart className="w-3 h-3 fill-green-600" />
                                </span>
                              )}
                              {session.rejectsCount > 0 && (
                                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm border border-rose-200">
                                  {session.rejectsCount} <HeartOff className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium border border-slate-200">
                              Viewed only
                            </span>
                          )}
                        </div>

                        {/* Column 3: Action Button */}
                        <div className="col-span-1 md:col-span-4 flex justify-end pr-2 md:pr-4 mt-2 md:mt-0">
                          {hasActions && (
                            <button
                              onClick={() => toggleSession(session.id)}
                              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm ${isExpanded
                                  ? "bg-slate-800 text-white hover:bg-slate-700"
                                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                              {isExpanded ? (
                                <>Close Details <ChevronUp className="w-3.5 h-3.5" /></>
                              ) : (
                                <>View Actions <MousePointer2 className="w-3.5 h-3.5" /></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details Area */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-100/50 inset-shadow-sm">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-2">
                                Chronological Action Log
                              </h4>

                              {hasActions ? (
                                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                  {session.actions.map((res, index) => {
                                    const [baseAction, metaStr] = res.action.split('|');
                                    const isAccepted = baseAction === "ACCEPTED";
                                    const timeStr = new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                                    let metaObj: any = null;
                                    if (metaStr) {
                                      try { metaObj = JSON.parse(metaStr); } catch (e) {}
                                    }

                                    // Calculate the exact question they saw when they clicked this button
                                    let questionText = customData.question || "Will you be mine? 💖";

                                    if (demoId === "nasamajh-lakri") {
                                      const secondChanceMessages = [
                                        "piliiiiiizzzzzzzzzzzzzzzzzzzzz? 💔",
                                        "Think again, piliiiiiizzzzzzzzzzzzzzzzzzzzzzz? 🌻",
                                        "I really like you 🥺",
                                        "Give me a chance to make you smile 💫",
                                        "I promise to bring you chocolates 🍫",
                                        "Let's create memories together 📸",
                                        "I will make you laugh every day 😂",
                                        "You deserve all the love 🌹",
                                        "I won't give up easily 😌",
                                        "piliiiiiizzzzzzzzzzzzzzzzzzzzzzz say yes this time 💖",
                                        "Nasamajh larki 😌🌸",
                                        "Your smile means everything 💛",
                                        "Say yes and make my day brighter ☀️",
                                        "You and I, best team ever? 👫",
                                        "I will bring coffee and care 🫶",
                                        "Your yes will be the best gift 🎁",
                                        "Your yes will make me the happiest 🌈",
                                        "One yes, and I'll bring you ice cream 🍦",
                                        "I promise to always support you 🤝",
                                        "Say yes, let's start our story together 📖",
                                        "Waiting for you, like coffee waits for morning ☕💕"
                                      ];

                                      // The index of this action in the actions array tells us how many times they answered before
                                      // For example, if index is 0, they saw the initial question.
                                      // If index is 1, they saw secondChanceMessages[0]
                                      if (index > 0) {
                                        const msgIndex = (index - 1) % secondChanceMessages.length;
                                        questionText = secondChanceMessages[msgIndex];
                                      }
                                    }

                                    return (
                                      <div key={res.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        {/* Timeline dot */}
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-50 bg-white absolute left-6 -translate-x-1/2 md:left-1/2 shadow-sm z-10">
                                          <div className={`w-2 h-2 rounded-full ${isAccepted ? 'bg-green-500' : 'bg-rose-500'}`} />
                                        </div>

                                        {/* Card */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] ml-12 md:ml-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                              <div className={`p-2.5 rounded-xl shadow-sm shrink-0 mt-0.5 ${isAccepted ? "bg-green-500 text-white" : "bg-rose-500 text-white"}`}>
                                                {isAccepted ? <Heart className="w-4 h-4 fill-white" /> : <HeartOff className="w-4 h-4" />}
                                              </div>
                                              <div>
                                                <p className="text-sm text-slate-800 font-bold mb-1">
                                                  "{questionText}"
                                                </p>
                                                <p className={`font-bold text-xs ${isAccepted ? 'text-green-600' : 'text-rose-600'}`}>
                                                  {isAccepted ? "Answered: YES! 😍" : "Answered: No 🙈"}
                                                </p>
                                                {metaObj && (
                                                  <div className="mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-3 shadow-sm">
                                                    {metaObj.place && (
                                                      <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Place</span>
                                                        <span className="text-sm font-medium text-slate-800">📍 We are going to:<br/>{metaObj.place}</span>
                                                      </div>
                                                    )}
                                                    {metaObj.food && (
                                                      <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Food</span>
                                                        <span className="text-sm font-medium text-slate-800">🍽️ We are eating:<br/>{metaObj.food}</span>
                                                      </div>
                                                    )}
                                                    {(metaObj.date || metaObj.time) && (
                                                      <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Date & Time</span>
                                                        <span className="text-sm font-medium text-slate-800">
                                                          {metaObj.date && <>📅 See you on: {metaObj.date}</>}
                                                          {metaObj.date && metaObj.time && <br />}
                                                          {metaObj.time && <>⏰ At exactly: {metaObj.time}</>}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium whitespace-nowrap mt-1">
                                              {timeStr}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-sm">
                                  The recipient opened the page but didn't click any buttons during this visit.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
