"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save } from "lucide-react";
import Link from "next/link";
import { useUI } from "@/lib/ui-context";
import { useAppActionFeedback } from '@/lib/useAppActionFeedback';

export default function EditIncomePage() {
  const [form, setForm] = useState({
    date: "",
    description: "",
    amount: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { showToast } = useUI();
  const { showActionToast } = useAppActionFeedback();
  const id = params?.id;

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      const res = await fetch(`/api/income?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          date: data.date?.slice(0, 10) || "",
          description: data.description || "",
          amount: data.amount?.toString() || "",
          category: data.category || "",
        });
      } else {
        showToast("Data tidak ditemukan", "error");
        router.push("/admin/keuangan/income");
      }
      setFetching(false);
    }
    if (id) fetchData();
  }, [id, router, showToast]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/income?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });
      if (res.ok) {
        showActionToast("Pemasukan berhasil diupdate", "success");
        router.push(`/admin/keuangan/income?status=success&message=${encodeURIComponent('Pemasukan berhasil diupdate')}`);
      } else {
        const data = await res.json();
        showActionToast(data.error || "Gagal mengupdate pemasukan", "error");
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
        <h2 className="text-3xl font-bold text-primary">Edit Pemasukan</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block font-semibold mb-1">Tanggal <span className="text-error">*</span></label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="input input-bordered w-full" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Deskripsi <span className="text-error">*</span></label>
          <textarea name="description" value={form.description} onChange={handleChange} className="textarea textarea-bordered w-full" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Jumlah (Rp) <span className="text-error">*</span></label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="input input-bordered w-full" min="0" step="0.01" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Kategori</label>
          <input type="text" name="category" value={form.category} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div className="flex justify-between mt-8 gap-4">
          <Link href="/admin/keuangan/income" className="btn btn-error btn-outline px-8">Batal</Link>
          <button type="submit" className="btn btn-primary gap-2 px-8" disabled={loading}>
            <Save className="w-5 h-5" /> {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
} 