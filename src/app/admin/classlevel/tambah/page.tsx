"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

export default function TambahClassLevelPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showActionToast } = useAppActionFeedback();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/classlevel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      showActionToast("Tingkat kelas berhasil ditambahkan!", "success");
      router.push(`/admin/classlevel?status=success&message=${encodeURIComponent("Tingkat kelas berhasil ditambahkan!")}`);
    } else {
      showActionToast("Gagal menambah tingkat kelas", "error");
    }
  }

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Tambah Tingkat Kelas</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="input input-bordered"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Contoh: Kelas 1, Kelas 2, dst"
          required
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</button>
      </form>
    </div>
  );
} 