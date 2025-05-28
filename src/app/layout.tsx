"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { User, Users, BookOpen, ClipboardList, CalendarCheck, Wallet, Bell, Search, ChevronLeft, ChevronRight, Menu, X, Check, LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { UIProvider } from "@/lib/ui-context";

// Tipe data untuk user
type UserData = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: { id: number; name: string };
};

// Tipe data untuk notifikasi
type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  created_at: string;
};

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
  // State untuk menyimpan data user
  const [userData, setUserData] = useState<UserData | null>(null);
  // State untuk notifikasi
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
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

  // Ambil data user dari cookie saat mount
  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  }, []);
  
  // Ambil notifikasi saat user tersedia
  useEffect(() => {
    if (userData?.id && pathname !== "/login") {
      fetchNotifications();
      
      // Polling untuk mendapatkan notifikasi baru setiap 30 detik
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userData?.id, pathname]);

  // Fungsi untuk mengambil notifikasi
  const fetchNotifications = async () => {
    if (!userData?.id) return;
    
    setNotifLoading(true);
    try {
      const res = await fetch(`/api/notification?limit=5`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fungsi untuk menandai notifikasi sebagai sudah dibaca
  const markAsRead = async (id: number) => {
    try {
      const res = await fetch("/api/notification", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, isRead: true }),
      });

      if (res.ok) {
        setNotifications(
          notifications.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Fungsi untuk menandai semua notifikasi sebagai sudah dibaca
  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notification/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setNotifications(
          notifications.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

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

  // Helper untuk menampilkan avatar
  const renderAvatar = (className: string = "") => {
    if (userData?.avatar) {
      // Periksa apakah avatar adalah URL lengkap atau path relatif
      const avatarSrc = userData.avatar.startsWith('http') 
        ? userData.avatar 
        : userData.avatar.includes('/avatar/') 
          ? userData.avatar 
          : `/avatar/${userData.avatar}`;
      
      return (
        <div className={`rounded-full ${className} overflow-hidden`}>
          <img src={avatarSrc} alt={userData.name} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    // Tampilkan inisial jika tidak ada avatar
    return (
      <div className={`rounded-full ${className} bg-base-200 flex items-center justify-center`}>
        <User className="w-7 h-7 text-base-content" />
      </div>
    );
  };
  
  // Fungsi untuk mendapatkan warna badge berdasarkan tipe notifikasi
  const getNotifBadgeClass = (type: string) => {
    switch (type) {
      case "success":
        return "badge-success text-success-content";
      case "error":
        return "badge-error text-error-content";
      case "warning":
        return "badge-warning text-warning-content";
      default:
        return "badge-info text-info-content";
    }
  };
  
  // Fungsi untuk memformat tanggal notifikasi
  const formatNotifTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 30) return `${diffDays} hari yang lalu`;
    
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Fungsi logout
  const handleLogout = () => {
    // Hapus cookie
    Cookies.remove('user');
    // Redirect ke halaman login
    router.push('/login');
  };

  if (pathname === "/login") {
    return (
      <html lang="id">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <UIProvider>
            {children}
          </UIProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UIProvider>
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
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-circle indicator">
                        <Bell className="w-6 h-6 text-base-content" />
                        {unreadCount > 0 && (
                          <span className="indicator-item badge badge-primary badge-xs">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                      </label>
                      <div tabIndex={0} className="dropdown-content z-50 shadow-lg bg-base-100 rounded-box w-72 border border-base-300 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200">
                          <h3 className="font-semibold text-base-content">Notifikasi</h3>
                          {unreadCount > 0 && (
                            <button 
                              className="btn btn-ghost btn-xs flex items-center gap-1 text-base-content"
                              onClick={markAllAsRead}
                            >
                              <Check className="w-4 h-4" /> Tandai Semua Dibaca
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifLoading ? (
                            <div className="flex justify-center items-center p-4">
                              <span className="loading loading-spinner loading-md text-primary"></span>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-base-content/70">
                              <p className="text-base-content">Tidak ada notifikasi</p>
                            </div>
                          ) : (
                            <div>
                              {notifications.map((notif) => (
                                <div 
                                  key={notif.id} 
                                  className={`p-3 border-b border-base-300 hover:bg-base-200 cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                                >
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-primary' : 'text-base-content'}`}>{notif.title}</h4>
                                    <span className={`badge badge-sm ${getNotifBadgeClass(notif.type)}`}>{notif.type}</span>
                                  </div>
                                  <p 
                                    className="text-xs text-base-content/80 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: notif.message }}
                                  ></p>
                                  <div className="text-xs text-base-content/60 mt-1">
                                    {formatNotifTime(notif.created_at)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-2 border-t border-base-300 bg-base-200">
                          <Link 
                            href="/admin/notifikasi" 
                            className="btn btn-sm btn-block btn-ghost text-base-content"
                            onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}
                          >
                            Lihat Semua Notifikasi
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-circle avatar ring-2 ring-primary hover:ring-4 hover:ring-primary/60 transition-all duration-200">
                        {renderAvatar("w-8 h-8")}
                      </label>
                      <ul tabIndex={0} className="mt-3 shadow dropdown-content bg-base-100 rounded-xl overflow-hidden border border-base-300 w-56 transition-all duration-200 z-50">
                        <div className="px-4 py-3 bg-primary/10 border-b border-base-300">
                          <div className="flex items-center gap-3">
                            {renderAvatar("w-10 h-10")}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-base-content">{userData?.name || 'User'}</span>
                              <span className="text-xs text-base-content/70">{userData?.email || ''}</span>
                              <span className="text-xs mt-1 badge badge-xs badge-primary">{userData?.role?.name || 'User'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-1">
                          <li>
                            <a className="flex items-center gap-2 p-2 text-sm hover:bg-primary/10 rounded-lg transition-all duration-200">
                              <User className="w-4 h-4 text-primary" />
                              <span>Profil Saya</span>
                            </a>
                          </li>
                          <li>
                            <button 
                              onClick={handleLogout} 
                              className="flex items-center gap-2 p-2 w-full text-sm text-left hover:bg-error/10 hover:text-error rounded-lg transition-all duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                              </svg>
                              <span>Keluar</span>
                            </button>
                          </li>
                        </div>
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
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname === "/admin" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin" onClick={() => setDrawerOpen(false)}><BookOpen className="w-5 h-5" />Dashboard</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname.startsWith("/admin/siswa") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/siswa" onClick={() => setDrawerOpen(false)}><Users className="w-5 h-5" />Siswa</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname === "/admin/kelas" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/kelas" onClick={() => setDrawerOpen(false)}><ClipboardList className="w-5 h-5" />Kelas</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname === "/admin/guru" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/guru" onClick={() => setDrawerOpen(false)}><User className="w-5 h-5" />Guru</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname.startsWith("/admin/user") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/user" onClick={() => setDrawerOpen(false)}><User className="w-5 h-5" />User</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname.startsWith("/admin/role") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/role" onClick={() => setDrawerOpen(false)}><Users className="w-5 h-5" />Role</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname === "/admin/nilai" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/nilai" onClick={() => setDrawerOpen(false)}><BookOpen className="w-5 h-5" />Nilai</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname === "/admin/absensi" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/absensi" onClick={() => setDrawerOpen(false)}><CalendarCheck className="w-5 h-5" />Absensi</Link>
                    <Link className={`btn btn-ghost justify-start gap-3${pathname && pathname === "/admin/keuangan" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/keuangan" onClick={() => setDrawerOpen(false)}><Wallet className="w-5 h-5" />Keuangan</Link>
                  </nav>
                  <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-base-300">
                    <button className="btn btn-ghost justify-start gap-3"><User className="w-5 h-5" />Profil</button>
                    <button className="btn btn-ghost justify-start gap-3" onClick={handleLogout}>Keluar</button>
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
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname === "/admin" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Dashboard"><BookOpen className="w-5 h-5" /></div>{sidebarOpen && 'Dashboard'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname.startsWith("/admin/siswa") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/siswa"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Siswa"><Users className="w-5 h-5" /></div>{sidebarOpen && 'Siswa'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname === "/admin/kelas" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/kelas"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Kelas"><ClipboardList className="w-5 h-5" /></div>{sidebarOpen && 'Kelas'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname === "/admin/guru" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/guru"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Guru"><User className="w-5 h-5" /></div>{sidebarOpen && 'Guru'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname.startsWith("/admin/user") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/user"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="User"><User className="w-5 h-5" /></div>{sidebarOpen && 'User'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname.startsWith("/admin/role") ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/role"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Role"><Users className="w-5 h-5" /></div>{sidebarOpen && 'Role'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname === "/admin/nilai" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/nilai"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Nilai"><BookOpen className="w-5 h-5" /></div>{sidebarOpen && 'Nilai'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname === "/admin/absensi" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/absensi"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Absensi"><CalendarCheck className="w-5 h-5" /></div>{sidebarOpen && 'Absensi'}</Link>
                <Link className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${pathname && pathname === "/admin/keuangan" ? " btn-active bg-primary/10 text-primary" : ""}`} href="/admin/keuangan"><div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip="Keuangan"><Wallet className="w-5 h-5" /></div>{sidebarOpen && 'Keuangan'}</Link>
              </nav>
              <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-base-300">
                <button className="btn btn-ghost justify-start gap-3"><User className="w-5 h-5" />{sidebarOpen && 'Profil'}</button>
                <button className="btn btn-ghost justify-start gap-3" onClick={handleLogout}>{sidebarOpen && 'Keluar'}</button>
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
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle indicator">
                      <Bell className="w-6 h-6 text-base-content" />
                      {unreadCount > 0 && (
                        <span className="indicator-item badge badge-primary badge-sm">{unreadCount > 99 ? '99+' : unreadCount}</span>
                      )}
                    </label>
                    <div tabIndex={0} className="dropdown-content z-50 shadow-lg bg-base-100 rounded-box w-80 border border-base-300 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200">
                        <h3 className="font-semibold text-base-content">Notifikasi</h3>
                        {unreadCount > 0 && (
                          <button 
                            className="btn btn-ghost btn-xs flex items-center gap-1 text-base-content"
                            onClick={markAllAsRead}
                          >
                            <Check className="w-4 h-4" /> Tandai Semua Dibaca
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifLoading ? (
                          <div className="flex justify-center items-center p-6">
                            <span className="loading loading-spinner loading-md text-primary"></span>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-6 text-center text-base-content/70">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Tidak ada notifikasi</p>
                          </div>
                        ) : (
                          <div>
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                className={`p-4 border-b border-base-300 hover:bg-base-200 cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                              >
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-primary' : 'text-base-content'}`}>{notif.title}</h4>
                                  <span className={`badge badge-sm ${getNotifBadgeClass(notif.type)}`}>{notif.type}</span>
                                </div>
                                <p 
                                  className="text-sm text-base-content/80 line-clamp-2"
                                  dangerouslySetInnerHTML={{ __html: notif.message }}
                                ></p>
                                <p className="text-xs text-base-content/60 mt-1">{formatNotifTime(notif.created_at)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-base-300 bg-base-200">
                        <Link 
                          href="/admin/notifikasi" 
                          className="btn btn-sm btn-block btn-ghost text-base-content"
                          onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}
                        >
                          Lihat Semua Notifikasi
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar ring-2 ring-primary hover:ring-4 hover:ring-primary/60 transition-all duration-200">
                      {renderAvatar("w-10 h-10")}
                    </label>
                    <ul tabIndex={0} className="mt-3 shadow dropdown-content bg-base-100 rounded-xl overflow-hidden border border-base-300 w-64 transition-all duration-200 z-50">
                      <div className="px-4 py-3 bg-primary/10 border-b border-base-300">
                        <div className="flex items-center gap-3">
                          {renderAvatar("w-12 h-12")}
                          <div className="flex flex-col">
                            <span className="text-base font-medium text-base-content">{userData?.name || 'User'}</span>
                            <span className="text-xs text-base-content/70">{userData?.email || ''}</span>
                            <span className="text-xs mt-1 badge badge-sm badge-primary">{userData?.role?.name || 'User'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-1">
                        <li>
                          <a className="flex items-center gap-2 p-3 hover:bg-primary/10 rounded-lg transition-all duration-200 text-base-content">
                            <User className="w-5 h-5 text-primary" />
                            <span>Profil Saya</span>
                          </a>
                        </li>
                        <li>
                          <button 
                            onClick={handleLogout} 
                            className="flex items-center gap-2 p-3 w-full text-left hover:bg-error/10 hover:text-error rounded-lg transition-all duration-200 text-base-content"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Keluar</span>
                          </button>
                        </li>
                      </div>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2">
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
        </UIProvider>
      </body>
    </html>
  );
}
