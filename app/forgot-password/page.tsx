"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
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
          <h3 className="fw-bold mb-1">Reset Password</h3>
          <p className="text-secondary small">
            Enter your email to receive simulated password recovery instructions.
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-3">
            <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
              <CheckCircle2 size={36} />
            </div>
            <h5 className="fw-bold mb-2">Check Your Inbox</h5>
            <p className="small text-secondary mb-4">
              We sent a simulated recovery link to <strong>{email}</strong>. In Phase 2, this will send an active Supabase recovery token.
            </p>
            <Link href="/login" className="btn btn-sg-primary w-100 py-2">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="reset-email" className="sg-form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <Mail size={16} />
                </span>
                <input
                  id="reset-email"
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

            <button
              type="submit"
              className="btn btn-sg-primary w-100 py-2 mb-3"
              disabled={loading}
              id="forgot-submit-btn"
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="text-center pt-3 border-top small">
              <Link href="/login" className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1">
                <ArrowLeft size={14} />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
