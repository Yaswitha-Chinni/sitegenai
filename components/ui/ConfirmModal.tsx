"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "var(--sg-radius-md)" }}>
          <div className="modal-header border-bottom py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              {isDestructive && (
                <div className="p-2 rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center">
                  <AlertTriangle size={18} />
                </div>
              )}
              <h5 className="modal-title fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                {title}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close modal"
              onClick={onCancel}
            />
          </div>
          <div className="modal-body py-4 px-4">
            <p className="mb-0 text-secondary" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
              {message}
            </p>
          </div>
          <div className="modal-footer border-top py-3 px-4 bg-light bg-opacity-50">
            <button
              type="button"
              className="btn btn-sg-outline btn-sg-sm"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn ${isDestructive ? "btn-danger" : "btn-sg-primary"} btn-sg-sm`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
