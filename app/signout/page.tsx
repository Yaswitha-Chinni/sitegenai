"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LogOut, Sparkles, Home, LogIn } from "lucide-react";

export default function SignOutPage() {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("sitegenai_admin_token");
      sessionStorage.clear();
      setCleared(true);
    } catch {}
  }, []);

  return (
    <div
      className="d-flex flex-column min-vh-100 text-white position-relative"
      style={{ backgroundColor: "#0B0D12" }}
    >
      <Navbar />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 position-relative">
        {/* Ambient glow blobs */}
        <div
          className="position-absolute rounded-circle pointer-events-none"
          style={{
            width: 450,
            height: 450,
            background: "radial-gradient(circle, rgba(163, 255, 111, 0.1) 0%, transparent 70%)",
            top: "10%",
            left: "15%",
            filter: "blur(60px)",
          }}
        />

        <div className="container position-relative text-center" style={{ zIndex: 2, maxWidth: 540 }}>
          <div
            className="card-3d-tilt card-spotlight p-4 p-md-5 rounded-4 shadow-2xl"
            style={{
              backgroundColor: "#151A24",
              border: "1px solid #303947",
            }}
          >
            <div
              className="d-inline-flex p-3 rounded-circle mb-3"
              style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
            >
              <LogOut size={36} />
            </div>

            <div>
              <span
                className="badge rounded-pill mb-2 px-3 py-1.5 fw-semibold"
                style={{
                  backgroundColor: "rgba(163, 255, 111, 0.15)",
                  border: "1px solid rgba(163, 255, 111, 0.3)",
                  color: "#A3FF6F",
                }}
              >
                Session Ended
              </span>
            </div>

            <h2 className="fw-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
              You Have Signed Out
            </h2>
            <p className="small mb-4" style={{ color: "#D1D5DB" }}>
              Your session has ended securely. Your local drafts, projects, and stock photo collections remain safely stored in your browser workspace.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mb-3">
              <Link
                href="/login"
                className="py-2.5 px-4 d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold text-decoration-none"
                style={{
                  backgroundColor: "#A3FF6F",
                  color: "#0B0D12",
                  boxShadow: "0 0 16px rgba(163, 255, 111, 0.25)",
                }}
              >
                <LogIn size={16} />
                Sign In Again
              </Link>
              <Link
                href="/"
                className="btn btn-outline-secondary py-2.5 px-4 d-flex align-items-center justify-content-center gap-2 rounded-pill text-white text-decoration-none"
                style={{
                  borderColor: "#303947",
                  backgroundColor: "#10141C",
                }}
              >
                <Home size={16} />
                Return to Home
              </Link>
            </div>

            <div className="pt-3 border-top" style={{ borderColor: "#303947" }}>
              <Link
                href="/templates"
                className="small text-decoration-none d-inline-flex align-items-center gap-1.5 fw-medium"
                style={{ color: "#BFC7D2" }}
              >
                <Sparkles size={14} style={{ color: "#A3FF6F" }} />
                Browse Website Templates &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
