"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { User, Users, BookOpen, ClipboardList, CalendarCheck, Wallet, Bell, Search, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Selector tema (menggunakan local state)
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const themes = [
    "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter","dim","nord","sunset","caramellatte","abyss","silk"
  ];
  const drawerInputRef = useRef<HTMLInputElement>(null);

  // Ambil tema dari localStorage saat mount
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, []);

  // Simpan tema ke localStorage dan update data-theme setiap kali berubah
  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  // Ambil state sidebar dari localStorage saat mount
  useEffect(() => {
    const savedSidebar = typeof window !== 'undefined' ? localStorage.getItem('sidebarOpen') : null;
    if (savedSidebar !== null) {
      setSidebarOpen(savedSidebar === 'true');
    }
  }, []);

  // Simpan state sidebar ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  // Sinkronkan drawerOpen dengan input checkbox drawer-toggle
  useEffect(() => {
    if (drawerInputRef.current) {
      drawerInputRef.current.checked = drawerOpen;
    }
  }, [drawerOpen]);

  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen">
          {/* Drawer untuk mobile */}
          <div className="drawer md:hidden">
            <input id="drawer-sidebar" type="checkbox" className="drawer-toggle" ref={drawerInputRef} checked={drawerOpen} onChange={() => setDrawerOpen(!drawerOpen)} />
            <div className="drawer-content flex flex-col w-full">
              {/* Topbar mobile */}
              <header className="w-full bg-base-100 shadow flex items-center justify-between px-4 py-3 gap-2 md:hidden">
                <button className="btn btn-ghost btn-circle" onClick={() => setDrawerOpen(true)} aria-label="Buka Menu">
                  <Menu className="w-6 h-6 text-base-content" />
                </button>
                <span className="font-bold text-xl text-primary">SIAKAD</span>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-circle"><Bell className="w-6 h-6 text-base-content" /></button>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar ring-2 ring-primary hover:ring-4 hover:ring-primary/60 transition-all duration-200">
                      <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-base-content" />
                      </div>
                    </label>
                    <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-40">
                      <li><a>Profil</a></li>
                      <li><a>Keluar</a></li>
                    </ul>
                  </div>
                </div>
              </header>
              {/* Konten utama di mobile */}
              <main className="flex-1 p-4 bg-base-100 transition-all duration-200">{children}</main>
            </div>
            <div className="drawer-side z-40">
              <label htmlFor="drawer-sidebar" className="drawer-overlay"></label>
              <aside className="menu p-4 w-64 min-h-full bg-base-200 text-base-content flex flex-col relative">
                <div className="font-bold text-2xl mb-8 text-primary flex items-center gap-2 mt-4">
                  <BookOpen className="w-7 h-7 text-primary" />
                  <span>SIAKAD</span>
                  <button className="btn btn-ghost btn-circle ml-auto md:hidden" onClick={() => setDrawerOpen(false)} aria-label="Tutup Menu">
                    <X className="w-6 h-6 text-base-content" />
                  </button>
                </div>
                <nav className="flex flex-col gap-1">
                  <Link className={`btn btn-ghost justify-start gap-3${pathname === "/admin" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin" onClick={() => setDrawerOpen(false)}><BookOpen className="w-5 h-5" />Dashboard</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname === "/admin/siswa" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/siswa" onClick={() => setDrawerOpen(false)}><Users className="w-5 h-5" />Siswa</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname === "/admin/kelas" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/kelas" onClick={() => setDrawerOpen(false)}><ClipboardList className="w-5 h-5" />Kelas</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname === "/admin/guru" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/guru" onClick={() => setDrawerOpen(false)}><User className="w-5 h-5" />Guru</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname.startsWith("/admin/user") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/user" onClick={() => setDrawerOpen(false)}><User className="w-5 h-5" />User</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname.startsWith("/admin/role") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/role" onClick={() => setDrawerOpen(false)}><Users className="w-5 h-5" />Role</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname === "/admin/nilai" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/nilai" onClick={() => setDrawerOpen(false)}><BookOpen className="w-5 h-5" />Nilai</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname === "/admin/absensi" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/absensi" onClick={() => setDrawerOpen(false)}><CalendarCheck className="w-5 h-5" />Absensi</Link>
                  <Link className={`btn btn-ghost justify-start gap-3${pathname === "/admin/keuangan" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/keuangan" onClick={() => setDrawerOpen(false)}><Wallet className="w-5 h-5" />Keuangan</Link>
                </nav>
                <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-base-300">
                  <button className="btn btn-ghost justify-start gap-3"><User className="w-5 h-5" />Profil</button>
                  <button className="btn btn-ghost justify-start gap-3">Pengaturan</button>
                </div>
              </aside>
            </div>
          </div>
          {/* Sidebar desktop */}
          <aside className={`bg-base-200 text-base-content p-4 flex-col shadow-xl min-h-screen transition-[width] duration-300 ease-in-out hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'}`} style={{transitionProperty: 'width'}}>
            <div className={`font-bold text-2xl mb-8 text-primary flex items-center gap-2 transition-all duration-200 ${sidebarOpen ? '' : 'justify-center'}`}>
              <BookOpen className="w-7 h-7 text-primary" />
              {sidebarOpen && <span>SIAKAD</span>}
            </div>
            <nav className={`flex flex-col ${sidebarOpen ? 'gap-1' : 'gap-0'} transition-all duration-300 ease-in-out`}>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Dashboard"><BookOpen className="w-5 h-5" /></div>{sidebarOpen && 'Dashboard'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/siswa" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/siswa"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Siswa"><Users className="w-5 h-5" /></div>{sidebarOpen && 'Siswa'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/kelas" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/kelas"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Kelas"><ClipboardList className="w-5 h-5" /></div>{sidebarOpen && 'Kelas'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/guru" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/guru"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Guru"><User className="w-5 h-5" /></div>{sidebarOpen && 'Guru'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname.startsWith("/admin/user") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/user"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="User"><User className="w-5 h-5" /></div>{sidebarOpen && 'User'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname.startsWith("/admin/role") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/role"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Role"><Users className="w-5 h-5" /></div>{sidebarOpen && 'Role'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/nilai" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/nilai"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Nilai"><BookOpen className="w-5 h-5" /></div>{sidebarOpen && 'Nilai'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/absensi" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/absensi"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Absensi"><CalendarCheck className="w-5 h-5" /></div>{sidebarOpen && 'Absensi'}</Link>
              <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/keuangan" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/keuangan"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Keuangan"><Wallet className="w-5 h-5" /></div>{sidebarOpen && 'Keuangan'}</Link>
            </nav>
            <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-base-300">
              <button className="btn btn-ghost justify-start gap-3"><User className="w-5 h-5" />Profil</button>
              <button className="btn btn-ghost justify-start gap-3">{sidebarOpen && 'Pengaturan'}</button>
            </div>
          </aside>
          {/* Main Content desktop */}
          <div className="flex-1 flex flex-col hidden md:flex">
            {/* Topbar desktop */}
            <header className="w-full bg-base-100 shadow flex items-center justify-between px-6 py-4 gap-4">
              <div className="flex items-center gap-3">
                <button className="btn btn-ghost btn-circle text-base-content" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle Sidebar">
                  {sidebarOpen ? <ChevronLeft className="w-6 h-6 text-base-content" /> : <ChevronRight className="w-6 h-6 text-base-content" />}
                </button>
              </div>
              <div className="flex-1 flex items-center max-w-lg mx-4">
                <label className="flex items-center w-full bg-base-200 border border-base-300 rounded-full px-3 py-1 gap-2 focus-within:border-primary transition-all">
                  <Search className="w-5 h-5 text-base-content/70" />
                  <input type="text" className="grow bg-transparent outline-none text-base-content placeholder:text-base-content/50" placeholder="Cari..." />
                </label>
              </div>
              <div className="flex items-center gap-4">
                <button className="btn btn-ghost btn-circle text-base-content"><Bell className="w-6 h-6 text-base-content" /></button>
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle avatar ring-2 ring-primary hover:ring-4 hover:ring-primary/60 transition-all duration-200">
                    <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                      <User className="w-7 h-7 text-base-content" />
                    </div>
                  </label>
                  <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                    <li><a>Profil</a></li>
                    <li><a>Keluar</a></li>
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-base-content">Tema:</label>
                  <select
                    className="select select-bordered w-28 text-base-content"
                    value={theme}
                    onChange={e => {
                      setTheme(e.target.value);
                    }}
                  >
                    {themes.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </header>
            {/* Content */}
            <main className="flex-1 p-6 bg-base-100 transition-all duration-200">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
