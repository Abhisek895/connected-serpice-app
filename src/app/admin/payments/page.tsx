"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, ShieldAlert } from "lucide-react";
import { getAdminPayments } from "@/app/admin/actions";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await getAdminPayments();
        if (res.success) {
          setPayments(res.payments);
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
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-400" /> Payment Received
        </h2>
        <p className="text-slate-400 text-sm mt-1">View all transactions and payment history.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Final Amount</th>
                <th className="px-6 py-4 font-semibold">Coupon Used</th>
                <th className="px-6 py-4 font-semibold">Template</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {payment.razorpayPaymentId || payment.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{payment.user?.name || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{payment.user?.email || "-"}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      ₹{(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-medium text-indigo-400">
                      {payment.finalAmount !== null ? `₹${(payment.finalAmount / 100).toFixed(2)}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {payment.couponId && payment.coupon ? (
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider">{payment.coupon.code}</span>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                        {payment.demoId || payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === "SUCCESS" ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> SUCCESS
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1.5 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> {payment.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
