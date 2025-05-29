"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

export default function TambahGuruPage() {
  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showActionToast } = useAppActionFeedback();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/guru", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nip, gender }),
    });
    setLoading(false);
    if (res.ok) {
      showActionToast("Guru berhasil ditambahkan!", "success");
      router.push(`/admin/guru?status=success&message=${encodeURIComponent("Guru berhasil ditambahkan!")}`);
    } else {
      showActionToast("Gagal menambah guru", "error");
    }
  }

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Tambah Guru</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input className="input input-bordered" placeholder="Nama" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input input-bordered" placeholder="NIP" value={nip} onChange={e => setNip(e.target.value)} />
        <select className="input input-bordered" value={gender} onChange={e => setGender(e.target.value)} required>
          <option value="">Pilih Gender</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</button>
      </form>
    </div>
  );
} 