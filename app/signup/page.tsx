"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, Lock, Mail, User, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Please accept the terms to create an account.");
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });
        setLoading(false);
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        setSuccessMessage("Account created with Supabase! Redirecting to studio...");
        setTimeout(() => router.push("/create"), 700);
        return;
      }
    }

    // Local dev
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Account created successfully! Redirecting to studio...");
      setTimeout(() => {
        router.push("/create");
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
          maxWidth: 480,
          backgroundColor: "#151A24",
          border: "1px solid #303947",
          borderRadius: 20,
          zIndex: 2,
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
            Create Your Account
          </h3>
          <p className="small mb-0" style={{ color: "#D1D5DB" }}>
            Start designing and synthesizing websites with SiteGenAI.
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

        <form onSubmit={handleSignup} noValidate>
          <div className="mb-3">
            <label htmlFor="signup-name" className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
              Full Name
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
                <User size={16} />
              </span>
              <input
                id="signup-name"
                type="text"
                className="form-control text-white border-start-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#FFFFFF",
                }}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="signup-email" className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
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
                id="signup-email"
                type="email"
                className="form-control text-white border-start-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#FFFFFF",
                }}
                placeholder="jane@company.com"
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
            <label htmlFor="signup-password" className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
              Password
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
                <Lock size={16} />
              </span>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                className="form-control text-white border-start-0 border-end-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#FFFFFF",
                }}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                required
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="signup-confirm-password" className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
              Confirm Password
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
                <Lock size={16} />
              </span>
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                className="form-control text-white border-start-0"
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#FFFFFF",
                }}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                required
              />
            </div>
          </div>

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ accentColor: "#A3FF6F" }}
            />
            <label className="form-check-label small" htmlFor="agreeTerms" style={{ color: "#D1D5DB" }}>
              I agree to the Terms of Service and Privacy Policy
            </label>
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
            id="signup-submit-btn"
          >
            {loading ? "Creating Account..." : "Create Account Free"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-3 border-top small" style={{ borderColor: "#303947", color: "#BFC7D2" }}>
          Already have an account?{" "}
          <Link href="/login" className="fw-bold text-decoration-none" style={{ color: "#A3FF6F" }}>
            Sign In
          </Link>
        </div>
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
