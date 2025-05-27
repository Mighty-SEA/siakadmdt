"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Save } from "lucide-react";

export default function EditUserPage() {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
    roleId: 1,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [oldAvatar, setOldAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch(`/api/user`);
      const data = await res.json();
      const user = (data.users || []).find((u: any) => String(u.id) === String(id));
      if (user) {
        setForm({
          name: user.name || "",
          email: user.email || "",
          password: "",
          avatar: user.avatar || "",
          roleId: user.roleId || 1,
        });
        setOldAvatar(user.avatar || "");
      }
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    fetch("/api/role")
      .then(res => res.json())
      .then(data => setRoles(data.roles || []));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Nama dan email wajib diisi!");
      return;
    }
    setLoading(true);
    let avatarUrl = form.avatar || null;
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const resUpload = await fetch("/api/user/upload", {
          method: "POST",
          body: formData,
        });
        const dataUpload = await resUpload.json();
        if (resUpload.ok) {
          avatarUrl = dataUpload.url;
        } else {
          alert(dataUpload.error || "Gagal upload avatar");
          setLoading(false);
          return;
        }
      }
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: form.name,
          email: form.email,
          password: form.password,
          avatar: avatarUrl,
          roleId: form.roleId || roles[0]?.id || 1,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("User berhasil diupdate!");
        router.push("/admin/user");
      } else {
        alert(data.error || "Gagal mengupdate user");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (form.avatar && form.avatar !== oldAvatar) {
      const filename = form.avatar.split("/").pop();
      if (filename) {
        fetch("/api/user/avatar-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });
      }
    }
    router.push("/admin/user");
  }

  return (
    <div className="card bg-base-200 shadow-2xl p-8 md:p-12 rounded-2xl border border-primary/30 text-base-content w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-primary">Edit User</h2>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-base-content mb-2">Edit Data User</h3>
        <p className="text-base-content/70 text-sm">Perbarui data user sesuai kebutuhan. Kosongkan password jika tidak ingin mengubah.</p>
      </div>
      <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 items-start">
          <div className="md:col-span-2 flex flex-col items-center mb-2">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="w-28 h-28 rounded-full object-cover border-4 border-primary shadow-lg mb-2" />
            ) : form.avatar ? (
              <img src={form.avatar.startsWith('http') ? form.avatar : form.avatar.includes('/avatar/') ? form.avatar : `/avatar/${form.avatar}`} alt="Avatar preview" className="w-28 h-28 rounded-full object-cover border-4 border-primary shadow-lg mb-2" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary text-white flex items-center justify-center font-bold text-4xl mb-2 shadow-lg border-4 border-primary">
                {form.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="file-input file-input-bordered w-full max-w-xs mt-2" />
            <span className="text-xs text-base-content/60 mt-1">Format: jpg, png, webp. Maks 2MB.</span>
          </div>
          <div>
            <label className="block text-base font-semibold mb-1 text-base-content">Nama <span className="text-error">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20 shadow-sm" placeholder="Nama user" required />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1 text-base-content">Email <span className="text-error">*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20 shadow-sm" placeholder="Email user" required />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1 text-base-content">Role</label>
            <select name="roleId" value={form.roleId || roles[0]?.id || ""} onChange={handleChange} className="select select-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20 shadow-sm">
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-base font-semibold mb-1 text-base-content">Password (kosongkan jika tidak ingin mengubah)</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="input input-bordered w-full bg-base-100 border-base-300 text-base-content rounded-lg focus:ring-2 focus:ring-primary/30 focus:shadow-primary/20 shadow-sm" placeholder="Password baru" />
          </div>
        </div>
        <div className="flex justify-between mt-8 gap-4">
          <Link href="/admin/user" className="btn btn-error btn-outline btn-lg px-8">Cancel</Link>
          <button type="submit" className="btn btn-primary btn-lg shadow-lg gap-2 px-8" disabled={loading}>
            <Save className="w-5 h-5" /> {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
} 