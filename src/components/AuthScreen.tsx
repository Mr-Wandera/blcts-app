<<<<<<< HEAD
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { supabase } from '../lib/supabase';
import { 
  Building2, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Briefcase, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  KeyRound,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { User } from "../types";
import { motion, AnimatePresence } from "motion/react";

// Enterprise Design System Components - Path corrected to match your setup
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  isDarkMode: boolean;
=======
import { useState } from 'react';
import { Building2, Eye, EyeOff, LogIn, Shield, Lock } from 'lucide-react';
import type { User } from '../types';

const DEMO_ACCOUNTS: (User & { password: string })[] = [
  { id: 'demo-admin-001', name: 'Admin User', email: 'admin@blcts.ke', password: 'admin123', role: 'Administrator', organization: 'BLCTS HQ' },
  { id: 'demo-owner-001', name: 'James Kariuki', email: 'owner@blcts.ke', password: 'owner123', role: 'Building Owner', organization: 'Nairobi Properties Ltd' },
  { id: 'demo-fm-001', name: 'Grace Wanjiku', email: 'fm@blcts.ke', password: 'fm123', role: 'Facility Manager', organization: 'FM Services Kenya' },
];

const ROLE_STYLES: Record<string, { border: string; badge: string; dot: string }> = {
  Administrator: {
    border: 'border-violet-200 dark:border-violet-800/50 hover:border-violet-300 dark:hover:border-violet-700',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  'Building Owner': {
    border: 'border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700',
    badge: 'bg-blue-100 text-emerald-700 dark:bg-blue-950/40 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  'Facility Manager': {
    border: 'border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
};

interface Props {
  onLogin: (user: User) => void;
>>>>>>> e32241b59a56f90f714875afe8c4a1450d219a81
}

export function AuthScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState<string | null>(null);
  
  // Simulation states
  const [authStatus, setAuthStatus] = useState<"idle" | "verifying" | "syncing_sensor" | "finalizing" | "success">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const handleQuickLogin = (preset: "admin" | "manager") => {
    setError(null);
    if (preset === "admin") {
      setEmail("wanderaabdulwahab4@gmail.com");
      setPassword("executivePass123");
      setName("Abdulwahab Wandera");
      setRole("Developer");
      setOrganization("Wandera Investments Ltd");
      setPhone("+254 712 345 678");
    } else if (preset === "manager") {
      setEmail("manager.thika@blcts.com");
      setPassword("managerPass99");
      setName("Kamau Njoroge");
      setRole("Facility Manager");
      setOrganization("Thika Block Management");
      setPhone("+254 722 987 654");
    }
    // Select login tab automatically
    setActiveTab("login");
  };

  const executeAuthSimulation = (userPayload: User) => {
    setAuthStatus("verifying");
    setSyncMessage("Authenticating credentials & establishing session...");
    
    setTimeout(() => {
      setAuthStatus("syncing_sensor");
      setSyncMessage("Synchronizing local building IoT sensors and thermal logs...");
    }, 1200);

    setTimeout(() => {
      setAuthStatus("finalizing");
      setSyncMessage("Establishing secure Daraja M-PESA sandbox gateway...");
    }, 2400);

    setTimeout(() => {
      setAuthStatus("success");
      setSyncMessage("Verification complete. Redirecting you to the asset deck...");
      setTimeout(() => {
        onLoginSuccess(userPayload);
      }, 700);
    }, 3500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all standard credential fields.");
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.session) {
        const userPayload: User = {
          id: data.session.user.id,
          name: data.session.user.user_metadata?.name || "Authorized User",
          email: data.session.user.email || email,
          role: data.session.user.user_metadata?.role || "Facility Manager",
          organization: data.session.user.user_metadata?.organization || "Enterprise Org",
          phone: data.session.user.user_metadata?.phone || ""
        };
        executeAuthSimulation(userPayload);
      }
    } catch (err) {
      setError("System connectivity error during verification.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !name) {
      setError("Please fill in Name, Email, and Password.");
      return;
    }

    if (password.length < 6) {
      setError("For proper security, passwords require at least 6 characters.");
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name,
            role,
            organization: organization || "Municipal Land Management",
            phone: phone || "+254 700 000 000"
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.session || data.user) {
        const userPayload: User = {
          id: data.user?.id || `user-${Date.now()}`,
          name: name,
          email: email,
          role: role as any,
          organization: organization,
          phone: phone
        };
        executeAuthSimulation(userPayload);
      }
    } catch (err) {
      setError("System encryption error during registration.");
    }
=======
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const match = DEMO_ACCOUNTS.find(
        a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      );
      if (!match) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }
      const user: User = { id: match.id, name: match.name, email: match.email, role: match.role, organization: match.organization };
      localStorage.setItem('blcts_user', JSON.stringify(user));
      onLogin(user);
      setLoading(false);
    }, 400);
