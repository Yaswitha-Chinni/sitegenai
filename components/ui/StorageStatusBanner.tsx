"use client";

import React, { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Database, ShieldAlert, CheckCircle, Info, X } from "lucide-react";

export default function StorageStatusBanner() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  if (configured === null || dismissed) return null;

  return (
    <>
      <div
        className={`px-3 py-1 text-center small border-bottom d-flex align-items-center justify-content-center gap-2 ${
          configured ? "bg-success-subtle text-success border-success-subtle" : "bg-warning-subtle text-dark border-warning-subtle"
        }`}
        style={{ fontSize: "0.82rem" }}
      >
        {configured ? (
          <>
            <CheckCircle size={14} className="text-success" />
            <span className="fw-semibold">Supabase PostgreSQL Connected:</span>
            <span>Cloud persistence & row-level security active.</span>
          </>
        ) : (
          <>
            <Database size={14} className="text-warning-emphasis" />
            <span className="fw-bold">Local Storage Dev Fallback Active:</span>
            <span className="d-none d-md-inline">
              Supabase credentials not configured in .env.local. Projects are safely stored in browser local storage.
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-link btn-sm p-0 text-primary fw-bold text-decoration-none"
            >
              [View Supabase Setup]
            </button>
          </>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="btn btn-sm btn-link text-secondary p-0 ms-auto"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Database className="text-primary" />
                  Supabase Database & Persistence Setup
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-secondary">
                  SiteGenAI supports Supabase PostgreSQL for team collaboration, cloud projects, and secure asset storage.
                  When credentials are not set, SiteGenAI uses an isolated, fully functional local development storage mode.
                </p>

                <h6 className="fw-bold mb-2">Step 1: Run SQL Schema Migration</h6>
                <p className="small text-secondary mb-2">
                  Execute the provided SQL schema file located at <code>sitegenai/supabase/schema.sql</code> in your Supabase SQL Editor.
                  It configures tables for projects, assets, promo videos, templates, and Row-Level Security (RLS) policies.
                </p>

                <h6 className="fw-bold mb-2">Step 2: Add Keys to .env.local</h6>
                <pre className="p-3 bg-dark text-light rounded-3 small">
                  <code>{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here\nSUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}</code>
                </pre>

                <div className="alert alert-info d-flex align-items-center gap-2 mb-0 py-2">
                  <Info size={18} />
                  <span className="small">
                    Your current local storage data is preserved and will remain accessible even in fallback mode.
                  </span>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setShowModal(false)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
