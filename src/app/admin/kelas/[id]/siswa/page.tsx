"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Search, UserPlus, X, Filter, Check, ChevronDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";
import { useUI } from "@/lib/ui-context";

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

interface StudentInClass extends Student {
  studentClassHistoryId: string;
}

type GenderFilter = "all" | "L" | "P";

// Komponen Modal Tambah Siswa
function TambahSiswaModal({
  isOpen,
  onClose,
  kelasId,
  onSuccess,
  submitting,
  setSubmitting
}: {
  isOpen: boolean;
  onClose: () => void;
  kelasId: string;
  onSuccess: () => void;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
}) {
  const { showActionToast } = useAppActionFeedback();
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [isSearching, setIsSearching] = useState(false);

  // Mengambil data siswa yang tersedia untuk ditambahkan
  useEffect(() => {
    const fetchAvailableStudents = async () => {
      if (!isOpen) return;
      
      setIsSearching(true);
      try {
        const res = await fetch(`/api/siswa/available?classId=${kelasId}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data siswa");
        }
        const data = await res.json();
        setAvailableStudents(data.data);
      } catch (error) {
        console.error("Error fetching available students:", error);
        showActionToast("Gagal mengambil data siswa yang tersedia", "error");
      } finally {
        setIsSearching(false);
      }
    };

    fetchAvailableStudents();
  }, [isOpen, kelasId, showActionToast]);

  // Filter siswa yang tersedia berdasarkan pencarian dan jenis kelamin
  const filteredAvailableStudents = useMemo(() => {
    return availableStudents.filter(student => {
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
  }, [availableStudents, searchTerm, genderFilter]);

  // Handle checkbox change untuk siswa yang tersedia
  const handleCheckboxChange = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle select all untuk siswa yang tersedia
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredAvailableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredAvailableStudents.map(student => student.id));
    }
  };

  // Handle tambah siswa
  const handleAddStudents = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      onSuccess();
      onClose();
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

  // Hitung status checkbox
  const allSelected = filteredAvailableStudents.length > 0 && selectedStudents.length === filteredAvailableStudents.length;
  const someSelected = selectedStudents.length > 0 && selectedStudents.length < filteredAvailableStudents.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-base-100 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tambah Siswa ke Kelas</h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost" 
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex flex-wrap items-center gap-2 border-b border-base-300">
          {/* Pencarian */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/60" />
            <input
              type="text"
              className="input input-bordered input-sm w-full pl-9"
              placeholder="Cari nama atau NIS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={e => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
              >
                <X className="w-4 h-4 text-base-content/60" />
              </button>
            )}
          </div>

          {/* Filter Jenis Kelamin */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline" onClick={e => e.stopPropagation()}>
              <Filter className="w-4 h-4 mr-1" />
              Filter
              <ChevronDown className="w-4 h-4 ml-1" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <button 
                  className={`${genderFilter === "all" ? "active" : ""}`}
                  onClick={e => {
                    e.stopPropagation();
                    setGenderFilter("all");
                  }}
                >
                  Semua Jenis Kelamin
                  {genderFilter === "all" && <Check className="w-4 h-4" />}
                </button>
              </li>
              <li>
                <button 
                  className={`${genderFilter === "L" ? "active" : ""}`}
                  onClick={e => {
                    e.stopPropagation();
                    setGenderFilter("L");
                  }}
                >
                  Laki-laki
                  {genderFilter === "L" && <Check className="w-4 h-4" />}
                </button>
              </li>
              <li>
                <button 
                  className={`${genderFilter === "P" ? "active" : ""}`}
                  onClick={e => {
                    e.stopPropagation();
                    setGenderFilter("P");
                  }}
                >
                  Perempuan
                  {genderFilter === "P" && <Check className="w-4 h-4" />}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          {isSearching ? (
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : filteredAvailableStudents.length === 0 ? (
            <div className="text-center py-8 text-base-content/70">
              {searchTerm ? "Tidak ada siswa yang sesuai dengan pencarian" : "Tidak ada siswa yang tersedia"}
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-sm mr-2" 
                  checked={allSelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={handleSelectAll}
                  onClick={e => e.stopPropagation()}
                />
                <span className="text-sm font-medium">
                  {selectedStudents.length > 0 ? `${selectedStudents.length} siswa dipilih` : "Pilih semua"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredAvailableStudents.map(student => (
                  <div 
                    key={student.id}
                    className="flex items-center p-2 rounded-lg hover:bg-base-200 cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      handleCheckboxChange(student.id);
                    }}
                  >
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-sm mr-3" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={e => {
                        e.stopPropagation();
                        handleCheckboxChange(student.id);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-base-content/70 flex items-center gap-2">
                        <span>{student.nis}</span>
                        <span className="w-1 h-1 bg-base-content/30 rounded-full"></span>
                        <span>{student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-base-300 flex justify-end gap-2">
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={onClose}
          >
            Batal
          </button>
          <button 
            className="btn btn-sm btn-primary" 
            onClick={handleAddStudents}
            disabled={selectedStudents.length === 0 || submitting}
          >
            {submitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Tambahkan ({selectedStudents.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManajemenSiswaKelasPage() {
  const params = useParams();
  const { showActionToast } = useAppActionFeedback();
  const { showConfirmModal } = useUI();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<StudentInClass[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
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

  // Mengambil data siswa yang ada di kelas ini
  const fetchStudentsInClass = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kelas/${kelasId}/siswa?page=${currentPage}&limit=${pageSize}&search=${searchTerm}&gender=${genderFilter}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil data siswa");
      }
      const data = await res.json();
      setStudentsInClass(data.data);
      setTotalPages(data.meta.totalPages || 1);
    } catch (error) {
      console.error("Error fetching students in class:", error);
      showActionToast("Gagal mengambil data siswa di kelas", "error");
    } finally {
      setLoading(false);
    }
  }, [kelasId, currentPage, pageSize, searchTerm, genderFilter, showActionToast]);

  // Effect untuk mengambil data siswa saat parameter berubah
  useEffect(() => {
    if (kelasId) {
      fetchStudentsInClass();
    }
  }, [kelasId, fetchStudentsInClass]);

  // Handle checkbox change untuk siswa yang akan dihapus
  const handleRemoveCheckboxChange = (historyId: string) => {
    setSelectedToRemove(prev =>
      prev.includes(historyId)
        ? prev.filter(id => id !== historyId)
        : [...prev, historyId]
    );
  };

  // Handle select all untuk siswa yang akan dihapus
  const handleSelectAllToRemove = () => {
    if (selectedToRemove.length === studentsInClass.length) {
      setSelectedToRemove([]);
    } else {
      setSelectedToRemove(studentsInClass.map(student => student.studentClassHistoryId));
    }
  };

  // Handle keluarkan siswa
  const handleRemoveStudents = async () => {
    if (selectedToRemove.length === 0) {
      showActionToast("Pilih minimal 1 siswa", "error");
      return;
    }

    showConfirmModal({
      title: "Konfirmasi Keluarkan Siswa",
      message: `Apakah Anda yakin ingin mengeluarkan ${selectedToRemove.length} siswa dari kelas ini?`,
      confirmText: "Keluarkan",
      cancelText: "Batal",
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await fetch(`/api/kelas/${kelasId}/keluarkan-siswa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historyIds: selectedToRemove }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Gagal mengeluarkan siswa");
          }

          const data = await res.json();
          showActionToast(data.message || "Siswa berhasil dikeluarkan dari kelas", "success");
          setSelectedToRemove([]);
          
          // Refresh data siswa di kelas
          fetchStudentsInClass();
        } catch (error) {
          console.error("Error removing students:", error);
          showActionToast(
            error instanceof Error ? error.message : "Gagal mengeluarkan siswa",
            "error"
          );
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  // Toggle modal tambah siswa
  const toggleAddStudentsModal = () => {
    setIsAddingStudents(!isAddingStudents);
  };

  // Handle success dari modal tambah siswa
  const handleAddStudentsSuccess = () => {
    fetchStudentsInClass();
  };

  if (loading && !classroom) {
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

  const allSelectedToRemove = studentsInClass.length > 0 && selectedToRemove.length === studentsInClass.length;
  const someSelectedToRemove = selectedToRemove.length > 0 && selectedToRemove.length < studentsInClass.length;

  return (
    <div className="card bg-base-200 shadow-xl p-6 rounded-2xl border border-primary/30 text-base-content">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/kelas" className="btn btn-circle btn-ghost">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold">Manajemen Siswa Kelas</h2>
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

      {/* Daftar Siswa di Kelas */}
      <div className="bg-base-100 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">Daftar Siswa di Kelas</h3>
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
              <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
                <Filter className="w-4 h-4 mr-1" />
                Filter
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <button 
                    className={`${genderFilter === "all" ? "active" : ""}`}
                    onClick={() => setGenderFilter("all")}
                  >
                    Semua Jenis Kelamin
                    {genderFilter === "all" && <Check className="w-4 h-4" />}
                  </button>
                </li>
                <li>
                  <button 
                    className={`${genderFilter === "L" ? "active" : ""}`}
                    onClick={() => setGenderFilter("L")}
                  >
                    Laki-laki
                    {genderFilter === "L" && <Check className="w-4 h-4" />}
                  </button>
                </li>
                <li>
                  <button 
                    className={`${genderFilter === "P" ? "active" : ""}`}
                    onClick={() => setGenderFilter("P")}
                  >
                    Perempuan
                    {genderFilter === "P" && <Check className="w-4 h-4" />}
                  </button>
                </li>
              </ul>
            </div>

            {/* Tombol Tambah Siswa */}
            <button 
              className="btn btn-sm btn-primary" 
              onClick={toggleAddStudentsModal}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* Tabel Siswa */}
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="w-10">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-sm" 
                    checked={allSelectedToRemove}
                    ref={input => {
                      if (input) {
                        input.indeterminate = someSelectedToRemove;
                      }
                    }}
                    onChange={handleSelectAllToRemove}
                  />
                </th>
                <th className="w-10">No</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Jenis Kelamin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <span className="loading loading-spinner loading-md"></span>
                  </td>
                </tr>
              ) : studentsInClass.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Belum ada siswa di kelas ini
                  </td>
                </tr>
              ) : (
                studentsInClass.map((student, index) => (
                  <tr key={student.studentClassHistoryId}>
                    <td>
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm" 
                        checked={selectedToRemove.includes(student.studentClassHistoryId)}
                        onChange={() => handleRemoveCheckboxChange(student.studentClassHistoryId)}
                      />
                    </td>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{student.nis}</td>
                    <td>{student.name}</td>
                    <td>
                      {student.gender === 'L' ? 'Laki-laki' : 
                       student.gender === 'P' ? 'Perempuan' : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="join">
              <button 
                className="join-item btn btn-sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="join-item btn btn-sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}

        {/* Bulk Action */}
        {selectedToRemove.length > 0 && (
          <div className="mt-4 flex justify-between items-center bg-base-200 p-2 rounded-lg">
            <span className="text-sm font-medium">
              {selectedToRemove.length} siswa dipilih
            </span>
            <button 
              className="btn btn-sm btn-error" 
              onClick={handleRemoveStudents}
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Keluarkan dari Kelas
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal Tambah Siswa sebagai komponen terpisah */}
      <TambahSiswaModal
        isOpen={isAddingStudents}
        onClose={toggleAddStudentsModal}
        kelasId={kelasId}
        onSuccess={handleAddStudentsSuccess}
        submitting={submitting}
        setSubmitting={setSubmitting}
      />
    </div>
  );
}
