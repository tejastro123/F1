"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, LogIn, UserPlus, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/f1Store";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useUserStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      login(username);
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--f1-red)] opacity-[0.02] blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-[rgba(10,10,15,0.8)] border border-[var(--f1-gray)] backdrop-blur-xl relative overflow-hidden shadow-2xl"
        style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
      >
        {/* Header Decor */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
        
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-[var(--f1-red)] flex items-center justify-center shadow-[0_0_20px_rgba(225,6,0,0.5)]"
              style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}>
              <Flag size={20} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-orbitron font-bold text-2xl text-white tracking-widest uppercase">
              {isLogin ? "PIT WALL ACCESS" : "REGISTER PROFILE"}
            </h1>
            <p className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mt-2 uppercase">
              {isLogin ? "Enter your credentials to continue" : "Create your telemetry account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest uppercase">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--f1-gray-light)] group-focus-within:text-[var(--f1-red)] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="tejas@pitwall.pro"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--f1-gray)] px-12 py-4 font-mono text-xs text-white focus:outline-none focus:border-[var(--f1-red)] focus:bg-[rgba(225,6,0,0.05)] transition-all hover:border-[var(--f1-gray-light)] placeholder:text-white/20"
                    style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest uppercase">
                Call Sign / Username
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--f1-gray-light)] group-focus-within:text-[var(--f1-red)] transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--f1-gray)] px-12 py-4 font-mono text-xs text-white focus:outline-none focus:border-[var(--f1-red)] focus:bg-[rgba(225,6,0,0.05)] transition-all hover:border-[var(--f1-gray-light)] placeholder:text-white/20"
                  style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest uppercase flex justify-between">
                <span>Security Code</span>
                {isLogin && <button type="button" className="text-[var(--f1-gray-light)] hover:text-white transition-colors">Forgot?</button>}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--f1-gray-light)] group-focus-within:text-[var(--f1-red)] transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--f1-gray)] px-12 py-4 font-mono text-xs text-white focus:outline-none focus:border-[var(--f1-red)] focus:bg-[rgba(225,6,0,0.05)] transition-all hover:border-[var(--f1-gray-light)] placeholder:text-white/20 tracking-widest"
                  style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[var(--f1-red)] text-white font-orbitron font-bold text-sm tracking-widest hover:bg-[#c10500] transition-all disabled:opacity-50 relative overflow-hidden group"
                style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-3">
                  {isSubmitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <ShieldCheck size={18} />
                    </motion.div>
                  ) : isLogin ? (
                    <LogIn size={18} />
                  ) : (
                    <UserPlus size={18} />
                  )}
                  {isSubmitting ? "AUTHENTICATING..." : isLogin ? "INITIALIZE SESSION" : "CREATE PROFILE"}
                </span>
              </button>
            </div>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center border-t border-[var(--f1-gray)]/50 pt-6">
            <p className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              {isLogin ? "No access credentials?" : "Already have a profile?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-[var(--f1-red)] hover:text-white transition-colors underline underline-offset-4 decoration-[var(--f1-red)]/30 hover:decoration-white"
              >
                {isLogin ? "Request Access" : "Login Here"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
