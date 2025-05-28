"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, School, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

interface Student {
  id: string;
  name: string;
  nis: string;
  birth_date?: string;
  gender?: string;
  nik?: string;
  nisn?: string;
}

interface ClassLevel {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  year: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Classroom {
  id: string;
  classLevel: ClassLevel;
  academicYear: AcademicYear;
  teacher?: Teacher;
}

interface RiwayatKelas {
  id: string;
  student: Student;
  classroom: Classroom;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function RiwayatKelasDetailPage() {
  const params = useParams();
  const { showActionToast } = useAppActionFeedback();
  const [loading, setLoading] = useState(true);
  const [riwayat, setRiwayat] = useState<RiwayatKelas | null>(null);
  const riwayatId = params?.id as string;

  useEffect(() => {
    const fetchRiwayatKelas = async () => {
      try {
        const res = await fetch(`/api/kelas/riwayat/${riwayatId}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data");
        }
        const data = await res.json();
        setRiwayat(data.data);
      } catch (error) {
        console.error("Error fetching riwayat kelas:", error);
        showActionToast("Gagal mengambil data riwayat kelas", "error");
      } finally {
        setLoading(false);
      }
    };

    if (riwayatId) {
      fetchRiwayatKelas();
    }
  }, [riwayatId, showActionToast]);

  const handleStatusChange = async () => {
    if (!riwayat) return;
    
    try {
      const res = await fetch(`/api/kelas/riwayat/${riwayatId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !riwayat.is_active }),
      });
      
      if (!res.ok) {
        throw new Error("Gagal mengubah status");
      }
      
      const data = await res.json();
      setRiwayat(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      showActionToast(data.message || "Status berhasil diubah", "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showActionToast("Gagal mengubah status riwayat kelas", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!riwayat) {
    return (
      <div className="card bg-base-200 shadow-xl p-6 rounded-2xl border border-error/30 text-base-content">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-error mb-2">Data Tidak Ditemukan</h2>
          <p className="mb-4">Riwayat kelas yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <Link href="/admin/kelas/riwayat" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Riwayat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl p-6 rounded-2xl border border-primary/30 text-base-content">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/kelas/riwayat" className="btn btn-circle btn-ghost">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold">Detail Riwayat Kelas</h2>
        </div>
        <div className="flex gap-2">
          <button 
            className={`btn ${riwayat.is_active ? 'btn-error' : 'btn-success'}`}
            onClick={handleStatusChange}
          >
            {riwayat.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informasi Siswa */}
        <div className="card bg-base-100 shadow-md rounded-xl overflow-hidden">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Informasi Siswa</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-base-content/60">Nama Lengkap</p>
                <p className="font-medium">{riwayat.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">NIS</p>
                <p className="font-medium">{riwayat.student.nis || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">NISN</p>
                <p className="font-medium">{riwayat.student.nisn || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">NIK</p>
                <p className="font-medium">{riwayat.student.nik || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Jenis Kelamin</p>
                <p className="font-medium">
                  {riwayat.student.gender === "L" ? "Laki-laki" : 
                   riwayat.student.gender === "P" ? "Perempuan" : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Tanggal Lahir</p>
                <p className="font-medium">
                  {riwayat.student.birth_date 
                    ? new Date(riwayat.student.birth_date).toLocaleDateString('id-ID', {
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric'
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Kelas */}
        <div className="card bg-base-100 shadow-md rounded-xl overflow-hidden">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <School className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Informasi Kelas</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-base-content/60">Kelas</p>
                <p className="font-medium">{riwayat.classroom.classLevel.name}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Tahun Ajaran</p>
                <p className="font-medium">{riwayat.classroom.academicYear.year}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Wali Kelas</p>
                <p className="font-medium">{riwayat.classroom.teacher?.name || "Belum ditentukan"}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Status</p>
                <div className="mt-1">
                  <span className={`badge ${riwayat.is_active ? 'badge-success' : 'badge-ghost'}`}>
                    {riwayat.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Waktu */}
      <div className="card bg-base-100 shadow-md rounded-xl overflow-hidden mt-6">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Informasi Waktu</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-base-content/60">Tanggal Masuk</p>
              <p className="font-medium">
                {riwayat.created_at 
                  ? new Date(riwayat.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Terakhir Diupdate</p>
              <p className="font-medium">
                {riwayat.updated_at 
                  ? new Date(riwayat.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 