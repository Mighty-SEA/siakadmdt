"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<Date | null>(null);
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/admin';
  const [isMounted, setIsMounted] = useState(false);

  const themes = [
    "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter","dim","nord","sunset","caramellatte","abyss","silk"
  ];
  const [theme, setTheme] = useState("light");

  // Inisialisasi tema dan status lock saat komponen di-mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    
    // Cek apakah ada lock status di localStorage
    const lockStatus = localStorage.getItem('loginLock');
    if (lockStatus) {
      try {
        const { attempts, lockUntil } = JSON.parse(lockStatus);
        const lockDate = new Date(lockUntil);
        
        if (lockDate > new Date()) {
          // Masih dalam periode lock
          setLoginAttempts(attempts);
          setIsLocked(true);
          setLockTime(lockDate);
        } else {
          // Lock sudah berakhir, hapus dari localStorage
          localStorage.removeItem('loginLock');
        }
      } catch {
        // Jika terjadi error saat parsing, hapus item yang rusak
        localStorage.removeItem('loginLock');
      }
    }
    
    setIsMounted(true);
  }, []); // Empty dependency array, hanya dijalankan sekali saat mount

  // Set interval untuk update status lock
  useEffect(() => {
    if (!isMounted) return;
    
    const interval = setInterval(() => {
      if (isLocked && lockTime && lockTime < new Date()) {
        setIsLocked(false);
        setLockTime(null);
        localStorage.removeItem('loginLock');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLocked, lockTime, isMounted]);

  // Perbarui tema saat berubah
  useEffect(() => {
    if (isMounted && theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, isMounted]);

  // Validasi input
  const validateForm = () => {
    if (!form.username.trim()) {
      setError("Username tidak boleh kosong");
      return false;
    }
    
    if (!form.password) {
      setError("Password tidak boleh kosong");
      return false;
    }
    
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }
    
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    // Cek apakah akun terkunci
    if (isLocked && lockTime) {
      const remainingTime = Math.ceil((lockTime.getTime() - Date.now()) / 1000);
      setError(`Akun terkunci. Coba lagi dalam ${remainingTime} detik`);
      return;
    }
    
    // Validasi input
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache" 
        },
        body: JSON.stringify(form),
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (res.ok) {
        // Reset percobaan login
        setLoginAttempts(0);
        localStorage.removeItem('loginLock');
        
        // Hapus cookie lama jika ada untuk memastikan data bersih
        Cookies.remove('user', { path: '/' });
        
        // Simpan user ke cookie dengan opsi yang lebih baik untuk mencegah caching
        const userData = { 
          ...data.user, 
          loginTimestamp: Date.now(),
          sessionId: Date.now().toString() // Tambahkan session ID unik untuk menghindari masalah cache
        };
        
        Cookies.set("user", JSON.stringify(userData), { 
          expires: 7, 
          secure: true,
          sameSite: 'strict',
          path: '/'
        });
        
        // Gunakan hard navigation untuk memastikan halaman di-refresh sepenuhnya
        window.location.href = returnUrl;
      } else {
        // Tambah percobaan login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Jika sudah 3 kali gagal, kunci akun selama 30 detik
        if (newAttempts >= 3) {
          const lockUntil = new Date(Date.now() + 30000); // 30 detik
          setIsLocked(true);
          setLockTime(lockUntil);
          
          // Simpan status lock di localStorage
          localStorage.setItem('loginLock', JSON.stringify({
            attempts: newAttempts,
            lockUntil: lockUntil.toISOString()
          }));
          
          setError(`Terlalu banyak percobaan. Akun dikunci selama 30 detik`);
        } else {
          setError(data.error || "Login gagal");
        }
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
    // Reset error saat user mengetik
    setError("");
  }

  // Tampilkan loading atau null hingga komponen dimount untuk menghindari flickering
  if (!isMounted) {
    return null;
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
          <input 
            type="text" 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            className="input input-bordered w-full focus:ring-2 focus:ring-primary/30 transition-all text-base-content" 
            placeholder="Username atau email" 
            required 
            autoFocus 
            autoComplete="username"
            maxLength={50}
            disabled={isLocked}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-base-content">Password</label>
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            className="input input-bordered w-full focus:ring-2 focus:ring-primary/30 transition-all text-base-content" 
            placeholder="Password" 
            required 
            autoComplete="current-password"
            minLength={6}
            disabled={isLocked}
          />
        </div>
        {error && <div className="alert alert-error py-2 text-sm animate-fade-in">{error}</div>}
        <button 
          type="submit" 
          className="btn btn-primary w-full transition-all duration-200 hover:scale-105 hover:shadow-lg" 
          disabled={loading || isLocked}
        >
          {loading ? "Memproses..." : isLocked ? `Terkunci (${lockTime ? Math.ceil((lockTime.getTime() - Date.now()) / 1000) : 30}s)` : "Login"}
        </button>
      </form>
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-primary/10 via-base-200/60 to-secondary/10 blur-2xl opacity-80 animate-fade-in"></div>
    </div>
  );
} 