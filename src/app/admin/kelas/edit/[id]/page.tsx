"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditKelasPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [classLevels, setClassLevels] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classLevelId, setClassLevelId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/classlevel").then(res => res.json()).then(res => setClassLevels(res.classLevels || []));
    fetch("/api/academicyear").then(res => res.json()).then(res => setAcademicYears(res.academicYears || []));
    fetch("/api/guru").then(res => res.json()).then(res => setTeachers(res.guru || []));
  }, []);

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    fetch(`/api/kelas?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.kelas) {
          setClassLevelId(data.kelas.class_level_id?.toString() || "");
          setAcademicYearId(data.kelas.academic_year_id?.toString() || "");
          setTeacherId(data.kelas.teacher_id?.toString() || "");
        }
        setFetching(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/kelas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        class_level_id: classLevelId,
        academic_year_id: academicYearId,
        teacher_id: teacherId || null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/kelas");
    } else {
      alert("Gagal mengedit kelas");
    }
  }

  if (fetching) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Kelas</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <select className="input input-bordered" value={classLevelId} onChange={e => setClassLevelId(e.target.value)} required>
          <option value="">Pilih Tingkat Kelas</option>
          {classLevels.map((cl: any) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
        </select>
        <select className="input input-bordered" value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} required>
          <option value="">Pilih Tahun Ajaran</option>
          {academicYears.map((ay: any) => <option key={ay.id} value={ay.id}>{ay.year}</option>)}
        </select>
        <select className="input input-bordered" value={teacherId} onChange={e => setTeacherId(e.target.value)}>
          <option value="">Pilih Wali Kelas (opsional)</option>
          {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</button>
      </form>
    </div>
  );
} 