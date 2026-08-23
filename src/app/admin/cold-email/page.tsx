"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, Plus, Server, ListOrdered, RefreshCw, Play, Pause, XCircle, Trash2,
  CheckCircle, AlertCircle, Eye, EyeOff, ShieldCheck, Zap, Clock, Users, FileText, Check, Copy,
  Upload, HelpCircle, Loader2, Sparkles, Filter, ChevronLeft, ChevronRight, Activity, X
} from "lucide-react";
import {
  getColdDashboardStats,
  getColdCampaigns,
  getColdCampaignById,
  createColdCampaign,
  startColdCampaign,
  pauseColdCampaign,
  resumeColdCampaign,
  cancelColdCampaign,
  deleteColdCampaign,
  getSmtpAccounts,
  createSmtpAccount,
  updateSmtpAccount,
  deleteSmtpAccount,
  testSmtpAccountAction,
  parseAndValidateRecipients,
  getColdLogs,
  getSavedTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from "./actions";

function LiveCountdown({
  status,
  delayMs = 5000,
  pendingCount = 0,
}: {
  status: string;
  delayMs?: number;
  pendingCount?: number;
}) {
  const delaySec = Math.max(1, Math.round(delayMs / 1000));
  const [seconds, setSeconds] = useState(delaySec);

  useEffect(() => {
    if (status !== "RUNNING" || pendingCount <= 0) return;

    setSeconds(delaySec);
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) return delaySec;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, pendingCount, delaySec]);

  if (status !== "RUNNING") {
    return <span className="text-slate-500 text-[11px] font-mono">--</span>;
  }

  if (pendingCount <= 0) {
    return <span className="text-indigo-400 text-[11px] font-mono font-bold">Done</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[11px] font-mono font-bold animate-pulse">
      <Clock className="w-3 h-3 text-amber-400 animate-spin" /> Next in {seconds}s
    </span>
  );
}

