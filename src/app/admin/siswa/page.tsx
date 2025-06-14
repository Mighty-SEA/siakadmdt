"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Filter, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trash2, MoreVertical, Plus, Upload, Download } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUI } from "@/lib/ui-context";
import Cookies from "js-cookie";

type Student = {
  id: number;
  name: string;
  nis: string;
  birth_date: string;
  gender: string;
  is_alumni: boolean;
  alumni_year?: number;
  certificate_number?: string;
  nik: string;
  kk: string;
  father_name: string;
  mother_name: string;
  father_job: string;
  mother_job: string;
  origin_school: string;
  nisn: string;
  birth_place: string;
  created_at: string;
  updated_at: string;
  qr_token: string;
};

// Tambahkan fungsi untuk menentukan status siswa
type StudentWithHistory = Student & {
  is_alumni: boolean;
  studentClassHistories?: {
    classroom?: {
      academicYear?: { is_active: boolean } | null;
    } | null;
  }[];
};

type StudentWithClass = Student & {
  studentClassHistories?: {
    id?: number;
    classroom?: {
      classLevel?: {
        name?: string;
      } | null;
      academicYear?: { is_active: boolean } | null;
    } | null;
  }[];
};

function getStatusSiswa(s: StudentWithHistory) {
  if (s.is_alumni) return "Alumni";
  const punyaKelasAktif = s.studentClassHistories?.some(
    (h) => h.classroom?.academicYear?.is_active
  );
  if (punyaKelasAktif) return "Aktif";
  return "Tidak Aktif";
}

// Tambahkan kolom kelas di allColumns
const allColumns = [
  { key: "no", label: "No" },
  { key: "name", label: "Nama" },
  { key: "nis", label: "NIS" },
  { key: "kelas", label: "Kelas" },
  { key: "birth_date", label: "Tanggal Lahir" },
  { key: "gender", label: "Jenis Kelamin" },
  { key: "is_alumni", label: "Status" },
  { key: "alumni_year", label: "Tahun Alumni" },
  { key: "certificate_number", label: "Nomor Ijazah" },
  { key: "nik", label: "NIK" },
  { key: "kk", label: "No. KK" },
  { key: "father_name", label: "Nama Ayah" },
  { key: "mother_name", label: "Nama Ibu" },
  { key: "father_job", label: "Pekerjaan Ayah" },
  { key: "mother_job", label: "Pekerjaan Ibu" },
  { key: "origin_school", label: "Asal Sekolah" },
  { key: "nisn", label: "NISN" },
  { key: "birth_place", label: "Tempat Lahir" },
  { key: "created_at", label: "Dibuat" },
  { key: "updated_at", label: "Diupdate" },
  { key: "qr_token", label: "QR Token" },
  { key: "aksi", label: "Aksi" },
];

const desktopDefaultColumns = ["no", "name", "nis", "origin_school", "aksi"];
const mobileDefaultColumns = ["no", "name", "aksi"];

