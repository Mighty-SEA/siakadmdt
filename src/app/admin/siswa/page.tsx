"use client";
import { useEffect, useState, useRef } from "react";
import { Filter, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trash2, MoreVertical, Plus, Upload, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Student = {
  id: number;
  name: string;
  nis: string;
  birth_date: string;
  gender: string;
  is_alumni: boolean;
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

const allColumns = [
  { key: "no", label: "No" },
  { key: "name", label: "Nama" },
  { key: "nis", label: "NIS" },
  { key: "birth_date", label: "Tanggal Lahir" },
  { key: "gender", label: "Jenis Kelamin" },
  { key: "is_alumni", label: "Status" },
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
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [siswaToDelete, setSiswaToDelete] = useState<Student | null>(null);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const deleteModalRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

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
  const filtered = siswa.filter(s =>
    (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.nik.includes(search) ||
      s.kk.includes(search) ||
      s.father_name.toLowerCase().includes(search.toLowerCase()) ||
      s.mother_name.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.includes(search) ||
      s.birth_place.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Pagination
  const totalPage = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Menampilkan toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  async function handleDelete(id: number) {
    try {
      const res = await fetch("/api/siswa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSiswa(siswa => siswa.filter(s => s.id !== id));
        showToast(`Siswa berhasil dihapus`, 'success');
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menghapus siswa", 'error');
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", 'error');
    }
  }

  function openDeleteModal(id: number) {
    const siswaData = siswa.find(s => s.id === id) || null;
    setDeleteId(id);
    setSiswaToDelete(siswaData);
    deleteModalRef.current?.showModal();
  }

  function confirmDelete() {
    if (deleteId !== null) {
      handleDelete(deleteId);
      deleteModalRef.current?.close();
      setDeleteId(null);
      setSiswaToDelete(null);
    }
  }

  return (
    <div className="card bg-base-200 shadow-xl p-4 sm:p-6 rounded-2xl border border-primary/30 text-base-content w-full max-w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Daftar Siswa</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-secondary btn-sm md:btn-md gap-2 rounded-lg border-2 border-secondary hover:bg-secondary/10 hover:border-secondary focus:shadow transition-all duration-150" type="button">
            <Upload className="w-5 h-5" />
            <span>Import</span>
          </button>
          <button className="btn btn-outline btn-primary btn-sm md:btn-md gap-2 rounded-lg border-2 border-primary hover:bg-primary/10 hover:border-primary focus:shadow transition-all duration-150" type="button">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <Link href="/admin/siswa/tambah" className="btn btn-primary btn-sm md:btn-md gap-2 rounded-lg">
            <Plus className="w-5 h-5" />
            <span>Tambah Siswa</span>
          </Link>
        </div>
      </div>
      {/* Filter Kolom, Cari Nama, dan Filter Gender/Status */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center md:items-end w-full">
        {/* Input Cari Nama dengan ikon search dan tombol filter kolom di kanan (mobile & desktop) */}
        <div className="flex w-full gap-2">
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
          <div>
            <div className="dropdown dropdown-end dropdown-bottom">
              <label tabIndex={0} className="btn btn-sm md:btn-md btn-outline min-w-[56px] flex justify-between items-center gap-2 cursor-pointer hover:shadow focus:shadow border-primary/40">
                <Filter className="w-5 h-5 text-primary" />
                <span className="badge badge-primary badge-sm">{selectedColumns.length}/{allColumns.length}</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </label>
              <ul tabIndex={0} className="dropdown-content right-0 z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-80 border border-primary/20 grid grid-cols-3 gap-2">
                {allColumns.map(col => (
                  <li key={col.key} className="hover:bg-primary/10 rounded-md transition-colors col-span-1">
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1 w-full">
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
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl">
        <table className="table table-zebra w-full md:min-w-[600px]">
          <thead>
            <tr className="bg-base-200">
              {selectedColumns.includes("no") && <th>No</th>}
              {selectedColumns.includes("name") && <th>Nama</th>}
              {selectedColumns.includes("nis") && <th>NIS</th>}
              {selectedColumns.includes("birth_date") && <th>Tanggal Lahir</th>}
              {selectedColumns.includes("gender") && <th>Gender</th>}
              {selectedColumns.includes("is_alumni") && <th>Status</th>}
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
              <tr><td colSpan={selectedColumns.length} className="text-center">Memuat data...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={selectedColumns.length} className="text-center">Tidak ada data</td></tr>
            ) : (
              paged.map((s, i) => (
                <tr key={s.id}>
                  {selectedColumns.includes("no") && <td>{(page - 1) * pageSize + i + 1}</td>}
                  {selectedColumns.includes("name") && <td>{s.name}</td>}
                  {selectedColumns.includes("nis") && <td>{s.nis}</td>}
                  {selectedColumns.includes("birth_date") && <td>{new Date(s.birth_date).toLocaleDateString("id-ID")}</td>}
                  {selectedColumns.includes("gender") && <td>{s.gender === "L" ? "Laki-laki" : s.gender === "P" ? "Perempuan" : s.gender}</td>}
                  {selectedColumns.includes("is_alumni") && <td><span className={`badge ${s.is_alumni ? 'badge-ghost' : 'badge-success'}`}>{s.is_alumni ? 'Lulus' : 'Aktif'}</span></td>}
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
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                        </li>
                        <li>
                          <button className="flex items-center gap-2 text-error" onClick={() => openDeleteModal(s.id)}>
                            <Trash2 className="w-4 h-4" /> Hapus
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
          <span className="text-base-content">Tampilkan</span>
          <select
            className="select select-bordered select-sm w-auto"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-base-content">data per halaman</span>
        </div>
        {/* Pagination di kanan */}
        <div className="flex w-full md:w-1/3 justify-center md:justify-end gap-1">
          <button
            className="btn btn-sm btn-ghost rounded-full"
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="Halaman pertama"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            className="btn btn-sm btn-ghost rounded-full"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* Pagination dengan ... */}
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
                <button key={1} className={`btn btn-sm rounded-full min-w-[2.25rem] px-0 mx-0.5 ${page === 1 ? 'btn-primary text-white' : 'btn-ghost hover:bg-primary/10'}`} onClick={() => setPage(1)}>{1}</button>
              );
              if (start > 2) pages.push(<span key="start-ellipsis" className="px-1">...</span>);
            }
            for (let i = start; i <= end; i++) {
              pages.push(
                <button
                  key={i}
                  className={`btn btn-sm rounded-full min-w-[2.25rem] px-0 mx-0.5 ${page === i ? 'btn-primary text-white' : 'btn-ghost hover:bg-primary/10'}`}
                  onClick={() => setPage(i)}
                  aria-current={page === i ? 'page' : undefined}
                >{i}</button>
              );
            }
            if (end < maxPage) {
              if (end < maxPage - 1) pages.push(<span key="end-ellipsis" className="px-1">...</span>);
              pages.push(
                <button key={maxPage} className={`btn btn-sm rounded-full min-w-[2.25rem] px-0 mx-0.5 ${page === maxPage ? 'btn-primary text-white' : 'btn-ghost hover:bg-primary/10'}`} onClick={() => setPage(maxPage)}>{maxPage}</button>
              );
            }
            return pages;
          })()}
          <button
            className="btn btn-sm btn-ghost rounded-full"
            onClick={() => setPage(p => Math.min(totalPage, p + 1))}
            disabled={page === totalPage}
            aria-label="Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            className="btn btn-sm btn-ghost rounded-full"
            onClick={() => setPage(totalPage)}
            disabled={page === totalPage}
            aria-label="Halaman terakhir"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Modal konfirmasi hapus */}
      <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle" ref={deleteModalRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Konfirmasi Hapus
          </h3>
          {siswaToDelete && (
            <p className="py-4">
              Apakah Anda yakin ingin menghapus siswa <span className="font-semibold text-primary">{siswaToDelete.name}</span> ({siswaToDelete.nis})?
            </p>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Batal</button>
            </form>
            <button onClick={confirmDelete} className="btn btn-primary">
              Hapus
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Batal</button>
        </form>
      </dialog>

      {/* Toast notification */}
      {toast.show && (
        <div className="toast toast-top toast-end z-50 mt-10">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? 
                <CheckCircle2 className="w-5 h-5" /> : 
                <AlertCircle className="w-5 h-5" />
              }
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 