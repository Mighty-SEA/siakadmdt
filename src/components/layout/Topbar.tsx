"use client";
import Link from "next/link";
import { Bell, Search, ChevronLeft, ChevronRight, Check } from "lucide-react";

// Tipe data untuk notifikasi
type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  created_at: string;
};

// Tipe data untuk user
type UserData = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: { id: number; name: string };
};

interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  isMobile?: boolean;
  openMobileDrawer?: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  themes: string[];
  notifications: Notification[];
  unreadCount: number;
  notifLoading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  userData: UserData | null;
  handleLogout: () => void;
  renderAvatar: (className: string) => React.ReactNode;
  getNotifBadgeClass: (type: string) => string;
  formatNotifTime: (dateString: string) => string;
}

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
  isMobile = false,
  openMobileDrawer,
  theme,
  setTheme,
  themes,
  notifications,
  unreadCount,
  notifLoading,
  markAsRead,
  markAllAsRead,
  userData,
  handleLogout,
  renderAvatar,
  getNotifBadgeClass,
  formatNotifTime
}: TopbarProps) {
  
  return isMobile ? (
    // Topbar mobile
    <header className="w-full bg-base-100 shadow flex items-center justify-between px-4 py-3 gap-2 md:hidden sticky top-0 z-30">
      <button className="btn btn-ghost btn-circle" onClick={openMobileDrawer} aria-label="Buka Menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-base-content">
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>
      <span className="font-bold text-xl text-primary">SIAKAD</span>
      <div className="flex items-center gap-2">
        <ThemeSelector theme={theme} setTheme={setTheme} themes={themes} isMobile={true} />
        <NotificationDropdown 
          notifications={notifications} 
          unreadCount={unreadCount} 
          notifLoading={notifLoading}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          getNotifBadgeClass={getNotifBadgeClass}
          formatNotifTime={formatNotifTime}
          isMobile={true}
        />
        <UserDropdown 
          userData={userData} 
          renderAvatar={renderAvatar} 
          handleLogout={handleLogout}
          isMobile={true}
        />
      </div>
    </header>
  ) : (
    // Topbar desktop
    <header className="w-full bg-base-100 shadow flex items-center justify-between px-6 py-4 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-circle text-base-content" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Sidebar">
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
        <ThemeSelector theme={theme} setTheme={setTheme} themes={themes} />
        <NotificationDropdown 
          notifications={notifications} 
          unreadCount={unreadCount} 
          notifLoading={notifLoading}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          getNotifBadgeClass={getNotifBadgeClass}
          formatNotifTime={formatNotifTime}
        />
        <UserDropdown 
          userData={userData} 
          renderAvatar={renderAvatar} 
          handleLogout={handleLogout}
        />
      </div>
    </header>
  );
}

interface ThemeSelectorProps {
  theme: string;
  setTheme: (theme: string) => void;
  themes: string[];
  isMobile?: boolean;
}

