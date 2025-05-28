"use client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import AdminTableTemplate from "@/components/AdminTableTemplate";

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
}

export default function KelasPage() {
  return (
    <AdminTableTemplate
      title="Daftar Kelas"
      fetchUrl="/api/kelas"
      addUrl="/admin/kelas/tambah"
      editUrl={id => `/admin/kelas/edit/${id}`}
      deleteUrl="/api/kelas"
      defaultColumns={["no", "classLevel", "academicYear", "teacher", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: KelasData, i: number) => i + 1 },
        { key: "classLevel", label: "Kelas", render: row => row.classLevel?.name || "-" },
        { key: "academicYear", label: "Tahun Ajaran", render: row => row.academicYear?.year || "-" },
        { key: "teacher", label: "Wali Kelas", render: row => row.teacher?.name || "-" },
        { key: "created_at", label: "Dibuat", render: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Diupdate", render: row => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        {
          key: "aksi", label: "Aksi", render: row => (
            <div className="flex gap-2">
              <Link href={`/admin/kelas/edit/${row.id}`} className="btn btn-xs btn-warning"><Pencil className="w-4 h-4" /></Link>
              <button className="btn btn-xs btn-error"><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari nama kelas, tahun, atau wali..."
    />
  );
} 