"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const themes = [
    "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter","dim","nord","sunset","caramellatte","abyss","silk"
  ];
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, []);

  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        // Simpan user ke localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/admin");
      } else {
        setError(data.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 flex-col relative transition-colors duration-300">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <label className="font-semibold text-base-content">Tema:</label>
        <select
          className="select select-bordered w-28 text-base-content"
          value={theme}
          onChange={e => setTheme(e.target.value)}
        >
          {themes.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg mb-2 animate-fade-in">
          <span className="text-3xl text-base-100">📚</span>
        </div>
        <h1 className="text-3xl font-extrabold text-primary drop-shadow mb-1 animate-fade-in">MDT BILAL</h1>
        <span className="text-base text-base-content/70 animate-fade-in">Sistem Informasi Admin</span>
      </div>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-2xl p-8 rounded-2xl border border-primary/30 w-full max-w-sm flex flex-col gap-6 transition-all duration-300 animate-fade-in">
        <h2 className="text-2xl font-bold text-primary mb-2 text-center">Login Admin</h2>
        <div>
          <label className="block font-semibold mb-1 text-base-content">Username / Email</label>
          <input type="text" name="username" value={form.username} onChange={handleChange} className="input input-bordered w-full focus:ring-2 focus:ring-primary/30 transition-all text-base-content" placeholder="Username atau email" required autoFocus />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-base-content">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="input input-bordered w-full focus:ring-2 focus:ring-primary/30 transition-all text-base-content" placeholder="Password" required />
        </div>
        {error && <div className="alert alert-error py-2 text-sm animate-fade-in">{error}</div>}
        <button type="submit" className="btn btn-primary w-full transition-all duration-200 hover:scale-105 hover:shadow-lg" disabled={loading}>{loading ? "Memproses..." : "Login"}</button>
      </form>
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-primary/10 via-base-200/60 to-secondary/10 blur-2xl opacity-80 animate-fade-in"></div>
    </div>
  );
} 