"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, UserPlus, X, Filter, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

interface Student {
  id: string;
  name: string;
  nis: string;
  gender?: string;
  is_alumni?: boolean;
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

type GenderFilter = "all" | "L" | "P";

export default function TambahSiswaKelasPage() {
  const params = useParams();
  const router = useRouter();
  const { showActionToast } = useAppActionFeedback();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [isSearching, setIsSearching] = useState(false);
  const kelasId = params?.id as string;

  // Mengambil data kelas
  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const res = await fetch(`/api/kelas/${kelasId}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data kelas");
        }
        const data = await res.json();
        setClassroom(data.data);
      } catch (error) {
        console.error("Error fetching classroom:", error);
        showActionToast("Gagal mengambil data kelas", "error");
      }
    };

    if (kelasId) {
      fetchClassroom();
    }
  }, [kelasId, showActionToast]);

  // Mengambil data siswa yang belum terdaftar di kelas manapun atau belum terdaftar di kelas ini
  useEffect(() => {
    const fetchStudents = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/siswa/available?classId=${kelasId}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data siswa");
        }
        const data = await res.json();
        setStudents(data.data);
      } catch (error) {
        console.error("Error fetching students:", error);
        showActionToast("Gagal mengambil data siswa", "error");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    if (kelasId) {
      fetchStudents();
    }
  }, [kelasId, showActionToast]);

  // Filter siswa berdasarkan pencarian dan jenis kelamin
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Filter berdasarkan jenis kelamin
      if (genderFilter !== "all" && student.gender !== genderFilter) {
        return false;
      }

      // Filter berdasarkan pencarian
      if (searchTerm.trim() !== "") {
        const lowercasedSearch = searchTerm.toLowerCase();
        return (
          student.name.toLowerCase().includes(lowercasedSearch) ||
          student.nis.toLowerCase().includes(lowercasedSearch)
        );
      }

      return true;
    });
  }, [students, searchTerm, genderFilter]);

  // Handle checkbox change
  const handleCheckboxChange = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      showActionToast("Pilih minimal 1 siswa", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/kelas/${kelasId}/tambah-siswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menambahkan siswa");
      }

      const data = await res.json();
      showActionToast(data.message || "Siswa berhasil ditambahkan ke kelas", "success");
      router.push(`/admin/kelas?status=success&message=${encodeURIComponent("Siswa berhasil ditambahkan ke kelas")}`);
    } catch (error) {
      console.error("Error adding students:", error);
      showActionToast(
        error instanceof Error ? error.message : "Gagal menambahkan siswa",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="card bg-base-200 shadow-xl p-6 rounded-2xl border border-error/30 text-base-content">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-error mb-2">Kelas Tidak Ditemukan</h2>
          <p className="mb-4">Kelas yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <Link href="/admin/kelas" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Kelas
          </Link>
        </div>
      </div>
    );
  }

  const allSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  const someSelected = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  return (
    <div className="card bg-base-200 shadow-xl p-6 rounded-2xl border border-primary/30 text-base-content">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/kelas" className="btn btn-circle btn-ghost">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold">Tambah Siswa ke Kelas</h2>
        </div>
      </div>

      <div className="bg-base-100 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Informasi Kelas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-base-content/60">Kelas</p>
            <p className="font-medium">{classroom.classLevel?.name}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Tahun Ajaran</p>
            <p className="font-medium">{classroom.academicYear?.year}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Wali Kelas</p>
            <p className="font-medium">{classroom.teacher?.name || "Belum ditentukan"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-base-100 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold">Pilih Siswa</h3>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Pencarian */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/60" />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full pl-9"
                  placeholder="Cari nama atau NIS..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="w-4 h-4 text-base-content/60" />
                  </button>
                )}
              </div>

              {/* Filter Jenis Kelamin */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline gap-2">
                  <Filter className="w-4 h-4" />
                  <span>
                    {genderFilter === "all"
                      ? "Semua"
                      : genderFilter === "L"
                      ? "Laki-laki"
                      : "Perempuan"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li onClick={() => setGenderFilter("all")}>
                    <a className={genderFilter === "all" ? "active" : ""}>
                      {genderFilter === "all" && <Check className="w-4 h-4" />}
                      Semua
                    </a>
                  </li>
                  <li onClick={() => setGenderFilter("L")}>
                    <a className={genderFilter === "L" ? "active" : ""}>
                      {genderFilter === "L" && <Check className="w-4 h-4" />}
                      Laki-laki
                    </a>
                  </li>
                  <li onClick={() => setGenderFilter("P")}>
                    <a className={genderFilter === "P" ? "active" : ""}>
                      {genderFilter === "P" && <Check className="w-4 h-4" />}
                      Perempuan
                    </a>
                  </li>
                </ul>
              </div>

              {/* Tombol Pilih Semua */}
              <button
                type="button"
                className={`btn btn-sm ${allSelected ? 'btn-error' : 'btn-primary'}`}
                onClick={handleSelectAll}
              >
                {allSelected ? "Batalkan Semua" : "Pilih Semua"}
              </button>
            </div>
          </div>

          {isSearching ? (
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <span className="ml-2">Mencari siswa...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-base-content/70">
              {students.length === 0
                ? "Tidak ada siswa yang tersedia untuk ditambahkan"
                : "Tidak ada siswa yang sesuai dengan filter pencarian"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th className="w-16">
                      <label className="cursor-pointer flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={allSelected}
                          ref={input => {
                            if (input) {
                              input.indeterminate = someSelected;
                            }
                          }}
                          onChange={handleSelectAll}
                        />
                      </label>
                    </th>
                    <th>NIS</th>
                    <th>Nama Siswa</th>
                    <th>Jenis Kelamin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr 
                      key={student.id} 
                      className={`hover cursor-pointer ${selectedStudents.includes(student.id) ? 'bg-primary/10' : ''}`}
                      onClick={() => handleCheckboxChange(student.id)}
                    >
                      <td onClick={e => e.stopPropagation()}>
                        <label className="cursor-pointer flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleCheckboxChange(student.id)}
                          />
                        </label>
                      </td>
                      <td>{student.nis}</td>
                      <td className="font-medium">{student.name}</td>
                      <td>
                        <span className={`badge ${student.gender === "L" ? "badge-info" : student.gender === "P" ? "badge-secondary" : "badge-ghost"} badge-sm`}>
                          {student.gender === "L"
                            ? "Laki-laki"
                            : student.gender === "P"
                            ? "Perempuan"
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm">
              <span className="font-medium text-primary">{selectedStudents.length}</span> dari <span className="font-medium">{filteredStudents.length}</span> siswa dipilih
            </div>
            <div className="flex gap-2">
              <Link href="/admin/kelas" className="btn btn-outline">
                Batal
              </Link>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={selectedStudents.length === 0 || submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Tambahkan {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''} Siswa
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 