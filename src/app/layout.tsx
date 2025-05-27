"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { User, Users, BookOpen, ClipboardList, CalendarCheck, Wallet, Bell, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  const pathname = usePathname();
  const themes = [
    "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter","dim","nord","sunset","caramellatte","abyss","silk"
  ];

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

  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className={`bg-base-200 text-base-content p-4 flex flex-col shadow-xl min-h-screen transition-[width] duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'}`} style={{transitionProperty: 'width'}}>
            <div className={`font-bold text-2xl mb-8 text-primary flex items-center gap-2 transition-all duration-200 ${sidebarOpen ? '' : 'justify-center'}`}>
              <BookOpen className="w-7 h-7 text-primary" />
              {sidebarOpen && <span>SIAKAD</span>}
            </div>
            <nav className={`flex flex-col ${sidebarOpen ? 'gap-1' : 'gap-0'} transition-all duration-300 ease-in-out`}>
              <Link
                className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/siswa" ? " btn-active bg-primary/10 text-primary" : ""}`}
                href="/admin/siswa">
                <div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Siswa">
                  <Users className="w-5 h-5" />
                </div>
                {sidebarOpen && 'Siswa'}
              </Link>
              <Link
                className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/kelas" ? " btn-active bg-primary/10 text-primary" : ""}`}
                href="/admin/kelas">
                <div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Kelas">
                  <ClipboardList className="w-5 h-5" />
                </div>
                {sidebarOpen && 'Kelas'}
              </Link>
              <Link
                className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/guru" ? " btn-active bg-primary/10 text-primary" : ""}`}
                href="/admin/guru">
                <div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Guru">
                  <User className="w-5 h-5" />
                </div>
                {sidebarOpen && 'Guru'}
              </Link>
              <Link
                className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/nilai" ? " btn-active bg-primary/10 text-primary" : ""}`}
                href="/admin/nilai">
                <div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Nilai">
                  <BookOpen className="w-5 h-5" />
                </div>
                {sidebarOpen && 'Nilai'}
              </Link>
              <Link
                className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/absensi" ? " btn-active bg-primary/10 text-primary" : ""}`}
                href="/admin/absensi">
                <div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Absensi">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                {sidebarOpen && 'Absensi'}
              </Link>
              <Link
                className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname === "/admin/keuangan" ? " btn-active bg-primary/10 text-primary" : ""}`}
                href="/admin/keuangan">
                <div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Keuangan">
                  <Wallet className="w-5 h-5" />
                </div>
                {sidebarOpen && 'Keuangan'}
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-base-300">
              <button className="btn btn-ghost justify-start gap-3"><User className="w-5 h-5" />{sidebarOpen && 'Profil'}</button>
              <button className="btn btn-ghost justify-start gap-3">{sidebarOpen && 'Pengaturan'}</button>
            </div>
          </aside>
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Topbar */}
            <header className="w-full bg-base-100 shadow flex items-center justify-between px-6 py-4 gap-4">
              <div className="flex items-center gap-3">
                <button className="btn btn-ghost btn-circle text-base-content" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle Sidebar">
                  {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </div>
              <div className="flex-1 flex items-center max-w-lg mx-4">
                <label className="input input-bordered flex items-center gap-2 w-full">
                  <Search className="w-4 h-4 opacity-60" />
                  <input type="text" className="grow" placeholder="Cari..." />
                </label>
              </div>
              <div className="flex items-center gap-4">
                <button className="btn btn-ghost btn-circle text-base-content"><Bell className="w-6 h-6" /></button>
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                      <img src="/window.svg" alt="User" />
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
