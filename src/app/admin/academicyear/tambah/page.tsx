"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

export default function TambahAcademicYearPage() {
  const [year, setYear] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showActionToast } = useAppActionFeedback();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/academicyear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, is_active: isActive }),
    });
    setLoading(false);
    if (res.ok) {
      showActionToast("Tahun akademik berhasil ditambahkan!", "success");
      router.push(`/admin/academicyear?status=success&message=${encodeURIComponent("Tahun akademik berhasil ditambahkan!")}`);
    } else {
      showActionToast("Gagal menambah tahun akademik", "error");
    }
  }

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Tambah Tahun Akademik</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="input input-bordered"
          type="text"
          value={year}
          onChange={e => setYear(e.target.value)}
          placeholder="Contoh: 2024/2025"
          required
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
          />
          Jadikan Tahun Aktif
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</button>
      </form>
    </div>
  );
} 