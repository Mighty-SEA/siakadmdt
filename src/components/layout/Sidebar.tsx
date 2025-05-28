"use client";
import Link from "next/link";
import { User, Users, BookOpen, ClipboardList, CalendarCheck, Wallet, X, History } from "lucide-react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  isMobile?: boolean;
  closeMobileDrawer?: () => void;
  handleLogout: () => void;
}

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile = false, 
  closeMobileDrawer,
  handleLogout
}: SidebarProps) {
  const pathname = usePathname() || '';
  
  // Jika di mobile, gunakan width full
  const sidebarClass = isMobile 
    ? "menu p-4 w-64 min-h-full bg-base-200 text-base-content flex flex-col relative overflow-y-auto" 
    : `bg-base-200 text-base-content p-4 flex-col shadow-xl min-h-screen transition-[width] duration-300 ease-in-out hidden md:flex sticky top-0 h-screen ${sidebarOpen ? 'w-64' : 'w-20'}`;
  
  return (
    <aside className={sidebarClass} style={!isMobile ? {transitionProperty: 'width'} : {}}>
      <div className={`font-bold text-2xl mb-8 text-primary flex items-center gap-2 transition-all duration-200 ${isMobile ? '' : (sidebarOpen ? '' : 'justify-center')}`}>
        <BookOpen className="w-7 h-7 text-primary" />
        {(isMobile || sidebarOpen) && <span>SIAKAD</span>}
        {isMobile && (
          <button className="btn btn-ghost btn-circle ml-auto md:hidden" onClick={closeMobileDrawer} aria-label="Tutup Menu">
            <X className="w-6 h-6 text-base-content" />
          </button>
        )}
        {!isMobile && (
          <button 
            className="btn btn-ghost btn-circle ml-auto hidden md:flex" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Tutup Menu" : "Buka Menu"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </button>
        )}
      </div>
      
      <nav className={`flex flex-col ${isMobile ? 'gap-1' : (sidebarOpen ? 'gap-1' : 'gap-0')} transition-all duration-300 ease-in-out`}>
        <SidebarLink 
          href="/admin" 
          icon={<BookOpen className="w-5 h-5" />} 
          label="Dashboard" 
          active={pathname === "/admin"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/siswa" 
          icon={<Users className="w-5 h-5" />} 
          label="Siswa" 
          active={pathname.startsWith("/admin/siswa")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/kelas" 
          icon={<ClipboardList className="w-5 h-5" />} 
          label="Kelas" 
          active={pathname === "/admin/kelas"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/kelas/riwayat" 
          icon={<History className="w-5 h-5" />} 
          label="Riwayat Kelas" 
          active={pathname.startsWith("/admin/kelas/riwayat")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/academicyear" 
          icon={<CalendarCheck className="w-5 h-5" />} 
          label="Tahun Akademik" 
          active={pathname.startsWith("/admin/academicyear")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/classlevel" 
          icon={<ClipboardList className="w-5 h-5" />} 
          label="Tingkat Kelas" 
          active={pathname.startsWith("/admin/classlevel")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/guru" 
          icon={<User className="w-5 h-5" />} 
          label="Guru" 
          active={pathname === "/admin/guru"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/user" 
          icon={<User className="w-5 h-5" />} 
          label="User" 
          active={pathname.startsWith("/admin/user")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/role" 
          icon={<Users className="w-5 h-5" />} 
          label="Role" 
          active={pathname.startsWith("/admin/role")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/nilai" 
          icon={<BookOpen className="w-5 h-5" />} 
          label="Nilai" 
          active={pathname === "/admin/nilai"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/absensi" 
          icon={<CalendarCheck className="w-5 h-5" />} 
          label="Absensi" 
          active={pathname === "/admin/absensi"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/keuangan" 
          icon={<Wallet className="w-5 h-5" />} 
          label="Keuangan" 
          active={pathname === "/admin/keuangan"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        {/* Submenu Keuangan */}
        {(pathname.startsWith("/admin/keuangan") && (isMobile || sidebarOpen)) && (
          <div className="ml-8 flex flex-col gap-1">
            <SidebarLink 
              href="/admin/keuangan/income" 
              icon={<Wallet className="w-4 h-4" />} 
              label="Pemasukan" 
              active={pathname.startsWith("/admin/keuangan/income")}
              sidebarOpen={true}
              onClick={isMobile ? closeMobileDrawer : undefined}
            />
            <SidebarLink 
              href="/admin/keuangan/expense" 
              icon={<Wallet className="w-4 h-4" />} 
              label="Pengeluaran" 
              active={pathname.startsWith("/admin/keuangan/expense")}
              sidebarOpen={true}
              onClick={isMobile ? closeMobileDrawer : undefined}
            />
          </div>
        )}
      </nav>
      
      <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-base-300">
        <button className="btn btn-ghost justify-start gap-3 text-base-content">
          <User className="w-5 h-5" />
          {(isMobile || sidebarOpen) && 'Profil'}
        </button>
        <button 
          className="btn btn-ghost justify-start gap-3 text-base-content" 
          onClick={handleLogout}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {(isMobile || sidebarOpen) && 'Keluar'}
        </button>
      </div>
    </aside>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  sidebarOpen: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, icon, label, active, sidebarOpen, onClick }: SidebarLinkProps) {
  return (
    <Link 
      className={`btn btn-ghost ${sidebarOpen ? "justify-start gap-3" : "justify-center w-full gap-0"}${active ? " btn-active bg-primary/10 text-primary" : ""}`} 
      href={href}
      onClick={onClick}
    >
      <div className={sidebarOpen ? undefined : "tooltip tooltip-right"} data-tip={label}>
        {icon}
      </div>
      {sidebarOpen && label}
    </Link>
  );
} 