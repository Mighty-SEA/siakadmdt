import Link from "next/link";

export default function TambahSiswaPage() {
  return (
    <div className="max-w-lg mx-auto bg-base-200 rounded-2xl shadow-xl p-6 border border-primary/30 mt-6 text-base-content">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Tambah Siswa</h2>
        <Link href="/admin/siswa" className="btn btn-ghost btn-sm text-base-content border border-base-300 hover:bg-base-300/30">Kembali</Link>
      </div>
      <form className="flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1 text-base-content">Nama</label>
          <input type="text" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content" placeholder="Nama siswa" />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-base-content">NIS</label>
          <input type="text" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content" placeholder="Nomor Induk Siswa" />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-base-content">Kelas</label>
          <input type="text" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content" placeholder="Kelas" />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-base-content">Status</label>
          <select className="select select-bordered w-full bg-base-100 border-base-300 text-base-content">
            <option value="Aktif">Aktif</option>
            <option value="Lulus">Lulus</option>
          </select>
        </div>
        <button type="button" className="btn btn-primary mt-2">Simpan</button>
      </form>
    </div>
  );
} 