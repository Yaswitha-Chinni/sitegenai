"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, Lock, Mail, User, CheckCircle2, AlertCircle } from "lucide-react";
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
        setTimeout(() => router.push("/create"), 800);
        return;
      }
    }

    // Local dev fallback
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Account initialized in Local Dev Mode! Redirecting to studio...");
      setTimeout(() => {
        router.push("/create");
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

      <div className="sg-card p-4 p-sm-5 bg-white shadow-lg w-100" style={{ maxWidth: 460 }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-1">Create Your Account</h3>
          <p className="text-secondary small">
            Start designing and synthesizing websites with SiteGenAI.
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

        <form onSubmit={handleSignup} noValidate>
          <div className="mb-3">
            <label htmlFor="signup-name" className="sg-form-label">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <User size={16} />
              </span>
              <input
                id="signup-name"
                type="text"
                className="form-control sg-form-control border-start-0 ps-0"
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
            <label htmlFor="signup-email" className="sg-form-label">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Mail size={16} />
              </span>
              <input
                id="signup-email"
                type="email"
                className="form-control sg-form-control border-start-0 ps-0"
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
            <label htmlFor="signup-password" className="sg-form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Lock size={16} />
              </span>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                className="form-control sg-form-control border-start-0 border-end-0 ps-0"
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
                className="btn btn-light border border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="signup-confirm-password" className="sg-form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Lock size={16} />
              </span>
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                className="form-control sg-form-control border-start-0 ps-0"
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
            />
            <label className="form-check-label small text-secondary" htmlFor="agreeTerms">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-sg-primary w-100 py-2 mb-3"
            disabled={loading}
            id="signup-submit-btn"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-top small text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="fw-bold text-primary text-decoration-none">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
