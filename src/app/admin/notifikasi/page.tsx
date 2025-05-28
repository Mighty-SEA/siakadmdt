"use client";
import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  created_at: string;
};

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Fungsi untuk mendapatkan notifikasi dari API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notification");
      if (!res.ok) {
        throw new Error("Gagal mengambil data notifikasi");
      }
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil notifikasi");
    } finally {
      setLoading(false);
    }
  };

  // Mendapatkan notifikasi saat halaman dimuat
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fungsi untuk menandai notifikasi sebagai sudah dibaca
  const markAsRead = async (id: number) => {
    try {
      const res = await fetch("/api/notification", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, isRead: true }),
      });

      if (!res.ok) {
        throw new Error("Gagal menandai notifikasi sebagai dibaca");
      }

      // Update state notifikasi lokal
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Fungsi untuk menghapus notifikasi
  const deleteNotification = async (id: number) => {
    try {
      const res = await fetch("/api/notification", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus notifikasi");
      }

      // Update state notifikasi lokal
      const isUnread = notifications.find((n) => n.id === id)?.isRead === false;
      setNotifications(notifications.filter((notif) => notif.id !== id));
      if (isUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error("Error deleting notification:", err);
    }
  };

  // Fungsi untuk menandai semua notifikasi sebagai sudah dibaca
  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notification/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error("Gagal menandai semua notifikasi sebagai dibaca");
      }

      // Update state notifikasi lokal
      setNotifications(
        notifications.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
    }
  };
  
  // Fungsi untuk menghasilkan notifikasi dummy
  const generateDummyNotifications = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/notification/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error("Gagal menghasilkan notifikasi dummy");
      }

      // Refresh notifikasi setelah berhasil dibuat
      fetchNotifications();
    } catch (err: any) {
      console.error("Error generating dummy notifications:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan tipe notifikasi
  const getBadgeClass = (type: string) => {
    switch (type) {
      case "success":
        return "badge-success";
      case "error":
        return "badge-error";
      case "warning":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  // Fungsi untuk memformat tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy, HH:mm", { locale: id });
  };

  return (
    <div className="card bg-base-200 shadow-xl p-4 sm:p-6 rounded-2xl border border-primary/30 text-base-content w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Notifikasi</h2>
          {unreadCount > 0 && (
            <span className="badge badge-primary">{unreadCount} baru</span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-primary gap-2"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-5 h-5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
          
          <button
            className="btn btn-sm btn-ghost gap-2"
            onClick={generateDummyNotifications}
            disabled={generating}
          >
            <Plus className="w-5 h-5" />
            <span>{generating ? "Membuat..." : "Buat Dummy"}</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-base-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <Bell className="w-16 h-16 text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Tidak Ada Notifikasi</h3>
          <p className="text-base-content/70">
            Saat ini tidak ada notifikasi untuk ditampilkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-base-100 rounded-xl p-4 border ${
                notification.isRead
                  ? "border-base-300"
                  : "border-primary shadow-md"
              } transition-all duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2">
                  <div
                    className={`badge ${getBadgeClass(
                      notification.type
                    )} badge-sm mt-1`}
                  >
                    {notification.type}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">
                      {notification.title}
                    </h3>
                    <p className="text-xs text-base-content/70">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!notification.isRead && (
                    <button
                      className="btn btn-ghost btn-sm btn-square text-primary"
                      onClick={() => markAsRead(notification.id)}
                      title="Tandai Dibaca"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error"
                    onClick={() => deleteNotification(notification.id)}
                    title="Hapus Notifikasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm mt-1 whitespace-pre-line">
                {notification.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 