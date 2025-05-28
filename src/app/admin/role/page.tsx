"use client";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";

export default function RolePage() {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: 0, name: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    setLoading(true);
    fetch("/api/role")
      .then(res => res.json())
      .then(data => {
        setRoles(data.roles || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data role");
        setLoading(false);
      });
  }

  function openForm(role?: { id: number; name: string }) {
    setForm(role ? { ...role } : { id: 0, name: "" });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Nama role wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/role", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id, name: form.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        fetchRoles();
      } else {
        setFormError(data.error || "Gagal menyimpan role");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus role ini?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/role", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchRoles();
      } else {
        alert(data.error || "Gagal menghapus role");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-base-200 shadow-xl p-6 md:p-10 rounded-2xl border border-primary/30 text-base-content w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-primary">Manajemen Role</h2>
        <button className="btn btn-primary btn-sm gap-2" onClick={() => openForm()}><Plus className="w-4 h-4" />Tambah Role</button>
      </div>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <div className="overflow-x-auto rounded-xl">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th>ID</th>
              <th>Nama Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center">Memuat data...</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={3} className="text-center">Tidak ada data</td></tr>
            ) : (
              roles.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>
                    <button className="btn btn-xs btn-ghost text-primary" onClick={() => openForm(r)}><Pencil className="w-4 h-4" /></button>
                    <button className="btn btn-xs btn-ghost text-error" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => setShowForm(false)}><X /></button>
            <h3 className="text-lg font-bold mb-4 text-base-content">{form.id ? "Edit Role" : "Tambah Role"}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-base font-semibold mb-1 text-base-content">Nama Role <span className="text-error">*</span></label>
                <input type="text" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input input-bordered w-full text-base-content" placeholder="Nama role" required autoFocus />
              </div>
              {formError && <div className="alert alert-error py-2 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" className="btn btn-outline text-base-content" onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save className="w-4 h-4" /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 