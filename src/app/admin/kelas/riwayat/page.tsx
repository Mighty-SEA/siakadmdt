"use client";
import { useState, useEffect } from "react";
import AdminTableTemplate from "@/components/AdminTableTemplate";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";
import { useSearchParams } from "next/navigation";
import { Eye } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  nis: string;
}

interface ClassLevel {
  name: string;
}

interface AcademicYear {
  year: string;
}

interface Classroom {
  id: string;
  classLevel: ClassLevel;
  academicYear: AcademicYear;
}

interface RiwayatKelasData {
  id: string;
  student: Student;
  classroom: Classroom;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export default function RiwayatKelasPage() {
  const [refreshKey] = useState(0);
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

  return (
    <AdminTableTemplate
      title="Riwayat Kelas Siswa"
      fetchUrl="/api/kelas/riwayat"
      addUrl="/admin/kelas"
      deleteUrl="/api/kelas/riwayat"
      defaultColumns={["no", "student", "classroom", "status", "created_at", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: RiwayatKelasData, i: number) => i + 1 },
        { 
          key: "student", 
          label: "Siswa", 
          render: row => (
            <div>
              <div className="font-medium">{row.student?.name || "-"}</div>
              <div className="text-xs text-base-content/70">NIS: {row.student?.nis || "-"}</div>
            </div>
          )
        },
        { 
          key: "classroom", 
          label: "Kelas", 
          render: row => (
            <div>
              <div className="font-medium">{row.classroom?.classLevel?.name || "-"}</div>
              <div className="text-xs text-base-content/70">
                TA: {row.classroom?.academicYear?.year || "-"}
              </div>
            </div>
          )
        },
        {
          key: "status",
          label: "Status",
          render: row => (
            <span className={`badge ${row.is_active ? 'badge-success' : 'badge-ghost'} badge-sm`}>
              {row.is_active ? 'Aktif' : 'Tidak Aktif'}
            </span>
          )
        },
        { 
          key: "created_at", 
          label: "Tanggal Masuk", 
          render: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" 
        },
        { 
          key: "updated_at", 
          label: "Diupdate", 
          render: row => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" 
        },
        {
          key: "aksi", 
          label: "Aksi", 
          render: row => (
            <div className="flex gap-2">
              <Link 
                href={`/admin/kelas/riwayat/${row.id}`} 
                className="btn btn-xs btn-info"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari nama siswa, kelas, atau tahun ajaran..."
      refreshKey={refreshKey}
    />
  );
} 