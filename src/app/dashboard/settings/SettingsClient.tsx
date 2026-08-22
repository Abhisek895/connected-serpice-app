"use client"

import { useState } from "react"
import { User, Mail, CreditCard, Shield, Zap, Lock, Key, Loader2, CheckCircle2, Eye, EyeOff, Save } from "lucide-react"

type UserProps = {
  displayName: string;
  displayEmail: string;
  plan: string;
};

export default function SettingsClient({ user }: { user: UserProps }) {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Update State
  const [displayName, setDisplayName] = useState(user.displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleSaveProfile = async () => {
    setSaveSuccess(""); setSaveError(""); setIsSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess("Profile updated successfully!");
        setTimeout(() => setSaveSuccess(""), 3500);
      } else {
        setSaveError(data.error || "Failed to save profile.");
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Password Visibility Toggle
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleRequestOtp = async () => {
    setError("");
    setSuccessMsg("");
    if (!currentPassword || !newPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
      } else {
        setError(data.error || "Failed to request OTP.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccessMsg("");
    if (!otp) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Password updated successfully!");
        // Reset states
        setCurrentPassword("");
        setNewPassword("");
        setOtp("");
        setIsOtpSent(false);
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      
      {/* Navigation Tabs for Settings (Responsive: Horizontal scroll on mobile, vertical list on desktop) */}
      <div className="flex overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0 scrollbar-none shrink-0">
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition ${
            activeTab === "profile" 
              ? "bg-slate-900 text-white shadow-md" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button 
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition ${
            activeTab === "billing" 
              ? "bg-slate-900 text-white shadow-md" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Billing & Plan
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition ${
            activeTab === "security" 
              ? "bg-slate-900 text-white shadow-md" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* Content Area */}
      <div className="col-span-1 md:col-span-2 space-y-6">
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Profile Information</h3>
              <p className="text-sm text-slate-500">Update your personal details.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-2xl font-bold shadow-inner">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" defaultValue={user.displayEmail} disabled className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-10 pr-4 py-3 text-slate-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Email address cannot be changed.</p>
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">{saveError}</div>
              )}
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {saveSuccess}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Current Plan</h3>
                <p className="text-sm text-slate-500">Manage your subscription and billing details.</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.plan === 'FREE' ? 'bg-slate-100 text-slate-600' : 'bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-md'}`}>
                {user.plan} Plan
              </span>
            </div>
            
            <div className="p-6">
              {user.plan === "FREE" ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                       Upgrade to Premium <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">Unlock custom domains, premium themes, and remove watermarks.</p>
                  </div>
                  <button className="whitespace-nowrap px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition">
                    Upgrade (₹99)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-green-50 text-green-800 p-4 rounded-2xl mb-6">
                   <Shield className="w-6 h-6 text-green-600" />
                   <div>
                     <p className="font-bold">You are on the Premium Plan!</p>
                     <p className="text-sm text-green-700">Thank you for your support. You have full access to all features.</p>
                   </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-6">
                 <h4 className="font-bold text-slate-900 mb-2">Payment History</h4>
                 <p className="text-sm text-slate-500 mb-4">Your payment receipts and invoices are managed via Razorpay.</p>
                 <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-600">No payment records found. Purchase a template to see your history here.</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Security Settings</h3>
              <p className="text-sm text-slate-500">Protect your account and update your password.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" /> Password
                </h4>
                <div className="space-y-4 max-w-sm">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {successMsg}
                    </div>
                  )}

                  {!isOtpSent ? (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                        <div className="relative">
                          <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={handleRequestOtp}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition mt-2 disabled:opacity-70"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Request OTP
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                        <p className="text-sm text-slate-600 mb-3">
                          We've sent a 6-digit OTP to your email. Please enter it below to confirm your password change.
                        </p>
                        
                        <div className="relative">
                          <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Enter 6-digit OTP" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700 font-mono tracking-widest" 
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button 
                          onClick={() => setIsOtpSent(false)}
                          disabled={isLoading}
                          className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition disabled:opacity-70"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleVerifyOtp}
                          disabled={isLoading}
                          className="flex-[2] flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition disabled:opacity-70"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Verify & Update
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" /> Two-Factor Authentication
                </h4>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-700">Authenticator App</p>
                    <p className="text-xs text-slate-500 mt-1">Not configured</p>
                  </div>
                  <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg">
                    🚧 Coming Soon
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
