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
}

export default function AuthScreen({ onLoginSuccess, isDarkMode }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"Developer" | "Facility Manager">("Developer");
  const [organization, setOrganization] = useState("Wandera Investments Ltd");
  
  const [showPassword, setShowPassword] = useState(false);
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
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200 ${
      isDarkMode ? "bg-slate-950 text-slate-105" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Dynamic Background visual ornaments */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-sky-500/10 to-transparent blur-[125px] pointer-events-none" />
      <div className="absolute -inset-0 bg-[linear-gradient(to_right,#1e293b0e_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a55_1px,transparent_1px),linear-gradient(to_bottom,#0f172a55_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand presentation card */}
        <div className="lg:col-span-5 space-y-6 text-left hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-3 rounded-2xl border border-emerald-400/20 shadow-lg text-slate-950">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-500 tracking-widest block font-display">
                Enterprise Suite
              </span>
              <h1 className="text-xl font-black text-slate-950 dark:text-white font-display tracking-tight leading-none mt-1">
                BLCTS PORTAL
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-snug">
              Maximize Asset Integrity, Eliminate First-Cost Bias
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Nairobi&apos;s leading platform optimizing commercial building structures. Forecast 25-Year cumulative material wear, track active solar utility yields, and streamline mobile contractor payouts securely.
            </p>
          </div>

          {/* Core Feature bullet outline */}
          <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-emerald-500/10 text-emerald-400 p-1 rounded-lg border border-emerald-500/10 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display">
                  Live IoT Telemetry Loop
                </h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5 leading-snug">
                  Continuously streams temperature, power factor, pressure anomalies, and vibration offsets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-sky-500/10 text-sky-400 p-1 rounded-lg border border-sky-500/10 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display">
                  TCO Forecast Engine
                </h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5 leading-snug">
                  Visualizes actual cumulative outlays across a 30-year operational horizon in beautiful charts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-amber-500/10 text-amber-500 p-1 rounded-lg border border-amber-500/10 shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display">
                  Safaricom Daraja API Sync
                </h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5 leading-snug">
                  Execute instant contractor M-Pesa payouts directly inside the maintenance log hub.
                </p>
              </div>
            </div>
          </div>

          {/* Quick-select profiles banner info */}
          <div className="p-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-slate-550 dark:text-slate-400 leading-normal">
              Need a test login? Select one of the quick validation credentials on the right pane to pre-fill accounts effortlessly.
            </span>
          </div>
        </div>

        {/* Right Side: Responsive Auth Card panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-[0_15px_60px_-15px_rgba(0,0,0,0.1)] p-6 sm:p-8 relative">
          
          {/* Logo flag for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm font-display uppercase tracking-widest text-slate-900 dark:text-white">
              BLCTS Portal
            </span>
          </div>

          <AnimatePresence mode="wait">
            {authStatus === "idle" ? (
              <motion.div
                key="auth-form-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Form Navigation Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl font-bold">
                  <button
                    onClick={() => { setActiveTab("login"); setError(null); }}
                    className={`flex-1 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                      activeTab === "login"
                        ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-emerald-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setActiveTab("signup"); setError(null); }}
                    className={`flex-1 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                      activeTab === "signup"
                        ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-emerald-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Register Account
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight font-display">
                    {activeTab === "login" ? "Welcome Back to BLCTS" : "Create Enterprise Account"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
                    {activeTab === "login" 
                      ? "Sign in to review asset durability metrics and invoice registers" 
                      : "Register to manage municipalities structure catalogs and logs"
                    }
                  </p>
                </div>

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
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}