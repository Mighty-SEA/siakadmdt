"use client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import AdminTableTemplate from "@/components/AdminTableTemplate";
import type { AcademicYear } from "@prisma/client";
import { useUI } from "@/lib/ui-context";
import { useSearchParams } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";
import React from "react";

export default function AcademicYearPage() {
  const { showConfirmModal } = useUI();
  const { showActionToast } = useAppActionFeedback();
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Tampilkan toast jika ada status & message di query params
  React.useEffect(() => {
    if (!searchParams) return;
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status && message) {
      showActionToast(decodeURIComponent(message), status as "success" | "error");
      // Hapus query params dari URL
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      url.searchParams.delete("message");
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, showActionToast]);

  // Handler hapus
  const handleDelete = (id: number) => {
    showConfirmModal({
      title: "Hapus Tahun Akademik",
      message: "Apakah Anda yakin ingin menghapus tahun akademik ini? Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/academicyear", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (res.ok) {
            showActionToast("Tahun akademik berhasil dihapus", "success");
            setRefreshKey(k => k + 1);
          } else {
            const data = await res.json();
            showActionToast(data.error || "Gagal menghapus tahun akademik", "error");
          }
        } catch {
          showActionToast("Terjadi kesalahan jaringan", "error");
        }
      },
    });
  };

  return (
    <AdminTableTemplate<AcademicYear>
      title="Daftar Tahun Akademik"
      fetchUrl="/api/academicyear"
      addUrl="/admin/academicyear/tambah"
      deleteUrl="/api/academicyear"
      defaultColumns={["no", "year", "is_active", "created_at", "updated_at", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: AcademicYear, i: number) => i + 1 },
        { key: "year", label: "Tahun Akademik", render: (row: AcademicYear) => row.year },
        { key: "is_active", label: "Status Aktif", render: (row: AcademicYear) => row.is_active ? <span className="badge badge-success">Aktif</span> : <span className="badge badge-ghost">Tidak Aktif</span> },
        { key: "created_at", label: "Dibuat", render: (row: AcademicYear) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Diupdate", render: (row: AcademicYear) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        {
          key: "aksi", label: "Aksi", render: (row: AcademicYear) => (
            <div className="flex gap-2">
              <Link href={`/admin/academicyear/edit/${row.id}`} className="btn btn-xs btn-warning"><Pencil className="w-4 h-4" /></Link>
              <button className="btn btn-xs btn-error" onClick={() => handleDelete(row.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari tahun akademik..."
      refreshKey={refreshKey}
    />
  );
} 