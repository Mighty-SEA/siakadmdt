"use client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import AdminTableTemplate from "@/components/AdminTableTemplate";
import { useUI } from "@/lib/ui-context";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";
import { useSearchParams } from "next/navigation";
import React from "react";

type ClassroomRow = {
  id: number;
  classLevel?: { name: string } | null;
  academicYear?: { year: string } | null;
  teacher?: { name: string } | null;
  created_at?: string;
  updated_at?: string;
};

export default function ClassroomPage() {
  const { showConfirmModal } = useUI();
  const { showActionToast } = useAppActionFeedback();
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!searchParams) return;
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status && message) {
      showActionToast(decodeURIComponent(message), status as "success" | "error");
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      url.searchParams.delete("message");
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, showActionToast]);

  const handleDelete = (id: number) => {
    showConfirmModal({
      title: "Hapus Kelas",
      message: "Apakah Anda yakin ingin menghapus kelas ini? Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/classroom", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (res.ok) {
            showActionToast("Kelas berhasil dihapus", "success");
            setRefreshKey(k => k + 1);
          } else {
            const data = await res.json();
            showActionToast(data.error || "Gagal menghapus kelas", "error");
          }
        } catch {
          showActionToast("Terjadi kesalahan jaringan", "error");
        }
      },
    });
  };

  return (
    <AdminTableTemplate
      title="Daftar Rombel/Kelas"
      fetchUrl="/api/classroom"
      addUrl="/admin/classroom/tambah"
      editUrl={id => `/admin/classroom/edit/${id}`}
      deleteUrl="/api/classroom"
      defaultColumns={["no", "classLevel", "academicYear", "teacher", "created_at", "updated_at", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: ClassroomRow, i: number) => i + 1 },
        { key: "classLevel", label: "Tingkat", render: (row: ClassroomRow) => row.classLevel?.name || "-" },
        { key: "academicYear", label: "Tahun", render: (row: ClassroomRow) => row.academicYear?.year || "-" },
        { key: "teacher", label: "Wali Kelas", render: (row: ClassroomRow) => row.teacher?.name || "-" },
        { key: "created_at", label: "Dibuat", render: (row: ClassroomRow) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Diupdate", render: (row: ClassroomRow) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        {
          key: "aksi", label: "Aksi", render: (row: ClassroomRow) => (
            <div className="flex gap-2">
              <Link href={`/admin/classroom/edit/${row.id}`} className="btn btn-xs btn-warning"><Pencil className="w-4 h-4" /></Link>
              <button className="btn btn-xs btn-error" onClick={() => handleDelete(row.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari tingkat, tahun, atau wali kelas..."
      refreshKey={refreshKey}
    />
  );
} 