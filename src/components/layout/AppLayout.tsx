"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Image from "next/image";

// Tipe data untuk user
type UserData = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: { id: number; name: string };
  loginTimestamp?: number;
  sessionId?: string;
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

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
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
  // State untuk melacak apakah komponen sudah di-mount
  const [isMounted, setIsMounted] = useState(false);
  
  const pathname = usePathname() || '';
  const router = useRouter();
  const themes = [
    "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter","dim","nord","sunset","caramellatte","abyss","silk"
  ];
  const drawerInputRef = useRef<HTMLInputElement>(null);
  
  // State untuk tracking session ID
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  // Fungsi untuk mengambil notifikasi
  const fetchNotifications = useCallback(async () => {
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
  }, [userData?.id]);

  // Fungsi untuk mengambil data user dari cookie dan memvalidasi session
  const getUserFromCookie = useCallback(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        // Jika tidak ada sessionId, tambahkan
        if (!parsedUser.sessionId) {
          parsedUser.sessionId = Date.now().toString();
          // Update cookie dengan sessionId
          Cookies.set("user", JSON.stringify(parsedUser), { 
            expires: 7, 
            secure: true,
            sameSite: 'strict',
            path: '/'
          });
        }
        
        // Update session ID state jika berbeda
        if (parsedUser.sessionId !== currentSessionId) {
          setCurrentSessionId(parsedUser.sessionId);
        }
        
        return parsedUser;
      } catch (error) {
        console.error("Error parsing user cookie:", error);
        return null;
      }
    }
    return null;
  }, [currentSessionId]);

  // Inisialisasi tema saat komponen di-mount (hanya sekali)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    setIsMounted(true);
    
    // Cek user session hanya sekali saat mount
    const checkUserSession = () => {
      const user = getUserFromCookie();
      if (user && JSON.stringify(user) !== JSON.stringify(userData)) {
        console.log("User data changed in cookie, updating state");
        setUserData(user);
      }
    };
    
    // Panggil sekali, tidak perlu interval
    checkUserSession();
    
    // Tidak ada interval yang perlu dibersihkan
  }, [getUserFromCookie, userData]); 

  // Ambil data user dari cookie saat mount dan setiap navigasi
  useEffect(() => {
    const user = getUserFromCookie();
    if (user) {
      console.log("Setting user data from cookie");
      setUserData(user);
    } else if (pathname !== '/login') {
      // Jika tidak ada cookie user dan bukan di halaman login, redirect ke login
      router.push('/login');
    }
  }, [pathname, getUserFromCookie, router]);
  
  // Ambil notifikasi hanya saat navigasi atau perubahan rute
  useEffect(() => {
    if (!userData?.id || pathname === "/login") return;
    
    // Ambil notifikasi hanya saat pertama kali halaman dimuat
    // Ini diperlukan untuk menampilkan notifikasi awal
    if (notifications.length === 0) {
      fetchNotifications();
    }
    
    // Tidak perlu polling atau pembaruan otomatis lagi
  }, [userData?.id, pathname, fetchNotifications, notifications.length]);

  // Fungsi untuk reload notifikasi secara manual, digunakan setelah operasi seperti tambah/edit/hapus
  const reloadNotifications = useCallback(async () => {
    if (!userData?.id) return;
    
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/notification?limit=5&t=${timestamp}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error reloading notifications:", error);
    }
  }, [userData?.id]);

  // Expose reloadNotifications untuk digunakan di children components
  useEffect(() => {
    window.reloadNotifications = reloadNotifications;
  }, [reloadNotifications]);

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
        const data = await res.json();
        setNotifications(
          notifications.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        
        // Gunakan unreadCount dari response API jika tersedia
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        } else {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        // Tidak perlu memanggil fetchNotifications lagi karena sudah memperbarui state lokal
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

  // Simpan tema ke localStorage dan update data-theme hanya setelah komponen di-mount
  useEffect(() => {
    if (isMounted && theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, isMounted]);

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
          <Image 
            src={avatarSrc} 
            alt={userData.name} 
            width={40}
            height={40}
            className="w-full h-full object-cover" 
          />
        </div>
      );
    }
    
    // Tampilkan inisial jika tidak ada avatar
    return (
      <div className={`rounded-full ${className} bg-base-200 flex items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-base-content">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
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
    Cookies.remove('user', { path: '/' });
    setUserData(null);
    setCurrentSessionId("");
    // Redirect ke halaman login
    router.push('/login');
  };

  // Hanya render konten setelah komponen di-mount, untuk menghindari ketidakcocokan hydration
  if (!isMounted) {
    return null; // Atau tampilkan loading spinner jika diperlukan
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Drawer untuk mobile */}
      <div className="drawer md:hidden">
        <input 
          id="drawer-sidebar" 
          type="checkbox" 
          className="drawer-toggle" 
          ref={drawerInputRef} 
          checked={drawerOpen} 
          onChange={() => setDrawerOpen(!drawerOpen)} 
        />
        <div className="drawer-content flex flex-col w-full">
          {/* Topbar mobile */}
          <Topbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={true}
            openMobileDrawer={() => setDrawerOpen(true)}
            theme={theme}
            setTheme={setTheme}
            themes={themes}
            notifications={notifications}
            unreadCount={unreadCount}
            notifLoading={notifLoading}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            userData={userData}
            handleLogout={handleLogout}
            renderAvatar={renderAvatar}
            getNotifBadgeClass={getNotifBadgeClass}
            formatNotifTime={formatNotifTime}
          />
          
          {/* Konten utama di mobile */}
          <main className="flex-1 p-4 bg-base-100 transition-all duration-200">{children}</main>
        </div>
        <div className="drawer-side z-40">
          <label htmlFor="drawer-sidebar" className="drawer-overlay"></label>
          <Sidebar 
            sidebarOpen={true}
            setSidebarOpen={setSidebarOpen}
            isMobile={true}
            closeMobileDrawer={() => setDrawerOpen(false)}
            handleLogout={handleLogout}
          />
        </div>
      </div>
      
      {/* Layout desktop */}
      <div className="hidden md:flex flex-1 min-h-screen">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            theme={theme}
            setTheme={setTheme}
            themes={themes}
            notifications={notifications}
            unreadCount={unreadCount}
            notifLoading={notifLoading}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            userData={userData}
            handleLogout={handleLogout}
            renderAvatar={renderAvatar}
            getNotifBadgeClass={getNotifBadgeClass}
            formatNotifTime={formatNotifTime}
          />
          
          <main className="flex-1 p-6 bg-base-100 transition-all duration-200 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 