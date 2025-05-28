"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

export default function EditClassLevelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { showActionToast } = useAppActionFeedback();

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    fetch(`/api/classlevel?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.classLevel) {
          setName(data.classLevel.name || "");
        }
        setFetching(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/classlevel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    setLoading(false);
    if (res.ok) {
      showActionToast("Tingkat kelas berhasil diupdate!", "success");
      router.push(`/admin/classlevel?status=success&message=${encodeURIComponent("Tingkat kelas berhasil diupdate!")}`);
    } else {
      showActionToast("Gagal mengedit tingkat kelas", "error");
    }
  }

  if (fetching) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Tingkat Kelas</h2>
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