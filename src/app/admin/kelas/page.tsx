"use client";
import { Pencil, Trash2, History, Users } from "lucide-react";
import Link from "next/link";
import AdminTableTemplate from "@/components/AdminTableTemplate";
import { useState, useEffect } from "react";
import { useUI } from "@/lib/ui-context";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";
import { useSearchParams } from "next/navigation";

interface ClassLevel {
  name: string;
}

interface AcademicYear {
  year: string;
}

interface Teacher {
  name: string;
}

interface KelasData {
  id: string;
  classLevel?: ClassLevel;
  academicYear?: AcademicYear;
  teacher?: Teacher;
  created_at?: string;
  updated_at?: string;
  studentClassHistories?: { id: string }[];
  [key: string]: unknown;
}

export default function KelasPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showConfirmModal } = useUI();
  const { showActionToast } = useAppActionFeedback();
  const searchParams = useSearchParams();

  // Tampilkan toast jika ada status & message di query params
  useEffect(() => {
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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch("/api/kelas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        showActionToast("Kelas berhasil dihapus", "success");
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await res.json();
        showActionToast(errorData.error || "Gagal menghapus kelas", "error");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      showActionToast("Gagal menghapus kelas: Terjadi kesalahan jaringan", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteModal = (row: KelasData) => {
    if ((row.studentClassHistories?.length || 0) > 0) {
      showActionToast("Tidak dapat menghapus kelas yang memiliki siswa aktif", "error");
      return;
    }
    
    showConfirmModal({
      title: "Konfirmasi Hapus",
      message: `Apakah Anda yakin ingin menghapus kelas <span class='font-semibold text-primary'>${row.classLevel?.name || ''}</span> tahun ajaran <span class='font-semibold text-primary'>${row.academicYear?.year || ''}</span>?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: () => handleDelete(row.id),
      data: row,
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex gap-2 w-full">
          <Link href="/admin/classlevel" className="btn btn-outline btn-secondary gap-2">
            <span>Tingkat Kelas</span>
          </Link>
          <Link href="/admin/academicyear" className="btn btn-outline btn-secondary gap-2">
            <span>Tahun Akademik</span>
          </Link>
          <div className="flex-1" />
          <Link href="/admin/kelas/riwayat" className="btn btn-outline btn-primary gap-2">
            <History className="w-4 h-4" />
            <span>Riwayat Kelas</span>
          </Link>
        </div>
      </div>
      
      <AdminTableTemplate<KelasData>
        title="Daftar Kelas"
        fetchUrl="/api/kelas"
        addUrl="/admin/kelas/tambah"
        deleteUrl="/api/kelas"
        defaultColumns={["no", "classLevel", "academicYear", "teacher", "students", "aksi"]}
        columns={[
          { key: "no", label: "No", render: (_row: KelasData, i: number) => i + 1 },
          { 
            key: "classLevel", 
            label: "Kelas", 
            render: row => (
              <span className="font-medium">{row.classLevel?.name || "-"}</span>
            )
          },
          { 
            key: "academicYear", 
            label: "Tahun Ajaran", 
            render: row => (
              <span className="badge badge-outline badge-sm">{row.academicYear?.year || "-"}</span>
            )
          },
          { 
            key: "teacher", 
            label: "Wali Kelas", 
            render: row => (
              <span className={row.teacher?.name ? "" : "text-base-content/50"}>
                {row.teacher?.name || "Belum ditentukan"}
              </span>
            )
          },
          {
            key: "students",
            label: "Jumlah Siswa",
            render: row => (
              <span className="badge badge-primary badge-sm">
                {row.studentClassHistories?.length || 0} siswa
              </span>
            )
          },
          { 
            key: "created_at", 
            label: "Dibuat", 
            render: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" 
          },
          { 
            key: "updated_at", 
            label: "Diupdate", 
            render: row => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" 
          },
          { key: "aksi", label: "Aksi" },
        ]}
        searchPlaceholder="Cari nama kelas, tahun, atau wali..."
        refreshKey={refreshKey}
        renderRowActions={(row: KelasData) => [
          <Link href={`/admin/kelas/edit/${row.id}`} className="flex items-center gap-2 text-primary" key="edit">
            <Pencil className="w-4 h-4" /> <span className="text-base-content">Edit</span>
          </Link>,
          <Link href={`/admin/kelas/${row.id}/siswa`} className="flex items-center gap-2 text-success" key="siswa">
            <Users className="w-4 h-4" /> <span className="text-base-content">Siswa</span>
          </Link>,
          <button className="flex items-center gap-2 text-error" key="hapus" onClick={() => openDeleteModal(row)} disabled={deletingId === row.id}>
            <Trash2 className="w-4 h-4" /> <span className="text-base-content">Hapus</span>
          </button>
        ]}
      />
    </div>
  );
} 