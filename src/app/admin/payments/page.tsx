"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Loader2,
  ShieldAlert,
  Search,
  X,
  Tag,
  Copy,
  Check,
  RotateCcw,
  Receipt,
  TrendingUp,
  TicketPercent,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { getAdminPayments } from "@/app/admin/actions";

// Helper to calculate pagination page numbers with ellipsis
function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [couponFilter, setCouponFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await getAdminPayments();
        if (res.success) {
          setPayments(res.payments || []);
        } else {
          setError(res.error || "Failed to load payments");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load payments");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayments();
  }, []);

  // Reset to page 1 whenever any search, filter, sorting, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, templateFilter, couponFilter, sortBy, pageSize]);

  // Copy Transaction ID to clipboard
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract unique templates for the template filter dropdown
  const uniqueTemplates = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => {
      const t = p.demoId || p.plan;
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [payments]);

  // Filtered & Sorted Payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((payment) => {
        const actualPaid =
          payment.finalAmount !== null && payment.finalAmount !== undefined
            ? payment.finalAmount
            : payment.amount;

        const txId = (payment.razorpayPaymentId || payment.id || "").toLowerCase();
        const userName = (payment.user?.name || "").toLowerCase();
        const userEmail = (payment.user?.email || "").toLowerCase();
        const couponCode = (payment.coupon?.code || "").toLowerCase();
        const template = (payment.demoId || payment.plan || "").toLowerCase();
        const query = search.trim().toLowerCase();

        // 1. Search Query
        if (query) {
          const matchesSearch =
            txId.includes(query) ||
            userName.includes(query) ||
            userEmail.includes(query) ||
            couponCode.includes(query) ||
            template.includes(query) ||
            `₹${(payment.amount / 100).toFixed(2)}`.includes(query) ||
            `₹${(actualPaid / 100).toFixed(2)}`.includes(query);
          if (!matchesSearch) return false;
        }

        // 2. Status Filter
        if (statusFilter && payment.status !== statusFilter) {
          return false;
        }

        // 3. Payment Type Filter (Real Cash vs 100% Free Pass)
        if (typeFilter === "paid" && actualPaid <= 0) return false;
        if (typeFilter === "free" && actualPaid > 0) return false;

        // 4. Template Filter
        if (templateFilter && (payment.demoId || payment.plan) !== templateFilter) {
          return false;
        }

        // 5. Coupon Filter
        const hasCoupon = Boolean(payment.couponId || payment.coupon?.code);
        if (couponFilter === "has_coupon" && !hasCoupon) return false;
        if (couponFilter === "no_coupon" && hasCoupon) return false;

        return true;
      })
      .sort((a, b) => {
        const aPaid = a.finalAmount !== null && a.finalAmount !== undefined ? a.finalAmount : a.amount;
        const bPaid = b.finalAmount !== null && b.finalAmount !== undefined ? b.finalAmount : b.amount;
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();

        if (sortBy === "date_asc") return aDate - bDate;
        if (sortBy === "paid_desc") return bPaid - aPaid;
        if (sortBy === "paid_asc") return aPaid - bPaid;
        return bDate - aDate; // default date_desc
      });
  }, [payments, search, statusFilter, typeFilter, templateFilter, couponFilter, sortBy]);

  // Aggregate KPI stats from filtered payments
  const stats = useMemo(() => {
    let totalCashPaid = 0;
    let totalRetail = 0;
    let couponCount = 0;
    let successCount = 0;

    filteredPayments.forEach((p) => {
      const paid = p.finalAmount !== null && p.finalAmount !== undefined ? p.finalAmount : p.amount;
      totalCashPaid += paid;
      totalRetail += p.amount;
      if (p.coupon?.code || p.couponId) couponCount++;
      if (p.status === "SUCCESS") successCount++;
    });

    return {
      count: filteredPayments.length,
      totalCashPaid: totalCashPaid / 100,
      totalRetail: totalRetail / 100,
      totalDiscount: (totalRetail - totalCashPaid) / 100,
      couponCount,
      successCount,
    };
  }, [filteredPayments]);

  // Calculate Pagination ranges
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredPayments.length);
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const hasActiveFilters = Boolean(
    search || statusFilter || typeFilter || templateFilter || couponFilter || sortBy !== "date_desc"
  );

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setTemplateFilter("");
    setCouponFilter("");
    setSortBy("date_desc");
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
        <h3 className="text-rose-400 font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Error Loading Payments
        </h3>
        <p className="text-sm text-slate-300 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" /> Payment Received
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              {payments.length} Total
            </span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            View all transactions, real cash collected, and payment history.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Real Cash Collected */}
        <div className="bg-[#111827] border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
              Real Paid (Cash)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            ₹{stats.totalCashPaid.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Actual cash received in Razorpay
          </p>
        </div>

        {/* Transactions Count */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-400">
              Transactions
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {stats.count}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {stats.successCount} successful • Page {safePage} of {totalPages}
          </p>
        </div>

        {/* Retail Price Value */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
              Retail Value
            </span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-200 tracking-tight">
            ₹{stats.totalRetail.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Discounts: ₹{stats.totalDiscount.toFixed(2)}
          </p>
        </div>

        {/* Coupons Redeemed */}
        <div className="bg-[#111827] border border-amber-500/20 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
              Coupons Used
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TicketPercent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            {stats.couponCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {stats.count > 0 ? Math.round((stats.couponCount / stats.count) * 100) : 0}% redemption rate
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Transaction ID, User, Email, Coupon, Template, Amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-[#0a0f1e] border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0a0f1e] border border-slate-700/80 rounded-xl text-slate-200 text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>

            {/* Payment Type (Paid Cash vs Free) */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0a0f1e] border border-slate-700/80 rounded-xl text-slate-200 text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Amounts</option>
              <option value="paid">Cash Paid (&gt; ₹0)</option>
              <option value="free">100% Free (₹0)</option>
            </select>

            {/* Template Filter */}
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="bg-[#0a0f1e] border border-slate-700/80 rounded-xl text-slate-200 text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Templates</option>
              {uniqueTemplates.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0a0f1e] border border-slate-700/80 rounded-xl text-slate-200 text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="paid_desc">Highest Cash Paid</option>
              <option value="paid_asc">Lowest Cash Paid</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Tags & Range status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Quick Filters:</span>

            {/* Quick Filter: All */}
            <button
              onClick={() => {
                setTypeFilter("");
                setStatusFilter("");
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                !typeFilter && !statusFilter
                  ? "bg-indigo-600 text-white"
                  : "bg-[#0a0f1e] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All ({payments.length})
            </button>

            {/* Quick Filter: Cash Paid (> ₹0) */}
            <button
              onClick={() => setTypeFilter(typeFilter === "paid" ? "" : "paid")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                typeFilter === "paid"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-950"
                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              }`}
            >
              💵 Cash Paid (&gt; ₹0)
            </button>

            {/* Quick Filter: 100% Free Passes (₹0) */}
            <button
              onClick={() => setTypeFilter(typeFilter === "free" ? "" : "free")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                typeFilter === "free"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700"
              }`}
            >
              🎁 Free Passes (₹0)
            </button>

            {/* Quick Filter: With Coupons */}
            <button
              onClick={() => setCouponFilter(couponFilter === "has_coupon" ? "" : "has_coupon")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                couponFilter === "has_coupon"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
              }`}
            >
              <Tag className="w-3 h-3" /> Coupons Used
            </button>
          </div>

          <div className="text-slate-400 text-[11px]">
            Showing{" "}
            <span className="text-indigo-400 font-bold">
              {filteredPayments.length > 0 ? startIndex + 1 : 0}–{endIndex}
            </span>{" "}
            of <span className="text-slate-200 font-bold">{filteredPayments.length}</span> transactions{" "}
            <span className="text-slate-500">
              (Page {safePage} of {totalPages})
            </span>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="-mx-3.5 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border border-slate-800 bg-[#111827] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 sm:px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-5 sm:px-6 py-4 font-semibold">User</th>
                <th className="px-5 sm:px-6 py-4 font-semibold">Retail Price</th>
                <th className="px-5 sm:px-6 py-4 font-semibold text-emerald-400">Real Paid (Cash)</th>
                <th className="px-5 sm:px-6 py-4 font-semibold">Coupon Used</th>
                <th className="px-5 sm:px-6 py-4 font-semibold">Template</th>
                <th className="px-5 sm:px-6 py-4 font-semibold">Status</th>
                <th className="px-5 sm:px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <CreditCard className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
                      <div className="text-slate-400 font-bold text-sm">
                        {hasActiveFilters ? "No transactions match your search / filter." : "No payments found."}
                      </div>
                      <p className="text-xs text-slate-500">
                        {hasActiveFilters
                          ? "Try searching for a different user, ID, coupon code, or reset your filters."
                          : "New transactions will appear here once users complete checkout."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => {
                  const actualPaid =
                    payment.finalAmount !== null && payment.finalAmount !== undefined
                      ? payment.finalAmount
                      : payment.amount;
                  const isDiscounted =
                    payment.finalAmount !== null && payment.finalAmount < payment.amount;
                  const txId = payment.razorpayPaymentId || payment.id;
                  const isCopied = copiedId === txId;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Transaction ID with 1-click Copy */}
                      <td className="px-5 sm:px-6 py-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5 group">
                          <span
                            className={`font-semibold transition-colors ${
                              payment.razorpayPaymentId ? "text-indigo-300" : "text-slate-400"
                            }`}
                            title={txId}
                          >
                            {txId}
                          </span>
                          <button
                            onClick={() => handleCopyId(txId)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700/80 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Copy Transaction ID"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-5 sm:px-6 py-4">
                        <div className="font-semibold text-slate-200">
                          {payment.user?.name || "Anonymous / Guest"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {payment.user?.email || "-"}
                        </div>
                      </td>

                      {/* Retail Price */}
                      <td className="px-5 sm:px-6 py-4 font-medium text-slate-400 text-xs">
                        {isDiscounted ? (
                          <span className="line-through text-slate-500">
                            ₹{(payment.amount / 100).toFixed(2)}
                          </span>
                        ) : (
                          `₹${(payment.amount / 100).toFixed(2)}`
                        )}
                      </td>

                      {/* Real Paid (Cash) */}
                      <td className="px-5 sm:px-6 py-4">
                        {actualPaid > 0 ? (
                          <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-xs">
                            ₹{(actualPaid / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded text-xs">
                            ₹0.00 (Free Pass)
                          </span>
                        )}
                      </td>

                      {/* Coupon Used */}
                      <td className="px-5 sm:px-6 py-4 text-xs font-medium">
                        {payment.coupon?.code ? (
                          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg uppercase tracking-wider font-extrabold inline-flex items-center gap-1">
                            <Tag className="w-3 h-3 text-amber-400" /> {payment.coupon.code}
                          </span>
                        ) : payment.couponId ? (
                          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg uppercase tracking-wider font-extrabold">
                            Applied
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Template / Demo */}
                      <td className="px-5 sm:px-6 py-4">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider">
                          {payment.demoId || payment.plan || "Template"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 sm:px-6 py-4">
                        {payment.status === "SUCCESS" ? (
                          <span className="text-emerald-400 inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SUCCESS
                          </span>
                        ) : payment.status === "PENDING" ? (
                          <span className="text-amber-400 inline-flex items-center gap-1.5 text-xs font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> PENDING
                          </span>
                        ) : (
                          <span className="text-rose-400 inline-flex items-center gap-1.5 text-xs font-medium bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> {payment.status}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 sm:px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                        <div className="font-medium text-slate-300">
                          {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(payment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Enhanced Pagination Footer Bar ── */}
        {filteredPayments.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-[#0d1322] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Range & Page Size */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-slate-400 w-full sm:w-auto">
              <span>
                Showing <span className="text-white font-bold">{startIndex + 1}</span> to{" "}
                <span className="text-white font-bold">{endIndex}</span> of{" "}
                <span className="text-white font-bold">{filteredPayments.length}</span> transactions
              </span>

              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-[#0a0f1e] border border-slate-700 rounded-lg text-slate-200 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1e] text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1e] text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers(safePage, totalPages).map((p, idx) =>
                  typeof p === "number" ? (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        safePage === p
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-950 border border-indigo-500"
                          : "bg-[#0a0f1e] border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={idx} className="px-1 text-slate-500 font-bold select-none">
                      ...
                    </span>
                  )
                )}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1e] text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1e] text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
