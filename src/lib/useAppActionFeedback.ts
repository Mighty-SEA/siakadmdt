import { useUI } from "@/lib/ui-context";
import { useCallback } from "react";

/**
 * Helper untuk feedback aksi (toast + reload notifikasi real-time)
 * @returns { showActionToast }
 */
export function useAppActionFeedback() {
  const { showToast } = useUI();

  /**
   * Tampilkan toast dan reload notifikasi real-time jika ada
   * @param message Pesan yang akan ditampilkan
   * @param type Jenis toast ('success' | 'error')
   */
  const showActionToast = useCallback((message: string, type: "success" | "error") => {
    showToast(message, type);
    if (typeof window !== "undefined" && window.reloadNotifications) {
      window.reloadNotifications();
    }
  }, [showToast]);

  return { showActionToast };
} 