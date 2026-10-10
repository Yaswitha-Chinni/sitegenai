"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

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
            Reset Password
          </h3>
          <p className="small mb-0" style={{ color: "#D1D5DB" }}>
            Enter your email to receive recovery instructions.
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

        {submitted ? (
          <div className="text-center py-3">
            <div
              className="d-inline-flex p-3 rounded-circle mb-3"
              style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h5 className="fw-bold mb-2 text-white">Check Your Inbox</h5>
            <p className="small mb-4" style={{ color: "#D1D5DB" }}>
              We sent password recovery instructions to <strong className="text-white">{email}</strong>.
            </p>
            <Link
              href="/login"
              className="w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-pill text-decoration-none"
              style={{
                backgroundColor: "#A3FF6F",
                color: "#0B0D12",
                boxShadow: "0 0 20px rgba(163, 255, 111, 0.3)",
              }}
            >
              Back to Sign In
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="reset-email" className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
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
                  id="reset-email"
                  type="email"
                  className="form-control text-white border-start-0"
                  style={{
                    backgroundColor: "#10141C",
                    borderColor: "#303947",
                    color: "#FFFFFF",
                  }}
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
              className="w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 mb-3 fw-bold rounded-pill"
              style={{
                backgroundColor: "#A3FF6F",
                color: "#0B0D12",
                border: "none",
                boxShadow: "0 0 20px rgba(163, 255, 111, 0.3)",
                transition: "all 0.2s ease",
              }}
              disabled={loading}
              id="forgot-submit-btn"
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              ) : null}
              {loading ? "Sending Link..." : "Send Reset Link"}
            </button>

            <div className="text-center pt-3 border-top small" style={{ borderColor: "#303947" }}>
              <Link
                href="/login"
                className="text-decoration-none d-inline-flex align-items-center gap-1.5 fw-medium"
                style={{ color: "#BFC7D2" }}
              >
                <ArrowLeft size={14} />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
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
