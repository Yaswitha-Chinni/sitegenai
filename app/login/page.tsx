"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight, Lock, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        setSuccessMessage("Authenticated via Supabase! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 800);
        return;
      }
    }

    // Local Dev fallback
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Local dev session active (Supabase not configured). Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }, 600);
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      {/* Brand Header */}
      <Link href="/" className="sg-brand-logo mb-4 text-decoration-none">
        <div className="sg-logo-icon">
          <Sparkles size={20} />
        </div>
        <span>SiteGen<span style={{ color: "var(--sg-primary)" }}>AI</span></span>
      </Link>

      <div className="sg-card p-4 p-sm-5 bg-white shadow-lg w-100" style={{ maxWidth: 440 }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-1">Welcome Back</h3>
          <p className="text-secondary small">
            Sign in to access your projects and visual editor.
          </p>
        </div>

        {/* Storage State Notice */}
        <div className="p-2 mb-3 rounded-2 bg-light border small text-muted text-center">
          {isSupabaseConfigured() ? (
            <span className="text-success fw-medium">Supabase Auth Connected</span>
          ) : (
            <span>Local Storage Dev Fallback Active</span>
          )}
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="mb-3">
            <label htmlFor="login-email" className="sg-form-label">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Mail size={16} />
              </span>
              <input
                id="login-email"
                type="email"
                className="form-control sg-form-control border-start-0 ps-0"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="login-password" className="sg-form-label mb-0">Password</label>
              <Link href="/forgot-password" className="small text-primary text-decoration-none">
                Forgot password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Lock size={16} />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-control sg-form-control border-start-0 border-end-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                required
              />
              <button
                type="button"
                className="btn btn-light border border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-sg-primary w-100 py-2 mt-2 mb-3"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-top small text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="fw-bold text-primary text-decoration-none">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
