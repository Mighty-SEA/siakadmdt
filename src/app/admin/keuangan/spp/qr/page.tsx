"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import Link from "next/link";
import { useAppActionFeedback } from '@/lib/useAppActionFeedback';

export default function QRSppPage() {
  const [qrToken, setQrToken] = useState("");
  const [student, setStudent] = useState<{id: number; name: string; nis: string} | null>(null);
  const [form, setForm] = useState({
    jumlah_bulan: 1,
    paid_at: "",
    amount: "",
    infaq: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { showActionToast } = useAppActionFeedback();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const jumlahBulanRef = useRef<HTMLInputElement>(null);

  async function handleQrTokenBlur() {
    if (!qrToken) return;
    setFetching(true);
    setStudent(null);
    try {
      const res = await fetch(`/api/siswa/by-qr?qr_token=${encodeURIComponent(qrToken)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.siswa) {
          setStudent(data.siswa);
        } else {
          showActionToast("Siswa tidak ditemukan", "error");
        }
      } else {
        showActionToast("Siswa tidak ditemukan", "error");
      }
    } catch {
      showActionToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setFetching(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function fetchLastSpp(studentId: number) {
    const res = await fetch(`/api/spp?student_id=${studentId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      // Ambil pembayaran terakhir
      type SppPayment = { month: number; year: number };
      const last = data.data.reduce((a: SppPayment, b: SppPayment) => {
        if (b.year > a.year) return b;
        if (b.year === a.year && b.month > a.month) return b;
        return a;
      }, data.data[0]);
      return last;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student) {
      showActionToast("Siswa belum dipilih", "error");
      return;
    }
    setLoading(true);
    // Cek pembayaran terakhir
    const last = await fetchLastSpp(student.id);
    if (!last) {
      setShowModal(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/spp/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.id,
          jumlah_bulan: parseInt(String(form.jumlah_bulan)),
          paid_at: form.paid_at,
          amount: parseFloat(form.amount),
          infaq: form.infaq ? parseFloat(form.infaq) : 0,
        }),
      });
      if (res.ok) {
        showActionToast("Pembayaran SPP via QR berhasil ditambahkan", "success");
        router.push(`/admin/keuangan/spp?status=success&message=${encodeURIComponent('Pembayaran SPP via QR berhasil ditambahkan')}`);
      } else {
        const data = await res.json();
        showActionToast(data.error || "Gagal menambah pembayaran SPP", "error");
      }
    } catch {
      showActionToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowModal(false);
    setLoading(true);
    try {
      const res = await fetch("/api/spp/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student?.id,
          jumlah_bulan: parseInt(String(form.jumlah_bulan)),
          paid_at: form.paid_at,
          amount: parseFloat(form.amount),
          infaq: form.infaq ? parseFloat(form.infaq) : 0,
          startMonth,
          startYear,
        }),
      });
      if (res.ok) {
        showActionToast("Pembayaran SPP via QR berhasil ditambahkan", "success");
        router.push(`/admin/keuangan/spp?status=success&message=${encodeURIComponent('Pembayaran SPP via QR berhasil ditambahkan')}`);
      } else {
        const data = await res.json();
        showActionToast(data.error || "Gagal menambah pembayaran SPP", "error");
      }
    } catch {
      showActionToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card bg-base-200 shadow-lg p-6 md:p-10 rounded-2xl border border-primary/30 text-base-content w-full max-w-xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Pembayaran SPP via QR</h2>
          {student && (
            <div className="text-center mt-2 mb-2">
              <div className="text-lg font-bold text-primary">{student.name} <span className="text-base-content/60">({student.nis})</span></div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block font-semibold mb-1">QR Token <span className="text-error">*</span></label>
            <input type="text" name="qr_token" value={qrToken} onChange={e => setQrToken(e.target.value)} onBlur={handleQrTokenBlur} className="input input-bordered w-full" required autoFocus />
          </div>
          <div>
            <label className="block font-semibold mb-1">Jumlah Bulan <span className="text-error">*</span></label>
            <input type="number" name="jumlah_bulan" value={form.jumlah_bulan} onChange={handleChange} className="input input-bordered w-full" min="1" required ref={jumlahBulanRef} />
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
            <button type="submit" className="btn btn-primary gap-2 px-8" disabled={loading || fetching || !student}>
              <Save className="w-5 h-5" /> {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleModalSubmit} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-xs flex flex-col gap-4">
            <h3 className="font-bold text-lg mb-2">Isi Bulan & Tahun Mulai</h3>
            <div>
              <label className="block mb-1">Bulan Mulai</label>
              <input type="number" min="1" max="12" value={startMonth} onChange={e => setStartMonth(Number(e.target.value))} className="input input-bordered w-full" required />
            </div>
            <div>
              <label className="block mb-1">Tahun Mulai</label>
              <input type="number" min="2000" max="2100" value={startYear} onChange={e => setStartYear(Number(e.target.value))} className="input input-bordered w-full" required />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Lanjutkan</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
} 