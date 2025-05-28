"use client";

import Link from "next/link";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/lib/ui-context";
import Cookies from "js-cookie";

export default function TambahSiswaPage() {
  const [tab, setTab] = useState<'pribadi' | 'ortu'>('pribadi');
  const [form, setForm] = useState({
    name: "",
    nis: "",
    birth_date: "",
    birth_place: "",
    gender: "",
    is_alumni: "",
    nik: "",
    kk: "",
    origin_school: "",
    nisn: "",
    qr_token: "",
    father_name: "",
    father_job: "",
    mother_name: "",
    mother_job: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useUI();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          is_alumni: form.is_alumni === "true" ? true : false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/siswa?status=success&message=${encodeURIComponent("Siswa berhasil ditambahkan!")}`);
      } else {
        showToast(data.error || "Gagal menambah siswa", "error");
      }
    } catch (_err) {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  }

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
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        {/* Data Pribadi */}
        {tab === 'pribadi' && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-start">
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Nama <span className="text-error">*</span></label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nama siswa" required />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">NIS <span className="text-error">*</span></label>
                <input type="text" name="nis" value={form.nis} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nomor Induk Siswa" required />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Tanggal Lahir</label>
                <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Tempat Lahir</label>
                <input type="text" name="birth_place" value={form.birth_place} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Tempat Lahir" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Jenis Kelamin <span className="text-error">*</span></label>
                <select name="gender" value={form.gender} onChange={handleChange} className="select select-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" required>
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Status Alumni</label>
                <select name="is_alumni" value={form.is_alumni} onChange={handleChange} className="select select-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20">
                  <option value="">Pilih Status</option>
                  <option value="false">Aktif</option>
                  <option value="true">Lulus</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">NIK</label>
                <input type="text" name="nik" value={form.nik} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="NIK (16 digit)" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">No. KK</label>
                <input type="text" name="kk" value={form.kk} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="No. KK (16 digit)" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Asal Sekolah</label>
                <input type="text" name="origin_school" value={form.origin_school} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Asal Sekolah" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">NISN</label>
                <input type="text" name="nisn" value={form.nisn} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="NISN (10 digit)" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-semibold mb-1 text-base-content">QR Token</label>
                <input type="text" name="qr_token" value={form.qr_token} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="QR Token" />
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
                <input type="text" name="father_name" value={form.father_name} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nama Ayah" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Pekerjaan Ayah</label>
                <input type="text" name="father_job" value={form.father_job} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Pekerjaan Ayah" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Nama Ibu</label>
                <input type="text" name="mother_name" value={form.mother_name} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Nama Ibu" />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Pekerjaan Ibu</label>
                <input type="text" name="mother_job" value={form.mother_job} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20" placeholder="Pekerjaan Ibu" />
              </div>
            </div>
          </section>
        )}
        <div className="flex justify-between mt-8 gap-4">
          <Link href="/admin/siswa" className="btn btn-error btn-outline btn-lg px-8">Cancel</Link>
          <button type="submit" className="btn btn-primary btn-lg shadow-lg gap-2 px-8" disabled={loading}>
            <Save className="w-5 h-5" /> {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
} 