export default function ColdEmailAdminPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "smtp" | "logs">("campaigns");
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [smtpAccounts, setSmtpAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [editingSmtp, setEditingSmtp] = useState<any>(null);
  const [viewingCampaign, setViewingCampaign] = useState<any>(null);
  const [confirmStartModal, setConfirmStartModal] = useState<any>(null);

  // Campaign Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [cName, setCName] = useState("");
  const [cSubject, setCSubject] = useState("");
  const [cContent, setCContent] = useState("");
  const [cRecipientsRaw, setCRecipientsRaw] = useState("");
  const [cSmtpAccountId, setCSmtpAccountId] = useState("auto");
  const [cHourlyLimit, setCHourlyLimit] = useState(30);
  const [cDailyLimit, setCDailyLimit] = useState(200);
  const [cDelayMs, setCDelayMs] = useState(5000);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);

  // Quick inline SMTP state
  const [quickGmailEmail, setQuickGmailEmail] = useState("");
  const [quickGmailPassword, setQuickGmailPassword] = useState("");
  const [showQuickPassword, setShowQuickPassword] = useState(false);
  const [savingQuickSmtp, setSavingQuickSmtp] = useState(false);

  // SMTP Form State
  const [smtpName, setSmtpName] = useState("");
  const [smtpProvider, setSmtpProvider] = useState("gmail");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [smtpFromName, setSmtpFromName] = useState("OurStory Team");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpDailyLimit, setSmtpDailyLimit] = useState(200);
  const [smtpHourlyLimit, setSmtpHourlyLimit] = useState(30);
  const [smtpDelayMs, setSmtpDelayMs] = useState(5000);
  const [smtpIsActive, setSmtpIsActive] = useState(true);
  const [submittingSmtp, setSubmittingSmtp] = useState(false);
  const [testingSmtpId, setTestingSmtpId] = useState<string | null>(null);

  // Logs Filter State
  const [logsData, setLogsData] = useState<any[]>([]);
  const [logsPagination, setLogsPagination] = useState<any>({ page: 1, totalPages: 1 });
  const [logFilterCampaign, setLogFilterCampaign] = useState("all");
  const [logFilterStatus, setLogFilterStatus] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Database Template States
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [showNewTemplateDrawer, setShowNewTemplateDrawer] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [savingNewTemplate, setSavingNewTemplate] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const templates = await getSavedTemplates();
      setCustomTemplates(templates);
    } catch (err) {
      console.error("Failed to load templates from DB:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, campaignsRes, smtpRes] = await Promise.all([
        getColdDashboardStats(),
        getColdCampaigns(),
        getSmtpAccounts(),
      ]);
      setStats(statsRes);
      setCampaigns(campaignsRes);
      setSmtpAccounts(smtpRes);
      loadTemplates();
    } catch (err: any) {
      showToast(err.message || "Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadTemplates]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === "new_db_template") {
      setShowNewTemplateDrawer(true);
      return;
    }
    setShowNewTemplateDrawer(false);
    const found = customTemplates.find((t) => t.id === templateId);
    if (found) {
      setCSubject(found.subject);
      setCContent(found.content);
      showToast(`Loaded template from database: "${found.name}"`, "success");
    }
  };

  const handleSaveNewTemplate = async () => {
    if (!newTemplateName.trim()) {
      showToast("Please enter a name for the template.", "error");
      return;
    }
    if (!cSubject.trim() || !cContent.trim()) {
      showToast("Please fill in Subject Line and Email Content before saving.", "error");
      return;
    }

    setSavingNewTemplate(true);
    try {
      const res = await saveCustomTemplate({
        name: newTemplateName.trim(),
        subject: cSubject.trim(),
        content: cContent,
      });
      showToast(`Template "${newTemplateName}" saved to database!`, "success");
      setNewTemplateName("");
      setShowNewTemplateDrawer(false);
      await loadTemplates();
      setSelectedTemplateId(res.templateId);
    } catch (err: any) {
      showToast(err.message || "Failed to save template", "error");
    } finally {
      setSavingNewTemplate(false);
    }
  };

  const handleDeleteCustomTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    try {
      await deleteCustomTemplate(id);
      showToast(`Deleted template "${name}" from database.`, "info");
      loadTemplates();
    } catch (err: any) {
      showToast(err.message || "Failed to delete template", "error");
    }
  };

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await getColdLogs({
        campaignId: logFilterCampaign,
        status: logFilterStatus,
        search: logSearch,
        page: logsPagination.page || 1,
        limit: 25,
      });
      setLogsData(res.logs);
      setLogsPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || "Failed to load email logs", "error");
    } finally {
      setLogsLoading(false);
    }
  }, [logFilterCampaign, logFilterStatus, logSearch, logsPagination.page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-trigger background worker queue every 5 seconds when any campaign is RUNNING
  useEffect(() => {
    const hasRunningCampaign = campaigns.some((c) => c.status === "RUNNING");
    if (!hasRunningCampaign) return;

    const interval = setInterval(async () => {
      try {
        await fetch("/api/admin/cold-email/worker", { method: "POST" });
        loadData();
      } catch (err) {
        console.error("Worker trigger error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [campaigns, loadData]);

  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs();
    }
  }, [activeTab, loadLogs]);

  // Handle Refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    if (activeTab === "logs") loadLogs();
  };

  // Provider presets
  const applySmtpPreset = (preset: string) => {
    setSmtpProvider(preset);
    if (preset === "gmail") {
      setSmtpHost("smtp.gmail.com");
      setSmtpPort(587);
    } else if (preset === "outlook") {
      setSmtpHost("smtp.office365.com");
      setSmtpPort(587);
    } else if (preset === "amazon") {
      setSmtpHost("email-smtp.us-east-1.amazonaws.com");
      setSmtpPort(587);
    } else if (preset === "sendgrid") {
      setSmtpHost("smtp.sendgrid.net");
      setSmtpPort(587);
    }
  };

  // Recipient Validation Check in Campaign Wizard
  const handleValidateRecipients = async () => {
    if (!cRecipientsRaw.trim()) {
      showToast("Please enter or paste at least one recipient email.", "error");
      return;
    }
    const report = await parseAndValidateRecipients(cRecipientsRaw);
    setValidationReport(report);
    if (report.validRecipients.length === 0) {
      showToast("No valid email addresses found. Please check your recipient list.", "error");
    } else {
      setWizardStep(2);
    }
  };

  // CSV File Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCRecipientsRaw((prev) => (prev ? `${prev}\n${text}` : text));
        showToast(`Loaded ${file.name} successfully!`, "info");
      }
    };
    reader.readAsText(file);
  };

  // Quick inline SMTP saver
  const handleSaveQuickSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGmailEmail || !quickGmailPassword) {
      showToast("Please enter both your Gmail address and 16-digit App Password.", "error");
      return;
    }
    setSavingQuickSmtp(true);
    try {
      const res = await createSmtpAccount({
        name: `Gmail (${quickGmailEmail})`,
        provider: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        username: quickGmailEmail.trim(),
        password: quickGmailPassword.trim(),
        fromName: "OurStory Team",
        fromEmail: quickGmailEmail.trim(),
        dailyLimit: 200,
        hourlyLimit: 30,
        delayMs: 5000,
        isActive: true,
      });
      showToast("Gmail credentials saved successfully!", "success");
      setQuickGmailEmail("");
      setQuickGmailPassword("");
      await loadData();
      setCSmtpAccountId(res.accountId);
    } catch (err: any) {
      showToast(err.message || "Failed to save Gmail credentials", "error");
    } finally {
      setSavingQuickSmtp(false);
    }
  };

  // Campaign Create Submit
  const handleCreateCampaignSubmit = async () => {
    setSubmittingCampaign(true);
    try {
      const res = await createColdCampaign({
        name: cName,
        subject: cSubject,
        content: cContent,
        recipientsRaw: cRecipientsRaw,
        smtpAccountId: cSmtpAccountId,
        hourlyLimit: cHourlyLimit,
        dailyLimit: cDailyLimit,
        delayMs: cDelayMs,
      });

      showToast(`Campaign "${cName}" created with ${res.summary.valid} recipients!`, "success");
      setShowCreateModal(false);
      resetCampaignForm();
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to create campaign", "error");
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const resetCampaignForm = () => {
    setWizardStep(1);
    setCName("");
    setCSubject("");
    setCContent("");
    setCRecipientsRaw("");
    setCSmtpAccountId("auto");
    setValidationReport(null);
  };

  // SMTP Save Submit
  const handleSaveSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSmtp(true);
    const effectiveFromEmail = (smtpFromEmail || smtpUsername).trim();
    const effectiveName = (smtpName || `Gmail (${effectiveFromEmail})`).trim();
    try {
      if (editingSmtp) {
        await updateSmtpAccount(editingSmtp.id, {
          name: effectiveName,
          provider: smtpProvider,
          host: smtpHost,
          port: smtpPort,
          username: smtpUsername,
          password: smtpPassword || undefined,
          fromName: smtpFromName,
          fromEmail: effectiveFromEmail,
          dailyLimit: smtpDailyLimit,
          hourlyLimit: smtpHourlyLimit,
          delayMs: smtpDelayMs,
          isActive: smtpIsActive,
        });
        showToast("SMTP Account updated successfully!", "success");
      } else {
        await createSmtpAccount({
          name: effectiveName,
          provider: smtpProvider,
          host: smtpHost,
          port: smtpPort,
          username: smtpUsername,
          password: smtpPassword,
          fromName: smtpFromName,
          fromEmail: effectiveFromEmail,
          dailyLimit: smtpDailyLimit,
          hourlyLimit: smtpHourlyLimit,
          delayMs: smtpDelayMs,
          isActive: smtpIsActive,
        });
        showToast("SMTP Account created successfully!", "success");
      }

      setShowSmtpModal(false);
      resetSmtpForm();
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to save SMTP account", "error");
    } finally {
      setSubmittingSmtp(false);
    }
  };

  const openEditSmtp = (acc: any) => {
    setEditingSmtp(acc);
    setSmtpName(acc.name);
    setSmtpProvider(acc.provider);
    setSmtpHost(acc.host);
    setSmtpPort(acc.port);
    setSmtpUsername(acc.username);
    setSmtpPassword("");
    setSmtpFromName(acc.fromName);
    setSmtpFromEmail(acc.fromEmail);
    setSmtpDailyLimit(acc.dailyLimit);
    setSmtpHourlyLimit(acc.hourlyLimit);
    setSmtpDelayMs(acc.delayMs);
    setSmtpIsActive(acc.isActive);
    setShowSmtpModal(true);
  };

  const resetSmtpForm = () => {
    setEditingSmtp(null);
    setSmtpName("");
    setSmtpProvider("gmail");
    setSmtpHost("smtp.gmail.com");
    setSmtpPort(587);
    setSmtpUsername("");
    setSmtpPassword("");
    setSmtpFromName("OurStory Team");
    setSmtpFromEmail("");
    setSmtpDailyLimit(200);
    setSmtpHourlyLimit(30);
    setSmtpDelayMs(5000);
    setSmtpIsActive(true);
  };

  // Test SMTP
  const handleTestSmtp = async (id: string) => {
    setTestingSmtpId(id);
    try {
      const res = await testSmtpAccountAction(id);
      if (res.success) {
        showToast(res.message, "success");
      } else {
        showToast(res.message, "error");
      }
    } catch (err: any) {
      showToast(err.message || "SMTP connection test failed", "error");
    } finally {
      setTestingSmtpId(null);
    }
  };

  // Delete SMTP
  const handleDeleteSmtp = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SMTP Account?")) return;
    try {
      await deleteSmtpAccount(id);
      showToast("SMTP Account deleted.", "info");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete SMTP account", "error");
    }
  };

  // Campaign Actions
  const handleStartCampaignConfirmed = async () => {
    if (!confirmStartModal) return;
    const { id } = confirmStartModal;
    setConfirmStartModal(null);
    setActionLoadingId(id);
    try {
      const res = await startColdCampaign(id);
      showToast(res.message, "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to start campaign", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePauseCampaign = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await pauseColdCampaign(id);
      showToast(res.message, "info");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to pause campaign", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResumeCampaign = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await resumeColdCampaign(id);
      showToast(res.message, "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to resume campaign", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this campaign? Pending emails will be skipped.")) return;
    setActionLoadingId(id);
    try {
      const res = await cancelColdCampaign(id);
      showToast(res.message, "info");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to cancel campaign", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this campaign and all logs?")) return;
    setActionLoadingId(id);
    try {
      await deleteColdCampaign(id);
      showToast("Campaign deleted.", "info");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete campaign", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewCampaignDetails = async (id: string) => {
    try {
      const details = await getColdCampaignById(id);
      setViewingCampaign(details);
    } catch (err: any) {
      showToast(err.message || "Failed to load campaign details", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Loading Cold Email Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-7 h-7 text-indigo-400" /> Cold Email Campaigns 🚀
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Rate-limited, compliant product outreach engine with multi-SMTP rotation.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              resetCampaignForm();
              setShowCreateModal(true);
            }}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-900/30 transition"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-semibold text-xs text-white shadow-2xl flex items-center gap-2.5 transition animate-in fade-in slide-in-from-top-4 ${toast.type === "success"
              ? "bg-emerald-600"
              : toast.type === "error"
                ? "bg-rose-600"
                : "bg-indigo-600"
            }`}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.type === "info" && <Sparkles className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Total Campaigns</span>
          <span className="text-xl font-extrabold text-white mt-2">{stats?.totalCampaigns || 0}</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Active Running</span>
          <span className="text-xl font-extrabold text-emerald-400 mt-2 flex items-center gap-1.5">
            {stats?.activeCampaigns || 0}
            {(stats?.activeCampaigns || 0) > 0 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Sent Today</span>
          <span className="text-xl font-extrabold text-indigo-400 mt-2">{stats?.emailsSentToday || 0}</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Remaining Today</span>
          <span className="text-xl font-extrabold text-amber-400 mt-2">{stats?.emailsRemainingToday || 0}</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Total Sent</span>
          <span className="text-xl font-extrabold text-emerald-400 mt-2">{stats?.totalSent || 0}</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Total Failed</span>
          <span className="text-xl font-extrabold text-rose-400 mt-2">{stats?.totalFailed || 0}</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Queued Emails</span>
          <span className="text-xl font-extrabold text-purple-400 mt-2">{stats?.queuedEmails || 0}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === "campaigns"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
          <Mail className="w-4 h-4" /> Campaigns ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab("smtp")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === "smtp"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
          <Server className="w-4 h-4" /> SMTP Accounts ({smtpAccounts.length})
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === "logs"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
          <ListOrdered className="w-4 h-4" /> Sending Audit Logs
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS LIST */}
      {activeTab === "campaigns" && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" /> Active & Historical Campaigns
            </h3>
            <span className="text-xs text-slate-400">Showing {campaigns.length} campaigns</span>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Mail className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-sm font-medium">No cold email campaigns created yet.</p>
              <button
                onClick={() => {
                  resetCampaignForm();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
              >
                + Create First Campaign
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0a0f1e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Campaign</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4 text-center">Recipients</th>
                    <th className="p-4 text-center">Sent</th>
                    <th className="p-4 text-center">Failed</th>
                    <th className="p-4 text-center">Pending</th>
                    <th className="p-4 text-center">Next Dispatch</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {campaigns.map((c) => {
                    const statusBadgeColor: Record<string, string> = {
                      DRAFT: "bg-slate-800 text-slate-400 border-slate-700",
                      QUEUED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      RUNNING: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      PAUSED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      COMPLETED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                      CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    };

                    const isLoadingThis = actionLoadingId === c.id;

                    return (
                      <tr key={c.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-4">
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          <p className="text-slate-400 text-[11px] truncate max-w-xs">{c.subject}</p>
                          <span className="inline-block mt-1 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono">
                            Sender: {c.smtpAccountName || "Auto-Rotate All Accounts"}
                          </span>
                        </td>

                        <td className="p-4 w-40">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-slate-400">{c.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                        </td>

                        <td className="p-4 text-center font-mono font-bold text-slate-200">{c.totalRecipients}</td>
                        <td className="p-4 text-center font-mono text-emerald-400 font-bold">{c.sentCount}</td>
                        <td className="p-4 text-center font-mono text-rose-400 font-bold">{c.failedCount}</td>
                        <td className="p-4 text-center font-mono text-amber-400 font-bold">{c.pendingCount}</td>

                        <td className="p-4 text-center">
                          <LiveCountdown status={c.status} delayMs={c.delayMs} pendingCount={c.pendingCount} />
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeColor[c.status] || "bg-slate-800"}`}>
                            {c.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              onClick={() => handleViewCampaignDetails(c.id)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                              title="View Details & Logs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Start */}
                            {(c.status === "DRAFT" || c.status === "QUEUED") && (
                              <button
                                onClick={() => setConfirmStartModal(c)}
                                disabled={isLoadingThis}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                {isLoadingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />} Start
                              </button>
                            )}

                            {/* Pause */}
                            {c.status === "RUNNING" && (
                              <button
                                onClick={() => handlePauseCampaign(c.id)}
                                disabled={isLoadingThis}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                {isLoadingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3 fill-white" />} Pause
                              </button>
                            )}

                            {/* Resume */}
                            {c.status === "PAUSED" && (
                              <button
                                onClick={() => handleResumeCampaign(c.id)}
                                disabled={isLoadingThis}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                {isLoadingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />} Resume
                              </button>
                            )}

                            {/* Cancel */}
                            {(c.status === "RUNNING" || c.status === "PAUSED") && (
                              <button
                                onClick={() => handleCancelCampaign(c.id)}
                                disabled={isLoadingThis}
                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                title="Cancel Campaign"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteCampaign(c.id)}
                              disabled={isLoadingThis}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SMTP ACCOUNTS */}
      {activeTab === "smtp" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" /> Configured SMTP Accounts & Outbound Nodes
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                The cold email engine distributes outgoing emails across all active, healthy SMTP accounts.
              </p>
            </div>
            <button
              onClick={() => {
                resetSmtpForm();
                setShowSmtpModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md shadow-indigo-900/30"
            >
              <Plus className="w-4 h-4" /> Add SMTP Account
            </button>
          </div>

          {smtpAccounts.length === 0 ? (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <Server className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-sm font-medium">No SMTP accounts configured.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Add your Gmail App Password, Custom SMTP, Outlook, or Amazon SES credentials to start sending emails.
              </p>
              <button
                onClick={() => {
                  resetSmtpForm();
                  setShowSmtpModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
              >
                + Configure First SMTP
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {smtpAccounts.map((acc) => {
                const healthBadge: Record<string, string> = {
                  Healthy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  Disabled: "bg-slate-800 text-slate-400 border-slate-700",
                  "Limit Reached": "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  "Needs Config": "bg-rose-500/10 text-rose-400 border-rose-500/20",
                };

                const isTesting = testingSmtpId === acc.id;

                return (
                  <div key={acc.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-white text-base">{acc.name}</h4>
                          <p className="text-slate-400 text-xs truncate font-mono">{acc.fromEmail}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${healthBadge[acc.healthStatus]}`}>
                          ● {acc.healthStatus}
                        </span>
                      </div>

                      <div className="bg-[#0a0f1e] border border-slate-800 rounded-xl p-3 space-y-2 text-xs text-slate-300 font-mono my-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Host:</span>
                          <span>{acc.host}:{acc.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">User:</span>
                          <span className="truncate max-w-[140px]">{acc.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Password:</span>
                          <span>{acc.maskedPassword}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hourly Used:</span>
                          <span className="text-indigo-400 font-bold">{acc.sentThisHour} / {acc.hourlyLimit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Daily Used:</span>
                          <span className="text-amber-400 font-bold">{acc.sentToday} / {acc.dailyLimit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Delay:</span>
                          <span>{(acc.delayMs / 1000).toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleTestSmtp(acc.id)}
                        disabled={isTesting}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />} Test Ping
                      </button>
                      <button
                        onClick={() => openEditSmtp(acc)}
                        className="py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-xs font-bold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSmtp(acc.id)}
                        className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LOGS */}
      {activeTab === "logs" && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-400" /> Outbound Email Audit Logs
            </h3>

            {/* Log Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search email..."
                className="px-3 py-1.5 bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={logFilterCampaign}
                onChange={(e) => setLogFilterCampaign(e.target.value)}
                className="px-3 py-1.5 bg-[#0a0f1e] border border-slate-700 rounded-lg text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={logFilterStatus}
                onChange={(e) => setLogFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-[#0a0f1e] border border-slate-700 rounded-lg text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="SENT">SENT</option>
                <option value="FAILED">FAILED</option>
                <option value="RETRYING">RETRYING</option>
                <option value="SYSTEM">SYSTEM</option>
              </select>
            </div>
          </div>

          {logsLoading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
              <p className="text-xs">Loading audit logs...</p>
            </div>
          ) : logsData.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No email logs match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0a0f1e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Recipient Email</th>
                    <th className="p-3">Campaign</th>
                    <th className="p-3">SMTP Node</th>
                    <th className="p-3 text-center">Attempt</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Error / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logsData.map((log) => {
                    const statusBadge: Record<string, string> = {
                      SENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                      RETRYING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      SYSTEM: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                    };

                    return (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 font-semibold text-white font-mono">{log.recipientEmail}</td>
                        <td className="p-3 text-slate-300">{log.campaignName}</td>
                        <td className="p-3 text-slate-400 truncate max-w-[150px]">{log.smtpName}</td>
                        <td className="p-3 text-center font-mono">{log.attempt}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge[log.status] || "bg-slate-800"}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                          {log.error || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs text-slate-400">
                <span>
                  Page {logsPagination.page} of {logsPagination.totalPages} ({logsPagination.total} total logs)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={logsPagination.page <= 1}
                    onClick={() => setLogsPagination((p: any) => ({ ...p, page: p.page - 1 }))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={logsPagination.page >= logsPagination.totalPages}
                    onClick={() => setLogsPagination((p: any) => ({ ...p, page: p.page + 1 }))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE CAMPAIGN WIZARD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-slate-300">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Create New Cold Campaign</h3>
                <p className="text-xs text-slate-400">Step {wizardStep} of 2: {wizardStep === 1 ? "Campaign & Recipients" : "Limits & Confirmation"}</p>
              </div>
            </div>

            {/* STEP 1: Campaign details & Recipient Input */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="e.g. Valentines Product Outreach 2026"
                    className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Email Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={cSubject}
                    onChange={(e) => setCSubject(e.target.value)}
                    placeholder="e.g. Hey {{name}}, discover a romantic surprise..."
                    className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Sender Gmail / SMTP Account *</label>
                  <select
                    value={cSmtpAccountId}
                    onChange={(e) => setCSmtpAccountId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="auto">🔄 Auto-Rotate All Active SMTP Accounts</option>
                    {smtpAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        📧 {acc.name} ({acc.fromEmail})
                      </option>
                    ))}
                    <option value="new">➕ Add New Gmail Credentials...</option>
                  </select>
                </div>

                {/* Inline Quick Add Gmail Drawer */}
                {(cSmtpAccountId === "new" || smtpAccounts.length === 0) && (
                  <div className="bg-[#0a0f1e] border border-indigo-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Server className="w-4 h-4" /> 1-Step: Add Your Gmail Credentials
                      </h4>
                      <span className="text-[10px] text-slate-400">Uses Google App Password</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gmail Address</label>
                        <input
                          type="email"
                          value={quickGmailEmail}
                          onChange={(e) => setQuickGmailEmail(e.target.value)}
                          placeholder="e.g. yourgmail@gmail.com"
                          className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">16-Digit App Password</label>
                        <div className="relative">
                          <input
                            type={showQuickPassword ? "text" : "password"}
                            value={quickGmailPassword}
                            onChange={(e) => setQuickGmailPassword(e.target.value)}
                            placeholder="•••• •••• •••• ••••"
                            className="w-full px-3 py-2 pr-10 bg-[#111827] border border-slate-700 rounded-xl text-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowQuickPassword(!showQuickPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
                            title={showQuickPassword ? "Hide password" : "Show password"}
                          >
                            {showQuickPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <p className="text-[10px] text-slate-500">Credentials are encrypted with AES-256 at rest.</p>
                      <button
                        type="button"
                        onClick={handleSaveQuickSmtp}
                        disabled={savingQuickSmtp}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                      >
                        {savingQuickSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />} Save & Use Gmail
                      </button>
                    </div>
                  </div>
                )}

                {/* Database Reusable Template Selector Bar */}
                <div className="bg-[#0a0f1e] border border-indigo-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Database Email Template Library ({customTemplates.length})
                    </label>
                  </div>

                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>-- Select Reusable Template from Database --</option>
                    {customTemplates.map((t) => (
                      <option key={t.id} value={t.id}>📜 {t.name}</option>
                    ))}
                    <option value="new_db_template">➕ Create & Save New Template to Database...</option>
                  </select>

                  {/* Inline Save New Template Drawer */}
                  {showNewTemplateDrawer && (
                    <div className="bg-[#111827] border border-amber-500/30 rounded-xl p-3 space-y-2.5 animate-in fade-in duration-300 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">➕ Save Current Content as Reusable Template</span>
                        <button type="button" onClick={() => setShowNewTemplateDrawer(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Template Title / Name *</label>
                        <input
                          type="text"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="e.g. Valentines Special Offer 2026"
                          className="w-full px-3 py-1.5 bg-[#0a0f1e] border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowNewTemplateDrawer(false)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNewTemplate}
                          disabled={savingNewTemplate}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                        >
                          {savingNewTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save to Database
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-400">Email Body HTML / Content *</label>
                    <span className="text-[10px] text-indigo-400">Supported: {"{{name}}, {{email}}, {{product_name}}, {{product_url}}"}</span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={cContent}
                    onChange={(e) => setCContent(e.target.value)}
                    placeholder="Hello {{name}},\n\nWe built {{product_name}} to help you share digital memories with your loved ones!\nCheck it out here: {{product_url}}"
                    className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-400">Recipients (Paste Email List or CSV Upload) *</label>
                    <label className="text-xs text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload CSV
                      <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={cRecipientsRaw}
                    onChange={(e) => setCRecipientsRaw(e.target.value)}
                    placeholder="john@example.com&#10;Sarah, sarah@example.com&#10;alex@example.com"
                    className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">One per line. Format: email OR Name, email.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateRecipients}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-900/30"
                  >
                    Validate & Next ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Import Validation Report, Rate Limits & Preview */}
            {wizardStep === 2 && validationReport && (
              <div className="space-y-4">
                {/* Validation Summary Box */}
                <div className="bg-[#0a0f1e] border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Recipient Import Summary
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-900 p-2 rounded-xl">
                      <span className="block text-slate-500 text-[10px]">Total Lines</span>
                      <span className="font-bold text-white">{validationReport.summary.total}</span>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                      <span className="block text-emerald-400 text-[10px]">Valid</span>
                      <span className="font-bold text-emerald-400">{validationReport.summary.valid}</span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                      <span className="block text-rose-400 text-[10px]">Invalid</span>
                      <span className="font-bold text-rose-400">{validationReport.summary.invalid}</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                      <span className="block text-amber-400 text-[10px]">Duplicates</span>
                      <span className="font-bold text-amber-400">{validationReport.summary.duplicates}</span>
                    </div>
                  </div>
                </div>

                {/* Sending Rate Configuration */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Hourly Limit</label>
                    <input
                      type="number"
                      value={cHourlyLimit}
                      onChange={(e) => setCHourlyLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Daily Limit</label>
                    <input
                      type="number"
                      value={cDailyLimit}
                      onChange={(e) => setCDailyLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Delay (ms)</label>
                    <input
                      type="number"
                      step={500}
                      value={cDelayMs}
                      onChange={(e) => setCDelayMs(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                {/* Email Preview */}
                <div className="border border-slate-800 rounded-2xl p-4 bg-[#0a0f1e] space-y-2 text-xs">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Live Sample Preview</span>
                  <div className="text-slate-300 font-bold">Subject: {cSubject}</div>
                  <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl whitespace-pre-wrap font-mono text-[11px] text-slate-300">
                    {cContent.replace(/\{\{\s*name\s*\}\}/gi, "John Doe").replace(/\{\{\s*product_name\s*\}\}/gi, "OurStory")}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCampaignSubmit}
                    disabled={submittingCampaign}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-900/30 disabled:opacity-60"
                  >
                    {submittingCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Create Campaign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* START CONFIRMATION MODAL */}
      {confirmStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-slate-300">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" /> Start Cold Campaign?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to start <strong className="text-white">&quot;{confirmStartModal.name}&quot;</strong>?
              Emails will be queued and sent gradually across eligible active SMTP accounts according to configured rate limits.
            </p>
            <div className="bg-[#0a0f1e] border border-slate-800 rounded-xl p-3 text-xs space-y-1 text-slate-300 font-mono">
              <div className="flex justify-between"><span>Recipients:</span><span className="text-emerald-400 font-bold">{confirmStartModal.totalRecipients}</span></div>
              <div className="flex justify-between"><span>Configured Rate:</span><span>{confirmStartModal.hourlyLimit || 30} emails/hour</span></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmStartModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCampaignConfirmed}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Start Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SMTP MODAL */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <form onSubmit={handleSaveSmtpSubmit} className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-slate-300">
            <button
              type="button"
              onClick={() => setShowSmtpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Server className="w-5 h-5 text-indigo-400" /> {editingSmtp ? "Edit SMTP Account" : "Configure New SMTP Account"}
            </h3>

            {/* Provider Presets */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Provider Presets</label>
              <div className="flex flex-wrap gap-2">
                {["gmail", "outlook", "sendgrid", "amazon", "custom"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applySmtpPreset(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${smtpProvider === p ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Account Label (Nickname for Admin)</label>
                <input
                  type="text"
                  value={smtpName}
                  onChange={(e) => setSmtpName(e.target.value)}
                  placeholder="Defaults to Gmail (your email)"
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">From Name</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  placeholder="e.g. OurStory Team"
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">SMTP Host *</label>
                <input
                  type="text"
                  required
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Port *</label>
                <input
                  type="number"
                  required
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  placeholder="587"
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Username / Email *</label>
                <input
                  type="text"
                  required
                  value={smtpUsername}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSmtpUsername(val);
                    if (!smtpFromEmail || smtpFromEmail === smtpUsername) {
                      setSmtpFromEmail(val);
                    }
                  }}
                  placeholder="user@gmail.com"
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">From Email (Auto-filled)</label>
                <input
                  type="email"
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  placeholder="Defaults to Username / Email"
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Password / App Password {editingSmtp && "(Leave blank to keep existing encrypted password)"} *
              </label>
              <div className="relative">
                <input
                  type={showSmtpPassword ? "text" : "password"}
                  required={!editingSmtp}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 pr-10 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
                  title={showSmtpPassword ? "Hide password" : "Show password"}
                >
                  {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Credentials are securely encrypted at rest using AES-256.</p>
            </div>

            {/* Rate Limits */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Hourly Limit</label>
                <input
                  type="number"
                  value={smtpHourlyLimit}
                  onChange={(e) => setSmtpHourlyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Daily Limit</label>
                <input
                  type="number"
                  value={smtpDailyLimit}
                  onChange={(e) => setSmtpDailyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Delay (ms)</label>
                <input
                  type="number"
                  step={500}
                  value={smtpDelayMs}
                  onChange={(e) => setSmtpDelayMs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="smtpIsActive"
                checked={smtpIsActive}
                onChange={(e) => setSmtpIsActive(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="smtpIsActive" className="text-xs font-bold text-slate-300">Account Enabled for Sending</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSmtpModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingSmtp}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-900/30 disabled:opacity-60"
              >
                {submittingSmtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save SMTP Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW CAMPAIGN DETAILS MODAL */}
      {viewingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative text-slate-300">
            <button
              onClick={() => setViewingCampaign(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Campaign Overview</span>
              <h3 className="text-xl font-bold text-white">{viewingCampaign.name}</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">Subject: {viewingCampaign.subject}</p>
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-[#0a0f1e] p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-500 text-[10px]">Total</span>
                <span className="block font-bold text-white text-lg">{viewingCampaign.totalRecipients}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
                <span className="text-emerald-400 text-[10px]">Sent</span>
                <span className="block font-bold text-emerald-400 text-lg">{viewingCampaign.sentCount}</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl">
                <span className="text-rose-400 text-[10px]">Failed</span>
                <span className="block font-bold text-rose-400 text-lg">{viewingCampaign.failedCount}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
                <span className="text-amber-400 text-[10px]">Pending</span>
                <span className="block font-bold text-amber-400 text-lg">{viewingCampaign.pendingCount}</span>
              </div>
            </div>

            {/* Recipient list sample */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recipients ({viewingCampaign.recipients?.length || 0})</h4>
              <div className="bg-[#0a0f1e] border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-800 text-xs">
                {viewingCampaign.recipients?.map((r: any) => (
                  <div key={r.id} className="p-2.5 flex justify-between items-center font-mono">
                    <span>{r.email} {r.name ? `(${r.name})` : ""}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${r.status === "SENT" ? "bg-emerald-500/20 text-emerald-400" : r.status === "FAILED" ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-400"
                      }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setViewingCampaign(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
