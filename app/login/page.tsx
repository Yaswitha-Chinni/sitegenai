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
        setTimeout(() => router.push("/dashboard"), 700);
        return;
      }
    }

    // Local session
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Welcome back! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    }, 500);
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3 position-relative overflow-hidden text-white"
      style={{ backgroundColor: "#0B0D12" }}
    >
      {/* Background ambient lighting */}
      <div
        className="position-absolute rounded-circle pointer-events-none"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(163, 255, 111, 0.12) 0%, transparent 70%)",
          top: "-15%",
          left: "-10%",
          filter: "blur(60px)",
        }}
      />
      <div
        className="position-absolute rounded-circle pointer-events-none"
        style={{
          width: 450,
          height: 450,
          background: "radial-gradient(circle, rgba(139, 124, 255, 0.1) 0%, transparent 70%)",
          bottom: "-10%",
          right: "-10%",
          filter: "blur(60px)",
        }}
      />

      {/* Brand Header */}
      <Link
        href="/"
        className="text-white text-decoration-none d-flex align-items-center gap-2 fw-bold fs-3 mb-4 position-relative"
        style={{ zIndex: 2 }}
      >
        <div
          className="rounded-3 p-1.5 d-flex align-items-center justify-content-center text-dark shadow-sm"
          style={{ background: "#A3FF6F", width: 40, height: 40 }}
        >
          <Sparkles size={22} color="#0B0D12" />
        </div>
        <span>
          SiteGen<span style={{ color: "#A3FF6F" }}>AI</span>
        </span>
      </Link>

      <div
        className="card-3d-tilt card-spotlight p-4 p-sm-5 text-white w-100 position-relative shadow-2xl"
        style={{
          maxWidth: 440,
          backgroundColor: "#151A24",
          border: "1px solid #303947",
          borderRadius: 20,
          zIndex: 2,
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
            Welcome Back
          </h3>
          <p className="small mb-0" style={{ color: "#D1D5DB" }}>
            Sign in to access your projects, presets, and visual editor.
          </p>
        </div>

        {errorMessage && (
          <div
            className="alert py-2.5 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5" }}
            role="alert"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            className="alert py-2.5 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3"
            style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.3)", color: "#A3FF6F" }}
            role="alert"
          >
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
              Email Address
            </label>
            <div className="input-group">
              <span
                className="input-group-text border-end-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#BFC7D2",
                }}
              >
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-control text-white border-start-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#FFFFFF",
                }}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold mb-0" style={{ color: "#F1F5F9" }}>
                Password
              </label>
              <Link
                href="/forgot-password"
                className="small text-decoration-none fw-medium"
                style={{ color: "#A3FF6F", fontSize: "0.82rem" }}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="input-group">
              <span
                className="input-group-text border-end-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#BFC7D2",
                }}
              >
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control text-white border-start-0 border-end-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#FFFFFF",
                }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-group-text border-start-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#BFC7D2",
                }}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 mb-3 fw-bold rounded-pill"
            style={{
              backgroundColor: "#A3FF6F",
              color: "#0B0D12",
              border: "none",
              boxShadow: "0 0 20px rgba(163, 255, 111, 0.3)",
              transition: "all 0.2s ease",
            }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to SiteGenAI"}
            <ArrowRight size={16} />
          </button>

          <div className="text-center pt-2">
            <span className="small" style={{ color: "#BFC7D2" }}>
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="small fw-semibold text-decoration-none"
              style={{ color: "#A3FF6F" }}
            >
              Sign Up Free
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-4 text-center small position-relative" style={{ zIndex: 2, color: "#BFC7D2" }}>
        <Link href="/" className="text-decoration-none me-3" style={{ color: "#BFC7D2" }}>
          &larr; Back to Home
        </Link>
        <span>&bull;</span>
        <Link href="/templates" className="text-decoration-none ms-3" style={{ color: "#BFC7D2" }}>
          Browse Templates
        </Link>
      </div>
    </div>
  );
}
