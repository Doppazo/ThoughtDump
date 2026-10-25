"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowRight, Loader2, Sparkles, KeyRound } from "lucide-react";

export function AuthScreen() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInDemoUser,
    isFirebaseReady,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--paper)] font-body text-[var(--ink)]">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow)] space-y-6">
        {/* App Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[var(--pen)] text-white items-center justify-center font-display font-extrabold text-2xl shadow-md mb-1">
            T
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-[var(--ink)]">
            Thought <span className="mark">Dump</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Dump it all here. The AI sorts it into your second brain.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs rounded-xl bg-[var(--t-reminder-bg)] text-[var(--t-reminder)] border border-[var(--t-reminder)] font-mono">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)] text-xs sm:text-sm font-bold text-[var(--ink)] shadow-sm transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--line)] w-full" />
          <span className="bg-[var(--surface)] px-3 text-[11px] font-mono uppercase text-[var(--muted)] absolute">
            or
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono text-[var(--muted)] mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@bentley.edu"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] placeholder:text-[var(--muted)] text-sm focus:outline-none focus:border-[var(--pen)]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--muted)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] placeholder:text-[var(--muted)] text-sm focus:outline-none focus:border-[var(--pen)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[var(--pen)] hover:brightness-105 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Create Account" : "Sign In with Email"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[var(--muted)] hover:text-[var(--pen)] transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Instant Demo Login Button */}
        <div className="pt-2 border-t border-[var(--line)] text-center">
          <button
            type="button"
            onClick={signInDemoUser}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[var(--pen)] bg-[var(--pen-soft)] text-[var(--pen)] hover:bg-[var(--pen-soft)]/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Demo Student Brain</span>
          </button>
          <p className="text-[10px] text-[var(--muted)] mt-1.5 font-mono">
            Explore with pre-seeded thoughts and test all features instantly
          </p>
        </div>
      </div>
    </div>
  );
}
