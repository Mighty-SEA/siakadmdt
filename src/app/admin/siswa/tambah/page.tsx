"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { useState } from "react";

export default function TambahSiswaPage() {
  const [tab, setTab] = useState<'pribadi' | 'ortu'>('pribadi');

  return (
    <div className="card bg-base-200 shadow-lg p-6 md:p-10 rounded-2xl border border-primary/30 text-base-content w-full max-w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-primary">Tambah Siswa</h2>
      </div>
      {/* Tab Button */}
      <div className="flex gap-2 mb-8">
        <button
          type="button"
          className={`btn btn-md rounded-b-none font-semibold px-6 transition-all duration-150 ${tab === 'pribadi' ? 'btn-primary border-b-4 border-primary shadow-md' : 'btn-outline border-base-300 bg-base-100'}`}
          onClick={() => setTab('pribadi')}
        >
          Data Pribadi
        </button>
        <button
          type="button"
          className={`btn btn-md rounded-b-none font-semibold px-6 transition-all duration-150 ${tab === 'ortu' ? 'btn-primary border-b-4 border-primary shadow-md' : 'btn-outline border-base-300 bg-base-100'}`}
          onClick={() => setTab('ortu')}
        >
          Data Orang Tua
        </button>
      </div>
      <form className="flex flex-col gap-8">
        {/* Data Pribadi */}
        {tab === 'pribadi' && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-start">
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Nama <span className="text-error">*</span></label>
                <input type="text" name="name" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nama siswa" required />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">NIS <span className="text-error">*</span></label>
                <input type="text" name="nis" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nomor Induk Siswa" required />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Tanggal Lahir</label>
                <input type="date" name="birth_date" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Tempat Lahir</label>
                <input type="text" name="birth_place" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Tempat Lahir" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Jenis Kelamin <span className="text-error">*</span></label>
                <select name="gender" className="select select-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" required>
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Status Alumni</label>
                <select name="is_alumni" className="select select-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20">
                  <option value="">Pilih Status</option>
                  <option value="false">Aktif</option>
                  <option value="true">Lulus</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">NIK</label>
                <input type="text" name="nik" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="NIK (16 digit)" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">No. KK</label>
                <input type="text" name="kk" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="No. KK (16 digit)" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Asal Sekolah</label>
                <input type="text" name="origin_school" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Asal Sekolah" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">NISN</label>
                <input type="text" name="nisn" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="NISN (10 digit)" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-semibold mb-1 text-base-content">QR Token</label>
                <input type="text" name="qr_token" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="QR Token" />
              </div>
            </div>
          </section>
        )}
        {/* Data Orang Tua */}
        {tab === 'ortu' && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-start">
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Nama Ayah</label>
                <input type="text" name="father_name" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nama Ayah" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Pekerjaan Ayah</label>
                <input type="text" name="father_job" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Pekerjaan Ayah" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Nama Ibu</label>
                <input type="text" name="mother_name" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nama Ibu" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Pekerjaan Ibu</label>
                <input type="text" name="mother_job" className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Pekerjaan Ibu" />
              </div>
            </div>
          </section>
        )}
        <div className="flex justify-between mt-8 gap-4">
          <Link href="/admin/siswa" className="btn btn-error btn-outline btn-lg px-8">Cancel</Link>
          <button type="button" className="btn btn-primary btn-lg shadow-lg gap-2 px-8"><Save className="w-5 h-5" /> Simpan</button>
        </div>
      </form>
    </div>
  );
} 