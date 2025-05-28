"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { normalizeAvatarUrl } from "@/lib/utils";
import { useUI } from "@/lib/ui-context";

type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: { id: number; name: string };
  created_at: string;
};

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { showToast, showConfirmModal } = useUI();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/user?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        console.log("User list data:", data);
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Gagal mengambil data user");
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: number) {
    const userData = users.find(u => u.id === id);
    if (!userData) return;
    
    showConfirmModal({
      title: "Konfirmasi Hapus",
      message: `Apakah Anda yakin ingin menghapus user <span class="font-semibold text-primary">${userData.name}</span> (${userData.email})?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/user", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          
          if (res.ok) {
            setUsers(users => users.filter(u => u.id !== id));
            showToast("User berhasil dihapus", "success");
            
            // Reload notifikasi setelah operasi hapus
            if (typeof window !== 'undefined' && window.reloadNotifications) {
              window.reloadNotifications();
            }
          } else {
            const data = await res.json();
            showToast(data.error || "Gagal menghapus user", "error");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          showToast("Terjadi kesalahan jaringan", "error");
        }
      }
    });
  }

  return (
    <div className="card bg-base-200 shadow-xl p-4 sm:p-6 rounded-2xl border border-primary/30 text-base-content w-full max-w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Daftar User</h2>
        <Link href="/admin/user/tambah" className="btn btn-primary btn-sm md:btn-md gap-2 rounded-lg">
          <Plus className="w-5 h-5" />
          <span>Tambah User</span>
        </Link>
      </div>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <div className="overflow-x-auto rounded-xl">
        <table className="table table-zebra w-full md:min-w-[600px]">
          <thead>
            <tr className="bg-base-200">
              <th>ID</th>
              <th>Avatar</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center">Memuat data...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center">Tidak ada data</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    {u.avatar ? (
                      <Image 
                        src={normalizeAvatarUrl(u.avatar)} 
                        alt={u.name} 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 rounded-full object-cover border"
                        key={`avatar-list-${u.id}-${u.avatar}`}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {u.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-outline">{u.role?.name}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                  <td>
                    <button className="btn btn-xs btn-ghost text-primary" onClick={() => router.push(`/admin/user/edit/${u.id}`)}><Pencil className="w-4 h-4" /></button>
                    <button className="btn btn-xs btn-ghost text-error" onClick={() => handleDelete(u.id)}><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 