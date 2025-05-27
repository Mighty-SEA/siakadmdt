"use client";
import { useState } from "react";
import { Filter, Search, ClipboardList, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trash2 } from "lucide-react";

const allColumns = [
  { key: "no", label: "No" },
  { key: "nama", label: "Nama" },
  { key: "nis", label: "NIS" },
  { key: "kelas", label: "Kelas" },
  { key: "status", label: "Status" },
  { key: "aksi", label: "Aksi" },
];

export default function SiswaPage() {
  // Data dummy siswa
  const siswa = [
    { nama: "Ahmad Fauzi", nis: "2023001", kelas: "VII A", status: "Aktif" },
    { nama: "Siti Aminah", nis: "2023002", kelas: "VII B", status: "Aktif" },
    { nama: "Rizki Maulana", nis: "2023003", kelas: "VIII A", status: "Lulus" },
    { nama: "Dewi Lestari", nis: "2023004", kelas: "IX A", status: "Aktif" },
    { nama: "Budi Santoso", nis: "2023005", kelas: "VII A", status: "Aktif" },
    { nama: "Lina Marlina", nis: "2023006", kelas: "VIII A", status: "Aktif" },
    { nama: "Fajar Nugraha", nis: "2023007", kelas: "IX A", status: "Lulus" },
    { nama: "Nurul Huda", nis: "2023008", kelas: "VII B", status: "Aktif" },
    { nama: "Dian Puspita", nis: "2023009", kelas: "VIII A", status: "Aktif" },
    { nama: "Rina Sari", nis: "2023010", kelas: "IX A", status: "Aktif" },
  ];

  // State untuk search, filter, dan pagination
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedColumns, setSelectedColumns] = useState(allColumns.map(c => c.key));

  // Ambil daftar kelas unik
  const kelasList = Array.from(new Set(siswa.map(s => s.kelas)));

  // Filter dan search
  const filtered = siswa.filter(s =>
    (filterKelas === "" || s.kelas === filterKelas) &&
    (s.nama.toLowerCase().includes(search.toLowerCase()) ||
     s.nis.includes(search))
  );

  // Pagination
  const totalPage = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card bg-base-200 shadow-xl p-4 sm:p-6 rounded-2xl border border-primary/30 text-base-content w-full max-w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-2">Daftar Siswa</h2>
      {/* Filter Kolom, Cari Nama, dan Filter Kelas dalam satu baris */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center md:items-end w-full">
        {/* Input Cari Nama dengan ikon search */}
        <div className="flex-1 w-full relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="input input-bordered w-full pl-10 pr-3 py-2 rounded-lg border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {/* Select Filter Kelas dengan ikon */}
        <div className="w-full md:w-1/4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none">
            <ClipboardList className="w-5 h-5" />
          </span>
          <select
            className="select select-bordered w-full pl-10 pr-3 py-2 rounded-lg border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none"
            value={filterKelas}
            onChange={e => { setFilterKelas(e.target.value); setPage(1); }}
          >
            <option value="">Semua Kelas</option>
            {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <div className="dropdown dropdown-bottom">
            <label tabIndex={0} className="btn btn-md btn-outline min-w-[56px] flex justify-between items-center gap-2 cursor-pointer hover:shadow focus:shadow border-primary/40">
              <Filter className="w-5 h-5 text-primary" />
              <span className="badge badge-primary badge-sm">{selectedColumns.length}/{allColumns.length}</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-48 border border-primary/20">
              {allColumns.map(col => (
                <li key={col.key} className="hover:bg-primary/10 rounded-md transition-colors">
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
      <div className="overflow-x-auto rounded-xl">
        <table className="table table-zebra min-w-[600px] md:min-w-0">
          <thead>
            <tr className="bg-base-200">
              {selectedColumns.includes("no") && <th>No</th>}
              {selectedColumns.includes("nama") && <th>Nama</th>}
              {selectedColumns.includes("nis") && <th>NIS</th>}
              {selectedColumns.includes("kelas") && <th>Kelas</th>}
              {selectedColumns.includes("status") && <th>Status</th>}
              {selectedColumns.includes("aksi") && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={selectedColumns.length} className="text-center">Tidak ada data</td></tr>
            ) : (
              paged.map((s, i) => (
                <tr key={s.nis}>
                  {selectedColumns.includes("no") && <td>{(page - 1) * pageSize + i + 1}</td>}
                  {selectedColumns.includes("nama") && <td>{s.nama}</td>}
                  {selectedColumns.includes("nis") && <td>{s.nis}</td>}
                  {selectedColumns.includes("kelas") && <td>{s.kelas}</td>}
                  {selectedColumns.includes("status") && <td><span className={`badge ${s.status === 'Aktif' ? 'badge-success' : 'badge-ghost'}`}>{s.status}</span></td>}
                  {selectedColumns.includes("aksi") && <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs btn-ghost rounded-full text-primary hover:bg-primary/10 hover:shadow transition-all duration-150"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-xs btn-ghost rounded-full text-error hover:bg-error/10 hover:shadow transition-all duration-150"
                        title="Hapus"
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
          {Array.from({ length: totalPage }, (_, i) => (
            <button
              key={i + 1}
              className={`btn btn-sm rounded-full min-w-[2.25rem] px-0 mx-0.5 ${page === i + 1 ? 'btn-primary text-white' : 'btn-ghost hover:bg-primary/10'}`}
              onClick={() => setPage(i + 1)}
              aria-current={page === i + 1 ? 'page' : undefined}
            >{i + 1}</button>
          ))}
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
    </div>
  );
} 