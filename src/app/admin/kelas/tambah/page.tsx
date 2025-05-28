"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

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

export default function TambahKelasPage() {
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classLevelId, setClassLevelId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { showActionToast } = useAppActionFeedback();

  useEffect(() => {
    setDataLoading(true);
    Promise.all([
      fetch("/api/classlevel").then(res => res.json()),
      fetch("/api/academicyear").then(res => res.json()),
      fetch("/api/guru").then(res => res.json())
    ]).then(([classLevelData, academicYearData, teacherData]) => {
      setClassLevels(classLevelData.data || []);
      setAcademicYears(academicYearData.data || []);
      setTeachers(teacherData.data || []);
      setDataLoading(false);
    }).catch(error => {
      console.error("Error fetching data:", error);
      showActionToast("Gagal memuat data referensi", "error");
      setDataLoading(false);
    });
  }, [showActionToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_level_id: classLevelId,
          academic_year_id: academicYearId,
          teacher_id: teacherId || null,
        }),
      });
      
      if (res.ok) {
        router.push("/admin/kelas?status=success&message=Kelas+berhasil+ditambahkan");
      } else {
        const errorData = await res.json();
        showActionToast(`Gagal menambah kelas: ${errorData.error || 'Terjadi kesalahan'}`, "error");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating class:", error);
      showActionToast("Gagal menambah kelas: Terjadi kesalahan jaringan", "error");
      setLoading(false);
    }
  }

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Tambah Kelas</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Tingkat Kelas</span>
          </label>
          <select 
            className="select select-bordered" 
            value={classLevelId} 
            onChange={e => setClassLevelId(e.target.value)} 
            required
          >
            <option value="">Pilih Tingkat Kelas</option>
            {classLevels.map((cl: ClassLevel) => (
              <option key={cl.id} value={cl.id}>{cl.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Tahun Ajaran</span>
          </label>
          <select 
            className="select select-bordered" 
            value={academicYearId} 
            onChange={e => setAcademicYearId(e.target.value)} 
            required
          >
            <option value="">Pilih Tahun Ajaran</option>
            {academicYears.map((ay: AcademicYear) => (
              <option key={ay.id} value={ay.id}>{ay.year}</option>
            ))}
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Wali Kelas (opsional)</span>
          </label>
          <select 
            className="select select-bordered" 
            value={teacherId} 
            onChange={e => setTeacherId(e.target.value)}
          >
            <option value="">Pilih Wali Kelas</option>
            {teachers.map((t: Teacher) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button 
            className="btn btn-primary flex-1" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <><span className="loading loading-spinner loading-xs"></span> Menyimpan...</>
            ) : "Simpan"}
          </button>
          <button 
            className="btn btn-outline" 
            type="button" 
            onClick={() => router.push('/admin/kelas')}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
} 