"use client"

import { useState } from "react"
import { Settings, User, Mail, CreditCard, Shield, Zap, Lock, Key } from "lucide-react"

type UserProps = {
  displayName: string;
  displayEmail: string;
  plan: string;
};

export default function SettingsClient({ user }: { user: UserProps }) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Navigation Sidebar for Settings (Internal) */}
      <div className="col-span-1 space-y-2">
        <button 
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
            activeTab === "profile" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </button>
        <button 
          onClick={() => setActiveTab("billing")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
            activeTab === "billing" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Billing & Plan
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
            activeTab === "security" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
          }`}
        >
          <Shield className="w-5 h-5" />
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
                    <input type="text" defaultValue={user.displayName} className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" defaultValue={user.displayEmail} disabled className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-10 pr-4 py-3 text-slate-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition">
                  Save Changes
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
                 <h4 className="font-bold text-slate-900 mb-4">Payment Methods</h4>
                 <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                       <CreditCard className="w-6 h-6 text-slate-400" />
                       <div>
                         <p className="font-medium text-slate-700">Visa ending in 4242</p>
                         <p className="text-xs text-slate-500">Expires 12/28</p>
                       </div>
                    </div>
                    <button className="text-rose-500 text-sm font-bold hover:text-rose-600">Edit</button>
                 </div>
                 <button className="text-slate-600 text-sm font-medium hover:text-slate-900 flex items-center gap-2">
                    + Add Payment Method
                 </button>
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
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                    <div className="relative">
                      <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" placeholder="New password" className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700" />
                    </div>
                  </div>
                  <button className="w-full px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition mt-2">
                    Update Password
                  </button>
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
                  <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition">
                    Enable 2FA
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
