"use client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import AdminTableTemplate from "@/components/AdminTableTemplate";
import { useUI } from "@/lib/ui-context";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

type GuruRow = {
  id: number;
  name: string;
  nip?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export default function GuruPage() {
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

  async function handleDelete(id: number) {
    try {
      const res = await fetch("/api/guru", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showActionToast("Guru berhasil dihapus", "success");
        setRefreshKey(k => k + 1);
      } else {
        const data = await res.json();
        showActionToast(data.error || "Gagal menghapus guru", "error");
      }
    } catch {
      showActionToast("Terjadi kesalahan jaringan", "error");
    }
  }

  function openDeleteModal(row: GuruRow) {
    showConfirmModal({
      title: "Konfirmasi Hapus",
      message: `Apakah Anda yakin ingin menghapus guru <span class='font-semibold text-primary'>${row.name}</span> (${row.nip || '-'} )?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: () => handleDelete(row.id),
      data: row,
    });
  }

  return (
    <AdminTableTemplate<GuruRow>
      title="Daftar Guru"
      fetchUrl="/api/guru"
      importUrl="/api/guru/import"
      exportUrl="/api/guru/export"
      addUrl="/admin/guru/tambah"
      deleteUrl="/api/guru"
      defaultColumns={["no", "name", "nip", "gender", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: GuruRow, i: number) => i + 1 },
        { key: "name", label: "Nama" },
        { key: "nip", label: "NIP" },
        { key: "gender", label: "Gender", render: row => row.gender === "L" ? "Laki-laki" : row.gender === "P" ? "Perempuan" : row.gender || "-" },
        { key: "created_at", label: "Dibuat", render: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Diupdate", render: row => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        {
          key: "aksi", label: "Aksi", render: (row: GuruRow) => (
            <div className="flex gap-2">
              <Link href={`/admin/guru/edit/${row.id}`} className="btn btn-xs btn-warning"><Pencil className="w-4 h-4" /></Link>
              <button className="btn btn-xs btn-error" onClick={() => openDeleteModal(row)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari nama atau NIP..."
      refreshKey={refreshKey}
    />
  );
} 