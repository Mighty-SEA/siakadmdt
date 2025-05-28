"use client";

import { CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import React, { createContext, useContext, useState, useRef, ReactNode } from "react";

// Tipe data untuk toast
type ToastType = {
  show: boolean;
  message: string;
  type: "success" | "error";
};

// Tipe data untuk modal konfirmasi
type ConfirmModalType = {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  data?: any;
};

// Tipe data untuk context UI
type UIContextType = {
  toast: ToastType;
  showToast: (message: string, type: "success" | "error") => void;
  confirmModal: ConfirmModalType;
  showConfirmModal: (options: Omit<ConfirmModalType, "show">) => void;
  hideConfirmModal: () => void;
};

// Nilai default untuk context
const defaultContext: UIContextType = {
  toast: {
    show: false,
    message: "",
    type: "success",
  },
  showToast: () => {},
  confirmModal: {
    show: false,
    title: "",
    message: "",
    confirmText: "Konfirmasi",
    cancelText: "Batal",
    onConfirm: () => {},
  },
  showConfirmModal: () => {},
  hideConfirmModal: () => {},
};

// Membuat context
const UIContext = createContext<UIContextType>(defaultContext);

// Custom hook untuk menggunakan context
export const useUI = () => useContext(UIContext);

// Provider component
export function UIProvider({ children }: { children: ReactNode }) {
  // State untuk toast
  const [toast, setToast] = useState<ToastType>({
    show: false,
    message: "",
    type: "success",
  });

  // State untuk modal konfirmasi
  const [confirmModal, setConfirmModal] = useState<ConfirmModalType>({
    show: false,
    title: "",
    message: "",
    confirmText: "Konfirmasi",
    cancelText: "Batal",
    onConfirm: () => {},
  });

  // Ref untuk modal dialog
  const confirmModalRef = useRef<HTMLDialogElement>(null);

  // Fungsi untuk menampilkan toast
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Fungsi untuk menampilkan modal konfirmasi
  const showConfirmModal = (options: Omit<ConfirmModalType, "show">) => {
    setConfirmModal({ ...options, show: true });
    confirmModalRef.current?.showModal();
  };

  // Fungsi untuk menyembunyikan modal konfirmasi
  const hideConfirmModal = () => {
    confirmModalRef.current?.close();
    setConfirmModal((prev) => ({ ...prev, show: false }));
  };

  return (
    <UIContext.Provider
      value={{
        toast,
        showToast,
        confirmModal,
        showConfirmModal,
        hideConfirmModal,
      }}
    >
      {children}

      {/* Toast notification */}
      {toast.show && (
        <div className="toast toast-top toast-end z-50 mt-10">
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"} shadow-lg`}>
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal konfirmasi */}
      <dialog id="confirm_modal" className="modal modal-bottom sm:modal-middle" ref={confirmModalRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {confirmModal.title.toLowerCase().includes("hapus") && <Trash2 className="w-5 h-5" />}
            {confirmModal.title}
          </h3>
          <p className="py-4" dangerouslySetInnerHTML={{ __html: confirmModal.message }}></p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={hideConfirmModal}>
                {confirmModal.cancelText}
              </button>
            </form>
            <button
              onClick={() => {
                confirmModal.onConfirm();
                hideConfirmModal();
              }}
              className={`btn ${confirmModal.title.toLowerCase().includes("hapus") ? "btn-error" : "btn-primary"}`}
            >
              {confirmModal.confirmText}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={hideConfirmModal}>Batal</button>
        </form>
      </dialog>
    </UIContext.Provider>
  );
} 