export default function SiswaPage() {
  const [siswa, setSiswa] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(desktopDefaultColumns);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, showConfirmModal } = useUI();
  // Refs untuk long press
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressActiveRef = useRef(false);

  // Tambahkan state dan handler untuk filter kelas
  type KelasOption = { value: string; label: string };
  const [kelasFilter, setKelasFilter] = useState<string>("");

  // Ambil semua nama kelas aktif unik dari data siswa
  type SiswaKelas = StudentWithClass;
  const kelasOptions: KelasOption[] = Array.from(new Set(
    (siswa as SiswaKelas[]).flatMap((s) =>
      (s.studentClassHistories || [])
        .filter(h => h.classroom && h.classroom.academicYear && h.classroom.academicYear.is_active)
        .map(h => h.classroom?.classLevel?.name)
        .filter((name): name is string => !!name)
    )
  )).map(name => ({ value: String(name), label: String(name) }));

  // Mememoize fungsi untuk menampilkan toast dari query params
  const handleQueryParamsToast = useCallback(() => {
    if (!searchParams) return;
    
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    
    if (status && message) {
      showToast(decodeURIComponent(message), status as 'success' | 'error');
      
      // Hapus query params
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    // Tampilkan toast berdasarkan query parameter
    handleQueryParamsToast();
  }, [handleQueryParamsToast]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/siswa")
      .then(res => res.json())
      .then(data => {
        setSiswa(data.siswa || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setSelectedColumns(mobileDefaultColumns);
      } else {
        setSelectedColumns(desktopDefaultColumns);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter dan search
  const filtered = siswa.filter(s => {
    const matchSearch = (
      (s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.nis ?? "").includes(search) ||
      (s.nik ?? "").includes(search) ||
      (s.kk ?? "").includes(search) ||
      (s.father_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.mother_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.nisn ?? "").includes(search) ||
      (s.birth_place ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (!matchSearch) return false;
    if (!kelasFilter) return true;
    // Cek apakah siswa punya kelas aktif sesuai filter
    const histories = (s as SiswaKelas).studentClassHistories || [];
    return histories.some(h =>
      h.classroom &&
      h.classroom.academicYear && h.classroom.academicYear.is_active &&
      h.classroom.classLevel && h.classroom.classLevel.name === kelasFilter
    );
  });

  // Pagination
  const totalPage = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Mendapatkan data user dari cookie
  function getUserData() {
    try {
      const userCookie = Cookies.get("user");
      if (userCookie) {
        return JSON.parse(userCookie);
      }
      return null;
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      return null;
    }
  }

  async function handleDelete(id: number) {
    try {
      // Dapatkan data user untuk dikirim dalam header
      const userData = getUserData();
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Tambahkan user data ke header jika tersedia
      if (userData) {
        headers["x-user-data"] = JSON.stringify(userData);
      }
      
      const res = await fetch("/api/siswa", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        setSiswa(siswa => siswa.filter(s => s.id !== id));
        showToast("Siswa berhasil dihapus", "success");
        
        // Reload notifikasi setelah operasi hapus
        if (typeof window !== 'undefined' && window.reloadNotifications) {
          window.reloadNotifications();
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menghapus siswa", "error");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("Terjadi kesalahan jaringan", "error");
    }
  }

  function openDeleteModal(id: number) {
    const siswaData = siswa.find(s => s.id === id);
    if (!siswaData) return;
    
    showConfirmModal({
      title: "Konfirmasi Hapus",
      message: `Apakah Anda yakin ingin menghapus siswa <span class="font-semibold text-primary">${siswaData.name}</span> (${siswaData.nis})?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: () => handleDelete(id),
      data: siswaData
    });
  }

  // Fungsi untuk menangani long press pada tombol pagination
  const handleLongPressStart = (direction: 'next' | 'prev') => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressActiveRef.current = true;
    
    const changePage = () => {
      if (!longPressActiveRef.current) return;
      
      if (direction === 'next' && page < totalPage) {
        setPage(p => Math.min(totalPage, p + 1));
      } else if (direction === 'prev' && page > 1) {
        setPage(p => Math.max(1, p - 1));
      }
      
      longPressTimerRef.current = setTimeout(changePage, 150); // Semakin cepat setelah tahan
    };
    
    longPressTimerRef.current = setTimeout(changePage, 500); // Delay awal
  };
  
  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressActiveRef.current = false;
  };
  
  // Cleanup pada unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Fungsi untuk menangani select/deselect semua siswa pada halaman saat ini
  const handleSelectAllInPage = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paged.map(s => s.id);
      setSelectedStudents(prev => [...new Set([...prev, ...currentPageIds])]);
    } else {
      const currentPageIds = new Set(paged.map(s => s.id));
      setSelectedStudents(prev => prev.filter(id => !currentPageIds.has(id)));
    }
  };

  // Fungsi untuk mengecek apakah semua siswa di halaman saat ini dipilih
  const isAllInPageSelected = () => {
    return paged.length > 0 && paged.every(s => selectedStudents.includes(s.id));
  };

  // Fungsi untuk toggle pilihan siswa
  const toggleStudentSelection = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(studentId => studentId !== id) 
        : [...prev, id]
    );
  };

  // Fungsi untuk menangani bulk delete
  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      // Dapatkan data user untuk dikirim dalam header
      const userData = getUserData();
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Tambahkan user data ke header jika tersedia
      if (userData) {
        headers["x-user-data"] = JSON.stringify(userData);
      }
      
      const res = await fetch("/api/siswa/bulk", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ ids: selectedStudents }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSiswa(prev => prev.filter(s => !selectedStudents.includes(s.id)));
        setSelectedStudents([]);
        showToast(data.message || `${selectedStudents.length} siswa berhasil dihapus`, "success");
        
        // Reload notifikasi setelah operasi bulk delete
        if (typeof window !== 'undefined' && window.reloadNotifications) {
          window.reloadNotifications();
        }
      } else {
        showToast(data.error || "Gagal menghapus siswa", "error");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Fungsi untuk menangani bulk update status (aktif/alumni)
  const handleBulkUpdateStatus = async (isAlumni: boolean) => {
    if (selectedStudents.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      // Dapatkan data user untuk dikirim dalam header
      const userData = getUserData();
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Tambahkan user data ke header jika tersedia
      if (userData) {
        headers["x-user-data"] = JSON.stringify(userData);
      }
      
      const res = await fetch("/api/siswa/bulk", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ 
          ids: selectedStudents,
          data: { is_alumni: isAlumni }
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSiswa(prev => 
          prev.map(s => 
            selectedStudents.includes(s.id) 
              ? { ...s, is_alumni: isAlumni } 
              : s
          )
        );
        setSelectedStudents([]);
        showToast(
          data.message || 
          `Status ${selectedStudents.length} siswa berhasil diubah menjadi ${isAlumni ? 'Alumni' : 'Aktif'}`, 
          "success"
        );
        
        // Reload notifikasi setelah operasi bulk update
        if (typeof window !== 'undefined' && window.reloadNotifications) {
          window.reloadNotifications();
        }
      } else {
        showToast(data.error || "Gagal mengubah status siswa", "error");
      }
    } catch (error) {
      console.error("Error in bulk update:", error);
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Reset selected students when search changes
  useEffect(() => {
    setSelectedStudents([]);
  }, [search]);

  // Fungsi untuk select all siswa
  const handleSelectAll = () => {
    setSelectedStudents(filtered.map(s => s.id));
  };
  
  // Fungsi untuk deselect all siswa
  const handleDeselectAll = () => {
    setSelectedStudents([]);
  };

  return (
    <div className="card bg-base-200 shadow-xl p-4 sm:p-6 rounded-2xl border border-primary/30 text-base-content w-full max-w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Daftar Siswa</h2>
        <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-2">
          <div className="flex gap-2">
            <button className="btn btn-outline btn-secondary btn-sm md:btn-md gap-2 rounded-lg border-2 border-secondary hover:bg-secondary/10 hover:border-secondary focus:shadow transition-all duration-150" type="button">
              <Upload className="w-5 h-5" />
              <span>Import</span>
            </button>
            <button className="btn btn-outline btn-primary btn-sm md:btn-md gap-2 rounded-lg border-2 border-primary hover:bg-primary/10 hover:border-primary focus:shadow transition-all duration-150" type="button">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
          <Link href="/admin/siswa/tambah" className="btn btn-primary btn-sm md:btn-md gap-2 rounded-lg ml-auto">
            <Plus className="w-5 h-5" />
            <span>Tambah Siswa</span>
          </Link>
        </div>
      </div>
      {/* Desktop: search, filter kelas, filter kolom sejajar */}
      <div className="hidden md:flex flex-col md:flex-row w-full gap-2 mb-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="input input-bordered input-sm md:input-md w-full pl-10 pr-3 rounded-lg border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {/* Filter Kelas Dropdown (sekarang di kiri) */}
        <div className="dropdown dropdown-end dropdown-bottom">
          <label tabIndex={0} className="btn btn-sm md:btn-md btn-outline min-w-[56px] flex justify-between items-center gap-2 cursor-pointer hover:shadow focus:shadow border-primary/40">
            <span className="text-primary">Kelas</span>
            <span className="badge badge-primary badge-sm">{kelasFilter ? 1 : kelasOptions.length}</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </label>
          <ul tabIndex={0} className="dropdown-content right-0 z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 border border-primary/20">
            <li className="hover:bg-primary/10 rounded-md transition-colors">
              <button className={`w-full text-left px-2 py-1 ${!kelasFilter ? 'font-bold text-primary' : ''}`} onClick={() => { setKelasFilter(""); setPage(1); }}>
                Semua Kelas
              </button>
            </li>
            {kelasOptions.map(opt => (
              <li key={opt.value} className="hover:bg-primary/10 rounded-md transition-colors">
                <button className={`w-full text-left px-2 py-1 ${kelasFilter === opt.value ? 'font-bold text-primary' : ''}`} onClick={() => { setKelasFilter(opt.value); setPage(1); }}>
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Filter Kolom Dropdown (sekarang di kanan) */}
        <div>
          <div className="dropdown dropdown-end dropdown-bottom">
            <label tabIndex={0} className="btn btn-sm md:btn-md btn-outline min-w-[56px] flex justify-between items-center gap-2 cursor-pointer hover:shadow focus:shadow border-primary/40">
              <Filter className="w-5 h-5 text-primary" />
              <span className="badge badge-primary badge-sm">{selectedColumns.length}/{allColumns.length}</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </label>
            <ul tabIndex={0} className="dropdown-content right-0 z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-80 border border-primary/20 grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto max-h-72">
              <div className="col-span-full font-semibold text-primary mb-2">Tampilkan Kolom</div>
              {allColumns.map(col => (
                <label
                  key={col.key}
                  className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg transition-colors
                    ${selectedColumns.includes(col.key) ? "bg-primary/10 font-bold" : "hover:bg-base-300/40"}
                  `}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => {
                      setSelectedColumns(selectedColumns =>
                        selectedColumns.includes(col.key)
                          ? selectedColumns.filter(k => k !== col.key)
                          : [...selectedColumns, col.key]
                      );
                    }}
                  />
                  <span className="text-base-content text-sm">{col.label}</span>
                </label>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Filter/search untuk mobile */}
      <div className="flex flex-col gap-2 mb-2 md:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              className="input input-bordered input-sm w-full pl-10 pr-3 rounded-lg border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          {/* Filter Kelas Dropdown */}
          <div className="dropdown dropdown-end dropdown-bottom">
            <label tabIndex={0} className="btn btn-sm btn-outline min-w-[56px] flex justify-between items-center gap-2 cursor-pointer hover:shadow focus:shadow border-primary/40">
              <span className="text-primary">Kelas</span>
              <span className="badge badge-primary badge-sm">{kelasFilter ? 1 : kelasOptions.length}</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </label>
            <ul tabIndex={0} className="dropdown-content right-0 z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 border border-primary/20">
              <li className="hover:bg-primary/10 rounded-md transition-colors">
                <button className={`w-full text-left px-2 py-1 ${!kelasFilter ? 'font-bold text-primary' : ''}`} onClick={() => { setKelasFilter(""); setPage(1); }}>
                  Semua Kelas
                </button>
              </li>
              {kelasOptions.map(opt => (
                <li key={opt.value} className="hover:bg-primary/10 rounded-md transition-colors">
                  <button className={`w-full text-left px-2 py-1 ${kelasFilter === opt.value ? 'font-bold text-primary' : ''}`} onClick={() => { setKelasFilter(opt.value); setPage(1); }}>
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Filter Kolom Dropdown */}
          <div>
            <div className="dropdown dropdown-end dropdown-bottom">
              <label tabIndex={0} className="btn btn-sm btn-outline min-w-[56px] flex justify-between items-center gap-2 cursor-pointer hover:shadow focus:shadow border-primary/40">
                <Filter className="w-5 h-5 text-primary" />
                <span className="badge badge-primary badge-sm">{selectedColumns.length}/{allColumns.length}</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </label>
              <ul tabIndex={0} className="dropdown-content right-0 z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-80 border border-primary/20 grid grid-cols-2 gap-2 overflow-y-auto max-h-72">
                <div className="col-span-full font-semibold text-primary mb-2">Tampilkan Kolom</div>
                {allColumns.map(col => (
                  <label
                    key={col.key}
                    className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg transition-colors
                      ${selectedColumns.includes(col.key) ? "bg-primary/10 font-bold" : "hover:bg-base-300/40"}
                    `}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => {
                        setSelectedColumns(selectedColumns =>
                          selectedColumns.includes(col.key)
                            ? selectedColumns.filter(k => k !== col.key)
                            : [...selectedColumns, col.key]
                        );
                      }}
                    />
                    <span className="text-base-content text-sm">{col.label}</span>
                  </label>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Bulk action bar dipindah ke bawah filter/search */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-base-100/50 p-2 rounded-lg border border-primary/10">
          <div className="flex flex-wrap items-center gap-1">
            {/* Bulk actions button - tampil di semua mode */}
            <div className="dropdown dropdown-bottom">
              <button tabIndex={0} className="btn btn-xs btn-outline btn-primary rounded-lg flex items-center justify-center" title="Aksi">
                <MoreVertical className="w-4 h-4" />
              </button>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 border border-primary/20">
                <li>
                  <button 
                    className="flex items-center gap-2 text-error" 
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                  >
                    <Trash2 className="w-4 h-4" /> 
                    <span>Hapus Siswa</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="flex items-center gap-2 text-success" 
                    onClick={() => handleBulkUpdateStatus(false)}
                    disabled={bulkActionLoading}
                  >
                    <span className="w-4 h-4">Aktif</span>
                    <span>Set Status Aktif</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="flex items-center gap-2 text-warning" 
                    onClick={() => handleBulkUpdateStatus(true)}
                    disabled={bulkActionLoading}
                  >
                    <span className="w-4 h-4">Alumni</span>
                    <span>Set Status Alumni</span>
                  </button>
                </li>
              </ul>
            </div>
            
            <button 
              className="btn btn-xs md:btn-sm btn-ghost text-primary hover:bg-primary/10"
              onClick={handleSelectAll}
            >
              <span className="hidden sm:inline">Pilih semua</span>
              <span className="sm:hidden">Pilih</span> {filtered.length}
            </button>
            <button 
              className="btn btn-xs md:btn-sm btn-ghost text-error hover:bg-error/10"
              onClick={handleDeselectAll}
            >
              <span className="hidden sm:inline">Batalkan semua</span>
              <span className="sm:hidden">Batalkan</span>
            </button>
          </div>
          <div className="text-sm font-medium text-right ml-auto">{selectedStudents.length} data dipilih</div>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl">
        <table className="table table-zebra w-full md:min-w-[600px]">
          <thead>
            <tr className="bg-base-200">
              <th className="w-10">
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={isAllInPageSelected()}
                    onChange={(e) => handleSelectAllInPage(e.target.checked)}
                  />
                </label>
              </th>
              {selectedColumns.includes("no") && <th>No</th>}
              {selectedColumns.includes("name") && <th>Nama</th>}
              {selectedColumns.includes("nis") && <th>NIS</th>}
              {selectedColumns.includes("kelas") && <th>Kelas</th>}
              {selectedColumns.includes("birth_date") && <th>Tanggal Lahir</th>}
              {selectedColumns.includes("gender") && <th>Gender</th>}
              {selectedColumns.includes("is_alumni") && <th>Status</th>}
              {selectedColumns.includes("alumni_year") && <th>Tahun Alumni</th>}
              {selectedColumns.includes("certificate_number") && <th>Nomor Ijazah</th>}
              {selectedColumns.includes("nik") && <th>NIK</th>}
              {selectedColumns.includes("kk") && <th>No. KK</th>}
              {selectedColumns.includes("father_name") && <th>Nama Ayah</th>}
              {selectedColumns.includes("mother_name") && <th>Nama Ibu</th>}
              {selectedColumns.includes("father_job") && <th>Pekerjaan Ayah</th>}
              {selectedColumns.includes("mother_job") && <th>Pekerjaan Ibu</th>}
              {selectedColumns.includes("origin_school") && <th>Asal Sekolah</th>}
              {selectedColumns.includes("nisn") && <th>NISN</th>}
              {selectedColumns.includes("birth_place") && <th>Tempat Lahir</th>}
              {selectedColumns.includes("created_at") && <th>Dibuat</th>}
              {selectedColumns.includes("updated_at") && <th>Diupdate</th>}
              {selectedColumns.includes("qr_token") && <th>QR Token</th>}
              {selectedColumns.includes("aksi") && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={selectedColumns.length + 1} className="text-center">Memuat data...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={selectedColumns.length + 1} className="text-center">Tidak ada data</td></tr>
            ) : (
              paged.map((s, i) => (
                <tr key={s.id} className={selectedStudents.includes(s.id) ? "bg-primary/5" : undefined}>
                  <td>
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => toggleStudentSelection(s.id)}
                      />
                    </label>
                  </td>
                  {selectedColumns.includes("no") && <td>{(page - 1) * pageSize + i + 1}</td>}
                  {selectedColumns.includes("name") && <td>{s.name}</td>}
                  {selectedColumns.includes("nis") && <td>{s.nis}</td>}
                  {selectedColumns.includes("kelas") && <td> {
                    (() => {
                      const histories = (s as StudentWithClass).studentClassHistories || [];
                      // Kelas aktif
                      const kelasAktif = histories
                        .filter(h => h.classroom && h.classroom.academicYear && h.classroom.academicYear.is_active)
                        .map(h => h.classroom?.classLevel?.name)
                        .filter((name): name is string => !!name)
                        .join(", ");
                      if (kelasAktif) return kelasAktif;
                      // Jika tidak ada kelas aktif, cek kelas terakhir
                      if (histories.length > 0) {
                        // Urutkan berdasarkan id terbesar (asumsi id auto increment)
                        const lastHistory = [...histories].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
                        const lastKelas = lastHistory.classroom?.classLevel?.name;
                        if (lastKelas) return <span className="badge badge-error">{lastKelas}</span>;
                      }
                      return "-";
                    })()
                  } </td>}
                  {selectedColumns.includes("birth_date") && <td>{new Date(s.birth_date).toLocaleDateString("id-ID")}</td>}
                  {selectedColumns.includes("gender") && <td>{s.gender === "L" ? "Laki-laki" : s.gender === "P" ? "Perempuan" : s.gender}</td>}
                  {selectedColumns.includes("is_alumni") && (
                    <td>
                      {getStatusSiswa(s as StudentWithHistory) === "Aktif" && <span className="badge badge-success">Aktif</span>}
                      {getStatusSiswa(s as StudentWithHistory) === "Alumni" && <span className="badge badge-ghost">Alumni</span>}
                      {getStatusSiswa(s as StudentWithHistory) === "Tidak Aktif" && <span className="badge badge-error">Tidak Aktif</span>}
                    </td>
                  )}
                  {selectedColumns.includes("alumni_year") && s.is_alumni ? <td>{s.alumni_year}</td> : null}
                  {selectedColumns.includes("certificate_number") && (
                    <td>{s.certificate_number || "-"}</td>
                  )}
                  {selectedColumns.includes("nik") && <td>{s.nik}</td>}
                  {selectedColumns.includes("kk") && <td>{s.kk}</td>}
                  {selectedColumns.includes("father_name") && <td>{s.father_name}</td>}
                  {selectedColumns.includes("mother_name") && <td>{s.mother_name}</td>}
                  {selectedColumns.includes("father_job") && <td>{s.father_job}</td>}
                  {selectedColumns.includes("mother_job") && <td>{s.mother_job}</td>}
                  {selectedColumns.includes("origin_school") && <td>{s.origin_school}</td>}
                  {selectedColumns.includes("nisn") && <td>{s.nisn}</td>}
                  {selectedColumns.includes("birth_place") && <td>{s.birth_place}</td>}
                  {selectedColumns.includes("created_at") && <td>{new Date(s.created_at).toLocaleDateString("id-ID")}</td>}
                  {selectedColumns.includes("updated_at") && <td>{new Date(s.updated_at).toLocaleDateString("id-ID")}</td>}
                  {selectedColumns.includes("qr_token") && <td>{s.qr_token}</td>}
                  {selectedColumns.includes("aksi") && <td>
                    <div className="md:hidden dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-xs btn-ghost rounded-full">
                        <MoreVertical className="w-4 h-4" />
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-28">
                        <li>
                          <button className="flex items-center gap-2 text-primary" onClick={() => router.push(`/admin/siswa/edit/${s.id}`)}>
                            <Pencil className="w-4 h-4" /> <span className="text-base-content">Edit</span>
                          </button>
                        </li>
                        <li>
                          <button className="flex items-center gap-2 text-error" onClick={() => openDeleteModal(s.id)}>
                            <Trash2 className="w-4 h-4" /> <span className="text-base-content">Hapus</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div className="hidden md:flex gap-2">
                      <button
                        className="btn btn-xs btn-ghost rounded-full text-primary hover:bg-primary/10 hover:shadow transition-all duration-150"
                        title="Edit"
                        onClick={() => router.push(`/admin/siswa/edit/${s.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-xs btn-ghost rounded-full text-error hover:bg-error/10 hover:shadow transition-all duration-150"
                        title="Hapus"
                        onClick={() => openDeleteModal(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Info jumlah data, dropdown page size di tengah, dan pagination di kanan */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4 md:gap-8 w-full">
        {/* Info jumlah data di kiri */}
        <div className="flex items-center gap-2 w-full md:w-1/3 justify-center md:justify-start text-base-content/80 text-sm">
          {filtered.length > 0 ? (
            <span>
              Menampilkan {(page - 1) * pageSize + 1}
              {' '}sampai{' '}
              {Math.min(page * pageSize, filtered.length)}
              {' '}dari{' '}
              {filtered.length} data
            </span>
          ) : (
            <span>Tidak ada data</span>
          )}
        </div>
        {/* Dropdown jumlah data per halaman di tengah */}
        <div className="flex items-center gap-2 w-full md:w-1/3 justify-center">
          <span className="text-base-content text-sm">Tampilkan</span>
          <select
            className="select select-bordered select-sm w-16"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-base-content text-sm">data</span>
        </div>
        {/* Pagination di kanan */}
        <div className="flex w-full md:w-1/3 justify-center md:justify-end gap-1">
          <div className="join">
            <button
              className="join-item btn btn-sm btn-ghost"
              onClick={() => setPage(1)}
              disabled={page === 1}
              aria-label="Halaman pertama"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              className="join-item btn btn-sm btn-ghost"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              onTouchStart={() => handleLongPressStart('prev')}
              onTouchEnd={handleLongPressEnd}
              onMouseDown={() => handleLongPressStart('prev')}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              disabled={page === 1}
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Desktop pagination dengan ... */}
            <div className="hidden md:flex">
              {(() => {
                const pages = [];
                const maxPage = totalPage;
                const maxShow = 5;
                let start = Math.max(1, page - 2);
                let end = Math.min(maxPage, page + 2);
                if (page <= 3) {
                  start = 1;
                  end = Math.min(maxPage, maxShow);
                } else if (page >= maxPage - 2) {
                  start = Math.max(1, maxPage - maxShow + 1);
                  end = maxPage;
                }
                if (start > 1) {
                  pages.push(
                    <button key={1} className={`join-item btn btn-sm ${page === 1 ? 'btn-primary text-white' : 'btn-ghost hover:bg-primary/10'}`} onClick={() => setPage(1)}>{1}</button>
                  );
                  if (start > 2) pages.push(<span key="start-ellipsis" className="px-1">...</span>);
                }
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`join-item btn btn-sm ${page === i ? 'btn-primary text-white' : 'btn-ghost hover:bg-primary/10'}`}
                      onClick={() => setPage(i)}
                      aria-current={page === i ? 'page' : undefined}
                    >{i}</button>
                  );
                }
                if (end < maxPage) {
                  if (end < maxPage - 1) pages.push(<span key="end-ellipsis" className="px-1">...</span>);
                  pages.push(
                    <button key={maxPage} className={`join-item btn btn-sm ${page === maxPage ? 'btn-primary text-white' : 'btn-ghost hover:bg-primary/10'}`} onClick={() => setPage(maxPage)}>{maxPage}</button>
                  );
                }
                return pages;
              })()}
            </div>
            
            {/* Mobile pagination (simpel) */}
            <div className="flex md:hidden items-center">
              <span className="px-3 text-sm font-medium">
                {page}/{totalPage}
              </span>
            </div>
            
            <button
              className="join-item btn btn-sm btn-ghost"
              onClick={() => setPage(p => Math.min(totalPage, p + 1))}
              onTouchStart={() => handleLongPressStart('next')}
              onTouchEnd={handleLongPressEnd}
              onMouseDown={() => handleLongPressStart('next')}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              disabled={page === totalPage}
              aria-label="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="join-item btn btn-sm btn-ghost"
              onClick={() => setPage(totalPage)}
              disabled={page === totalPage}
              aria-label="Halaman terakhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 