>>>>>>> e32241b59a56f90f714875afe8c4a1450d219a81
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[200px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-xl shadow-emerald-600/30">
              <Building2 className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0f1e] animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">BLCTS</h1>
          <p className="text-xs text-slate-500 tracking-widest uppercase mt-1">Building Lifecycle Cost Intelligence</p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Sign in to your account</h2>
            <p className="text-sm text-slate-400">Use your credentials or select a demo account below</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/12 bg-white/6 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-white/12 bg-white/6 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

<<<<<<< HEAD
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/40 text-red-800 dark:text-rose-350 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
                    <span className="shrink-0">•</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submitting Forms */}
                <form onSubmit={activeTab === "login" ? handleLoginSubmit : handleSignupSubmit} className="space-y-4 text-left">
                  
                  {activeTab === "signup" && (
                    <Input
                      label="Full Name *"
                      type="text"
                      required
                      placeholder="e.g. Abdulwahab Wandera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      icon={<UserIcon className="w-4 h-4" />}
                    />
                  )}

                  <Input
                    label="Work Email *"
                    type="email"
                    required
                    placeholder="e.g. wanderaabdulwahab4@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                  />

                  {/* Standard details for user customization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 w-full">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
                        System Role Profile *
                      </label>
                      <div className="relative w-full">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 pl-10 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="Developer">Developer</option>
                          <option value="Facility Manager">Facility Manager</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      label="Mobile Money Contact (KES Draw)"
                      type="tel"
                      placeholder="e.g. +254 712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      icon={<Phone className="w-4 h-4" />}
                      className="font-mono"
                    />
                  </div>

                  {activeTab === "signup" && (
                    <Input
                      label="Corporate Organization"
                      type="text"
                      placeholder="e.g. Wandera Investments Ltd"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  )}

                  <div className="space-y-1.5 w-full">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
                        Secret Password *
                      </label>
                      {activeTab === "login" && (
                        <button type="button" className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
                          Forgot passcode?
                        </button>
                      )}
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                      className="font-mono"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-6"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {activeTab === "login" ? "Verify Credentials" : "Initialize Infrastructure Profile"}
                  </Button>
                </form>

                {/* Quick login preset triggers - Absolute Craft polish for effortless testing */}
                <div className="border-t border-slate-150 dark:border-slate-800/80 pt-5 space-y-3">
                  <div className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider text-center font-display">
                    🎯 Quick Validation Presets (Self-Testing)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("admin")}
                      className="border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl text-left transition-all hover:bg-white dark:hover:bg-slate-900 group cursor-pointer"
                    >
                      <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Wandera SaaS</div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-400 mt-0.5">Admin Executive</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">wanderaabdulwahab4@...</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin("manager")}
                      className="border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl text-left transition-all hover:bg-white dark:hover:bg-slate-900 group cursor-pointer"
                    >
                      <div className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Kamau Njoroge</div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-sky-450 mt-0.5">Facility Manager</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">manager.thika@blcts.com</div>
                    </button>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="auth-sync-simulation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6"
              >
                {/* Advanced Sync Circle indicator */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-20 w-20 rounded-full bg-emerald-500/10 animate-pulse border border-emerald-500/20" />
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 text-emerald-400 shadow-xl relative z-10">
                    <Cpu className="w-10 h-10 animate-spin" style={{ animationDuration: "3s" }} />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-500 font-display">
                    Secure Handshake Sequence
                  </h3>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    Initializing Infrastructure Console...
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono px-4 h-10">
                    {syncMessage}
                  </p>
                </div>

                {/* Loading bar */}
                <div className="w-48 bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ 
                      width: 
                        authStatus === "verifying" ? "33%" : 
                        authStatus === "syncing_sensor" ? "66%" : 
                        authStatus === "finalizing" ? "90%" : "100%" 
                    }}
                  />
                </div>
              </motion.div>
=======
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-rose-400 bg-rose-950/30 border border-rose-800/50 rounded-xl px-3.5 py-2.5">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
>>>>>>> e32241b59a56f90f714875afe8c4a1450d219a81
            )}

            {/* Submit */}
            <button type="submit"
              disabled={loading || !email || !password}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 hover:-translate-y-px"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Demo Accounts — Click to autofill
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {DEMO_ACCOUNTS.map(account => {
              const styles = ROLE_STYLES[account.role];
              return (
                <button key={account.id} type="button"
                  onClick={() => { setEmail(account.email); setPassword(account.password); setError(''); }}
                  className={`group relative flex flex-col items-start gap-2 p-3 rounded-xl bg-white/4 border ${styles.border} transition-all hover:bg-white/6 text-left`}
                >
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${styles.dot}`} />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${styles.badge}`}>
                    {account.role === 'Administrator' ? 'Admin' : account.role === 'Building Owner' ? 'Owner' : 'FM'}
                  </span>
                  <div className="w-full">
                    <p className="text-[10px] font-semibold text-slate-300 truncate group-hover:text-white transition">{account.email}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-wide">{account.password}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 justify-center">
            <Lock className="w-3 h-3 text-slate-600" />
            <p className="text-[10px] text-slate-600 text-center">
              New accounts are created by the Administrator · Admin registration is disabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}