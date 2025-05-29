"use client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import AdminTableTemplate from "@/components/AdminTableTemplate";
import type { ClassLevel } from "@prisma/client";
import { useUI } from "@/lib/ui-context";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function ClassLevelPage() {
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
      title: "Hapus Tingkat Kelas",
      message: "Apakah Anda yakin ingin menghapus tingkat kelas ini? Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/classlevel", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (res.ok) {
            showActionToast("Tingkat kelas berhasil dihapus", "success");
            setRefreshKey(k => k + 1);
          } else {
            const data = await res.json();
            showActionToast(data.error || "Gagal menghapus tingkat kelas", "error");
          }
        } catch {
          showActionToast("Terjadi kesalahan jaringan", "error");
        }
      },
    });
  };

  return (
    <AdminTableTemplate<ClassLevel>
      title="Daftar Tingkat Kelas"
      fetchUrl="/api/classlevel"
      addUrl="/admin/classlevel/tambah"
      deleteUrl="/api/classlevel"
      defaultColumns={["no", "name", "created_at", "updated_at", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: ClassLevel, i: number) => i + 1 },
        { key: "name", label: "Nama Tingkat Kelas", render: (row: ClassLevel) => row.name },
        { key: "created_at", label: "Dibuat", render: (row: ClassLevel) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Diupdate", render: (row: ClassLevel) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        {
          key: "aksi", label: "Aksi", render: (row: ClassLevel) => (
            <div className="flex gap-2">
              <Link href={`/admin/classlevel/edit/${row.id}`} className="btn btn-xs btn-warning"><Pencil className="w-4 h-4" /></Link>
              <button className="btn btn-xs btn-error" onClick={() => handleDelete(row.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari tingkat kelas..."
      refreshKey={refreshKey}
    />
  );
} 