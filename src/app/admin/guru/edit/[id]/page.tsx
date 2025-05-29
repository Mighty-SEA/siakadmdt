"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppActionFeedback } from "@/lib/useAppActionFeedback";

export default function EditGuruPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { showActionToast } = useAppActionFeedback();

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    fetch(`/api/guru?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.guru) {
          setName(data.guru.name || "");
          setNip(data.guru.nip || "");
          setGender(data.guru.gender || "");
        }
        setFetching(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/guru", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, nip, gender }),
    });
    setLoading(false);
    if (res.ok) {
      showActionToast("Guru berhasil diupdate!", "success");
      router.push(`/admin/guru?status=success&message=${encodeURIComponent("Guru berhasil diupdate!")}`);
    } else {
      showActionToast("Gagal mengedit guru", "error");
    }
  }

  if (fetching) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="max-w-lg mx-auto card bg-base-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Guru</h2>
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