function ThemeSelector({ theme, setTheme, themes, isMobile = false }: ThemeSelectorProps) {
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className={`btn btn-ghost btn-circle ${isMobile ? 'btn-sm' : ''}`}>
        <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full border-2 border-base-content flex items-center justify-center overflow-hidden`} style={{ background: 'linear-gradient(135deg, var(--p) 0%, var(--s) 100%)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 14 : 16} height={isMobile ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content opacity-70">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v2"></path>
            <path d="M12 21v2"></path>
            {!isMobile && (
              <>
                <path d="M4.22 4.22l1.42 1.42"></path>
                <path d="M18.36 18.36l1.42 1.42"></path>
                <path d="M1 12h2"></path>
                <path d="M21 12h2"></path>
                <path d="M4.22 19.78l1.42-1.42"></path>
                <path d="M18.36 5.64l1.42-1.42"></path>
              </>
            )}
          </svg>
        </div>
      </label>
      <div tabIndex={0} className={`dropdown-content z-[100] shadow-lg bg-base-100 rounded-xl border border-base-300 ${isMobile ? 'w-72' : 'w-72'} p-3 dropdown-bottom dropdown-end`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base-content">Tema</h3>
          <span className="badge badge-sm badge-primary">{theme}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {themes.map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              data-theme={t}
              className={`rounded-lg p-2 border-2 transition-all duration-200 hover:scale-105 ${theme === t ? 'border-primary' : 'border-base-300'}`}
            >
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="w-2 h-2 rounded-full bg-accent"></div>
              </div>
              <div className="w-full h-6 rounded bg-base-100 border border-base-300 flex items-center justify-center">
                <span className="text-[10px] text-base-content capitalize">{t}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  notifLoading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  getNotifBadgeClass: (type: string) => string;
  formatNotifTime: (dateString: string) => string;
  isMobile?: boolean;
}

function NotificationDropdown({ 
  notifications, 
  unreadCount, 
  notifLoading, 
  markAsRead, 
  markAllAsRead, 
  getNotifBadgeClass, 
  formatNotifTime,
  isMobile = false
}: NotificationDropdownProps) {
  // Gunakan key yang stabil, hanya berubah ketika unreadCount atau jumlah notifikasi berubah
  const notifKey = `${unreadCount}-${notifications.length}`;
  
  return (
    <div className="dropdown dropdown-end" key={notifKey}>
      <label tabIndex={0} className="btn btn-ghost btn-circle indicator">
        <Bell className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} text-base-content`} />
        {unreadCount > 0 && (
          <span className={`indicator-item badge badge-primary ${isMobile ? 'badge-xs' : 'badge-sm'}`}>
            {unreadCount > (isMobile ? 9 : 99) ? (isMobile ? '9+' : '99+') : unreadCount}
          </span>
        )}
      </label>
      <div tabIndex={0} className={`dropdown-content z-50 shadow-lg bg-base-100 rounded-box ${isMobile ? 'w-72' : 'w-80'} border border-base-300 overflow-hidden`}>
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
        <div className={`${isMobile ? 'max-h-64' : 'max-h-96'} overflow-y-auto`}>
          {notifLoading ? (
            <div className={`flex justify-center items-center ${isMobile ? 'p-4' : 'p-6'}`}>
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          ) : notifications.length === 0 ? (
            <div className={`${isMobile ? 'p-4' : 'p-6'} text-center text-base-content/70`}>
              {!isMobile && <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />}
              <p className="text-base-content">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`${isMobile ? 'p-3' : 'p-4'} border-b border-base-300 hover:bg-base-200 cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-primary' : 'text-base-content'}`}>{notif.title}</h4>
                    <span className={`badge badge-sm ${getNotifBadgeClass(notif.type)}`}>{notif.type}</span>
                  </div>
                  <p 
                    className={`${isMobile ? 'text-xs' : 'text-sm'} text-base-content/80 line-clamp-2`}
                    dangerouslySetInnerHTML={{ __html: notif.message }}
                  ></p>
                  <p className="text-xs text-base-content/60 mt-1">{formatNotifTime(notif.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`${isMobile ? 'p-2' : 'p-3'} border-t border-base-300 bg-base-200`}>
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
  );
}

interface UserDropdownProps {
  userData: UserData | null;
  renderAvatar: (className: string) => React.ReactNode;
  handleLogout: () => void;
  isMobile?: boolean;
}

function UserDropdown({ userData, renderAvatar, handleLogout, isMobile = false }: UserDropdownProps) {
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className={`btn btn-ghost btn-circle avatar ring-2 ring-primary hover:ring-4 hover:ring-primary/60 transition-all duration-200`}>
        {renderAvatar(isMobile ? "w-8 h-8" : "w-10 h-10")}
      </label>
      <ul tabIndex={0} className={`mt-3 shadow dropdown-content bg-base-100 rounded-xl overflow-hidden border border-base-300 ${isMobile ? 'w-56' : 'w-64'} transition-all duration-200 z-50`}>
        <div className={`px-4 py-3 bg-primary/10 border-b border-base-300`}>
          <div className="flex items-center gap-3">
            {renderAvatar(isMobile ? "w-10 h-10" : "w-12 h-12")}
            <div className="flex flex-col">
              <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-base-content`}>{userData?.name || 'User'}</span>
              <span className="text-xs text-base-content/70">{userData?.email || ''}</span>
              <span className={`text-xs mt-1 badge ${isMobile ? 'badge-xs' : 'badge-sm'} badge-primary`}>{userData?.role?.name || 'User'}</span>
            </div>
          </div>
        </div>
        <div className="p-1">
          <li>
            <a className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} hover:bg-primary/10 rounded-lg transition-all duration-200 text-base-content`}>
              <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`}>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="text-base-content">Profil Saya</span>
            </a>
          </li>
          <li>
            <button 
              onClick={handleLogout} 
              className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} w-full text-left hover:bg-error/10 hover:text-error rounded-lg transition-all duration-200 text-base-content`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="text-base-content">Keluar</span>
            </button>
          </li>
        </div>
      </ul>
    </div>
  );
} 