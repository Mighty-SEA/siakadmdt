"use client";
import { useState } from "react";

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
  const pageSize = 5;

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
    <div className="card bg-base-100 shadow-xl p-6 rounded-2xl border border-base-200 text-base-content">
      <h2 className="text-2xl font-bold mb-2">Daftar Siswa</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          className="input input-bordered w-full md:w-1/3"
          placeholder="Cari nama atau NIS..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="select select-bordered w-full md:w-1/4"
          value={filterKelas}
          onChange={e => { setFilterKelas(e.target.value); setPage(1); }}
        >
          <option value="">Semua Kelas</option>
          {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl">
        <table className="table table-zebra">
          <thead>
            <tr className="bg-base-200">
              <th>No</th>
              <th>Nama</th>
              <th>NIS</th>
              <th>Kelas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={5} className="text-center">Tidak ada data</td></tr>
            ) : (
              paged.map((s, i) => (
                <tr key={s.nis}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{s.nama}</td>
                  <td>{s.nis}</td>
                  <td>{s.kelas}</td>
                  <td>
                    <span className={`badge ${s.status === 'Aktif' ? 'badge-success' : 'badge-ghost'}`}>{s.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >«</button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >‹</button>
          {Array.from({ length: totalPage }, (_, i) => (
            <button
              key={i + 1}
              className={`join-item btn btn-sm${page === i + 1 ? ' btn-active' : ''}`}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
          <button
            className="join-item btn btn-sm"
            onClick={() => setPage(p => Math.min(totalPage, p + 1))}
            disabled={page === totalPage}
          >›</button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setPage(totalPage)}
            disabled={page === totalPage}
          >»</button>
        </div>
      </div>
    </div>
  );
} 