"use client";
import { useEffect, useState, useRef } from "react";
import { Filter, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, MoreHorizontal, Upload, Download, Plus } from "lucide-react";
import Link from "next/link";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface AdminTableTemplateProps<T> {
  title: string;
  columns: Column<T>[];
  fetchUrl: string;
  importUrl?: string;
  exportUrl?: string;
  addUrl: string;
  deleteUrl: string;
  rowKey?: string;
  defaultColumns?: string[];
  searchPlaceholder?: string;
  refreshKey?: number;
  renderActions?: () => React.ReactNode;
}

export default function AdminTableTemplate<T extends { [key: string]: unknown }>({
  title,
  columns,
  fetchUrl,
  importUrl,
  exportUrl,
  addUrl,
  deleteUrl,
  rowKey = "id",
  defaultColumns,
  searchPlaceholder = "Cari...",
  refreshKey = 0,
  renderActions,
}: AdminTableTemplateProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns || columns.map(c => c.key));
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressActiveRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    fetch(fetchUrl)
      .then(res => res.json())
      .then(res => {
        setData(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [fetchUrl, refreshKey]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setSelectedColumns(["no", ...columns.slice(1, 2).map(c => c.key), "aksi"]);
      } else {
        setSelectedColumns(defaultColumns || columns.map(c => c.key));
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [columns, defaultColumns]);

  const filtered = data.filter(row =>
    columns.some(col => {
      const value = row[col.key];
      return value && value.toString().toLowerCase().includes(search.toLowerCase());
    })
  );

  // Pagination
  const totalPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Bulk select
  const handleSelectAllInPage = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paged.map(row => String(row[rowKey]));
      setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
    } else {
      const currentPageIds = new Set(paged.map(row => String(row[rowKey])));
      setSelectedRows(prev => prev.filter(id => !currentPageIds.has(id)));
    }
  };
  const isAllInPageSelected = () => paged.length > 0 && paged.every(row => selectedRows.includes(String(row[rowKey])));
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };
  const handleSelectAll = () => setSelectedRows(filtered.map(row => String(row[rowKey])));
  const handleDeselectAll = () => setSelectedRows([]);

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows }),
      });
      if (res.ok) {
        // Fetch ulang data dari server
        setLoading(true);
        fetch(fetchUrl)
          .then(res => res.json())
          .then(res => {
            setData(res.data || []);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
        setSelectedRows([]);
      } else {
        // Tampilkan notifikasi jika gagal
        alert("Gagal menghapus data. Silakan coba lagi.");
      }
    } catch {
      alert("Gagal menghapus data. Silakan coba lagi.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Pagination long press
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
      longPressTimerRef.current = setTimeout(changePage, 150);
    };
    longPressTimerRef.current = setTimeout(changePage, 500);
  };
  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressActiveRef.current = false;
  };

  useEffect(() => { setSelectedRows([]); }, [search]);

  // Info jumlah data
  const startData = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endData = Math.min(page * pageSize, filtered.length);

  return (
    <div className="card bg-base-200 shadow-xl p-4 sm:p-6 rounded-2xl border border-primary/30 text-base-content w-full max-w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">{title}</h2>
        <div className="flex gap-2">
          {importUrl && <button className="btn btn-outline btn-secondary btn-sm md:btn-md gap-2 rounded-lg border-2 border-secondary hover:bg-secondary/10 hover:border-secondary focus:shadow transition-all duration-150" type="button"><Upload className="w-5 h-5" /><span>Import</span></button>}
          {exportUrl && <button className="btn btn-outline btn-primary btn-sm md:btn-md gap-2 rounded-lg border-2 border-primary hover:bg-primary/10 hover:border-primary focus:shadow transition-all duration-150" type="button"><Download className="w-5 h-5" /><span>Export</span></button>}
          {renderActions && renderActions()}
          <Link href={addUrl} className="btn btn-primary btn-sm md:btn-md gap-2 rounded-lg"><Plus className="w-5 h-5" /><span>Tambah</span></Link>
        </div>
      </div>
      {/* Filter Kolom, Cari Nama */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center md:items-end w-full">
        <div className="flex items-center gap-2 w-full">
          {/* Tombol bulk action di kiri input search */}
          <div className="dropdown dropdown-bottom">
            <button
              tabIndex={0}
              className={`btn btn-sm btn-ghost rounded-full ${selectedRows.length === 0 ? 'text-base-content/30 cursor-not-allowed' : 'text-base-content'}`}
              title="Aksi Bulk"
              disabled={selectedRows.length === 0}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 border border-primary/20">
              <li>
                <button
                  className="flex items-center gap-2 text-error"
                  onClick={handleBulkDelete}
                  disabled={selectedRows.length === 0 || bulkActionLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              </li>
            </ul>
          </div>
          {/* Input search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              className="input input-bordered input-sm md:input-md w-full pl-10 pr-3 rounded-lg border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <div className="dropdown dropdown-end dropdown-bottom">
              <label tabIndex={0} className="btn btn-sm md:btn-md btn-outline min-w-[56px] flex justify-between items-center gap-2 cursor-pointer hover:shadow focus:shadow border-primary/40">
                <Filter className="w-5 h-5 text-primary" />
                <span className="badge badge-primary badge-sm">{selectedColumns.length}/{columns.length}</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </label>
              <ul tabIndex={0} className="dropdown-content right-0 z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-80 border border-primary/20 grid grid-cols-3 gap-2">
                {columns.map(col => (
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
      {/* Bulk Action */}
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-base-100/50 p-2 rounded-lg border border-primary/10">
          <div className="flex flex-wrap items-center gap-1">
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
          <div className="text-sm font-medium text-right">{selectedRows.length} data dipilih</div>
        </div>
      )}
      {/* Tabel */}
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
              {columns.map(col => selectedColumns.includes(col.key) && <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={selectedColumns.length + 1} className="text-center">Memuat data...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={selectedColumns.length + 1} className="text-center">Tidak ada data</td></tr>
            ) : (
              paged.map((row) => (
                <tr key={String(row[rowKey])} className={selectedRows.includes(String(row[rowKey])) ? "bg-primary/5" : undefined}>
                  <td>
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={selectedRows.includes(String(row[rowKey]))}
                        onChange={() => toggleRowSelection(String(row[rowKey]))}
                      />
                    </label>
                  </td>
                  {columns.map((col, index) => selectedColumns.includes(col.key) && (
                    <td key={col.key}>{col.render ? col.render(row, index + (page - 1) * pageSize) : (row[col.key] as React.ReactNode)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Info jumlah data, dropdown page size di tengah, dan pagination di kanan (identik siswa) */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4 md:gap-8 w-full">
        {/* Info jumlah data di kiri */}
        <div className="flex items-center gap-2 w-full md:w-1/3 justify-center md:justify-start text-base-content/80 text-sm">
          {filtered.length > 0 ? (
            <span>
              Menampilkan {startData}
              {' '}sampai{' '}
              {endData}
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
            {/* Desktop pagination dengan angka dan ellipsis */}
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