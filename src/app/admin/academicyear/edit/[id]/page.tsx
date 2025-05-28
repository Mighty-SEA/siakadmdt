"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

export default function EditAcademicYearPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [year, setYear] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { showActionToast } = useAppActionFeedback();

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    fetch(`/api/academicyear?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.academicYear) {
          setYear(data.academicYear.year || "");
          setIsActive(!!data.academicYear.is_active);
        }
        setFetching(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/academicyear", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, year, is_active: isActive }),
    });
    setLoading(false);
    if (res.ok) {
      showActionToast("Tahun akademik berhasil diupdate!", "success");
      router.push(`/admin/academicyear?status=success&message=${encodeURIComponent("Tahun akademik berhasil diupdate!")}`);
    } else {
      showActionToast("Gagal mengedit tahun akademik", "error");
    }
  }

  if (fetching) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Tahun Akademik</h2>
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