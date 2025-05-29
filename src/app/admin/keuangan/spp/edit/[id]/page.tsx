"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save } from "lucide-react";
import Link from "next/link";
import { useAppActionFeedback } from '@/lib/useAppActionFeedback';

async function fetchSiswa() {
  const res = await fetch("/api/siswa");
  if (!res.ok) return [];
  const data = await res.json();
  return data.siswa || [];
}

export default function EditSppPage() {
  const [form, setForm] = useState({
    student_id: "",
    month: "",
    year: "",
    paid_at: "",
    amount: "",
    infaq: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [siswaList, setSiswaList] = useState<{id: number; name: string; nis: string}[]>([]);
  const router = useRouter();
  const params = useParams();
  const { showActionToast } = useAppActionFeedback();
  const id = params?.id;

  useEffect(() => {
    fetchSiswa().then(setSiswaList);
    async function fetchData() {
      setFetching(true);
      const res = await fetch(`/api/spp?id=${id}`);
      if (res.ok) {
        const result = await res.json();
        const data = Array.isArray(result.data) ? result.data[0] : result.data;
        if (!data) {
          showActionToast("Data tidak ditemukan", "error");
          router.push("/admin/keuangan/spp");
          setFetching(false);
          return;
        }
        setForm({
          student_id: data.student_id?.toString() || "",
          month: data.month?.toString() || "",
          year: data.year?.toString() || "",
          paid_at: data.paid_at ? data.paid_at.slice(0, 10) : "",
          amount: data.amount?.toString() || "",
          infaq: data.infaq?.toString() || "",
        });
      } else {
        showActionToast("Data tidak ditemukan", "error");
        router.push("/admin/keuangan/spp");
      }
      setFetching(false);
    }
    if (id) fetchData();
  }, [id, router, showActionToast]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/spp?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          student_id: parseInt(form.student_id),
          month: parseInt(form.month),
          year: parseInt(form.year),
          amount: parseFloat(form.amount),
          infaq: form.infaq ? parseFloat(form.infaq) : 0,
        }),
      });
      if (res.ok) {
        showActionToast("Pembayaran SPP berhasil diupdate", "success");
        router.push(`/admin/keuangan/spp?status=success&message=${encodeURIComponent('Pembayaran SPP berhasil diupdate')}`);
      } else {
        const data = await res.json();
        showActionToast(data.error || "Gagal mengupdate pembayaran SPP", "error");
      }
    } catch {
      showActionToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="text-center py-10">Memuat data...</div>;

  return (
    <div className="card bg-base-200 shadow-lg p-6 md:p-10 rounded-2xl border border-primary/30 text-base-content w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-primary">Edit Pembayaran SPP</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block font-semibold mb-1">Siswa <span className="text-error">*</span></label>
          <select name="student_id" value={form.student_id} onChange={handleChange} className="input input-bordered w-full" required>
            <option value="">Pilih Siswa</option>
            {siswaList.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Bulan <span className="text-error">*</span></label>
            <input type="number" name="month" value={form.month} onChange={handleChange} className="input input-bordered w-full" min="1" max="12" required />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Tahun <span className="text-error">*</span></label>
            <input type="number" name="year" value={form.year} onChange={handleChange} className="input input-bordered w-full" min="2000" max="2100" required />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Tanggal Bayar <span className="text-error">*</span></label>
          <input type="date" name="paid_at" value={form.paid_at} onChange={handleChange} className="input input-bordered w-full" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Nominal (Rp) <span className="text-error">*</span></label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="input input-bordered w-full" min="0" step="0.01" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Infaq</label>
          <input type="number" name="infaq" value={form.infaq} onChange={handleChange} className="input input-bordered w-full" min="0" step="0.01" />
        </div>
        <div className="flex justify-between mt-8 gap-4">
          <Link href="/admin/keuangan/spp" className="btn btn-error btn-outline px-8">Batal</Link>
          <button type="submit" className="btn btn-primary gap-2 px-8" disabled={loading}>
            <Save className="w-5 h-5" /> {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
} 