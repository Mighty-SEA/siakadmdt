"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import Image from 'next/image';

export default function LoginForm() {
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
        Cookies.remove('user', { path: '/' });
        // Simpan user ke cookie dengan sessionId dan loginTimestamp hanya di client
        if (typeof window !== 'undefined') {
          const now = Date.now();
          const userData = { 
            ...data.user, 
            loginTimestamp: now,
            sessionId: now.toString()
          };
          Cookies.set("user", JSON.stringify(userData), { 
            expires: 7, 
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            path: '/'
          });
        }
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
    <div className="min-h-screen flex items-center justify-center flex-col relative transition-colors duration-300 bg-base-200" style={{ minHeight: '100vh', padding: '0 1rem' }}>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <label className="font-semibold text-base-content">Tema:</label>
        <select
          className="select select-bordered w-28 text-base-content"
          value={theme}
          onChange={e => setTheme(e.target.value)}
        >
          {themes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {/* Logo besar di atas form */}
      <Image src="/android-chrome-512x512.png" alt="Logo" width={90} height={90} style={{ marginBottom: 18, borderRadius: 20, boxShadow: '0 4px 32px 0 rgba(251,174,60,0.18)' }} />
      <form onSubmit={handleSubmit} className="bg-base-100 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-yellow-200" style={{backdropFilter:'blur(6px)', boxShadow:'0 8px 40px 0 rgba(251,174,60,0.13), 0 2px 12px 0 rgba(0,0,0,0.10)'}}>
        <h1 className="text-3xl font-extrabold mb-6 text-center text-yellow-600" style={{letterSpacing:1}}>Login Admin</h1>
        {error && <div className="alert alert-error mb-4 text-sm font-semibold">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-base-content">Username</label>
          <input
            type="text"
            name="username"
            className="input input-bordered w-full text-base-content bg-base-200 focus:bg-white focus:border-yellow-400"
            value={form.username}
            onChange={handleChange}
            disabled={loading || isLocked}
            autoComplete="username"
            placeholder="Masukkan username"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-base-content">Password</label>
          <input
            type="password"
            name="password"
            className="input input-bordered w-full text-base-content bg-base-200 focus:bg-white focus:border-yellow-400"
            value={form.password}
            onChange={handleChange}
            disabled={loading || isLocked}
            autoComplete="current-password"
            placeholder="Masukkan password"
          />
        </div>
        <button
          type="submit"
          className="btn w-full text-lg font-bold border-0" style={{background:'linear-gradient(90deg,#FFD36E,#FBAE3C)',color:'#1a237e',boxShadow:'0 4px 18px 0 rgba(251,174,60,0.13)'}}
          disabled={loading || isLocked}
        >
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
} 