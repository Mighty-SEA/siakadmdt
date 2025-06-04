"use client";
import Link from "next/link";
import { LayoutDashboard, GraduationCap, BookOpen, School, History, FileText, CalendarCheck, ArrowDownCircle, ArrowUpCircle, Receipt, User2, Shield, Wallet, UserCircle, LogOut, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

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
  const [keuanganOpen, setKeuanganOpen] = useState(pathname.startsWith("/admin/keuangan"));
  
  // Jika di mobile, gunakan width full
  const sidebarClass = isMobile 
    ? "menu p-4 w-64 min-h-full bg-base-200 text-base-content flex flex-col relative overflow-y-auto" 
    : `bg-base-200 text-base-content p-4 flex-col shadow-xl min-h-screen transition-[width] duration-300 ease-in-out hidden md:flex sticky top-0 h-screen ${sidebarOpen ? 'w-64' : 'w-20'}`;
  
  return (
    <aside className={sidebarClass + " scrollbar-hide"} style={!isMobile ? {transitionProperty: 'width'} : {}}>
      <div className={`font-bold text-2xl mb-8 text-primary flex items-center gap-2 transition-all duration-200 ${isMobile ? '' : (sidebarOpen ? '' : 'justify-center')}`}>
        <Image src="/android-chrome-512x512.png" alt="Logo MDT Bilal" width={38} height={38} priority unoptimized />
        {(isMobile || sidebarOpen) && <span>MDT BILAL</span>}
        {isMobile && (
          <button className="btn btn-ghost btn-circle ml-auto md:hidden" onClick={closeMobileDrawer} aria-label="Tutup Menu">
            <X className="w-6 h-6 text-base-content" />
          </button>
        )}
        {/* Tombol collapse hanya muncul jika sidebarOpen true dan bukan mobile */}
        {!isMobile && sidebarOpen && (
          <button 
            className="btn btn-ghost btn-circle ml-auto hidden md:flex" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Tutup Menu" : "Buka Menu"}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className={`flex flex-col ${isMobile ? 'gap-1' : (sidebarOpen ? 'gap-1' : 'gap-0')} transition-all duration-300 ease-in-out`}>
        {/* Data Master */}
        <div className={`text-xs font-semibold text-gray-400 px-2 mb-1 mt-2 flex items-center${(isMobile || sidebarOpen) ? '' : ' justify-center'}`}>{(isMobile || sidebarOpen) ? 'DATA MASTER' : <span className="text-lg">&bull;</span>}</div>
        <SidebarLink 
          href="/admin" 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Dashboard" 
          active={pathname === "/admin"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/siswa" 
          icon={<GraduationCap className="w-5 h-5" />} 
          label="Siswa" 
          active={pathname.startsWith("/admin/siswa")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/guru" 
          icon={<BookOpen className="w-5 h-5" />} 
          label="Guru" 
          active={pathname === "/admin/guru"}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        {/* Manajemen User */}
        <div className={`text-xs font-semibold text-gray-400 px-2 mb-1 mt-4 flex items-center${(isMobile || sidebarOpen) ? '' : ' justify-center'}`}>{(isMobile || sidebarOpen) ? 'MANAJEMEN USER' : <span className="text-lg">&bull;</span>}</div>
        <SidebarLink 
          href="/admin/user" 
          icon={<User2 className="w-5 h-5" />} 
          label="User" 
          active={pathname.startsWith("/admin/user")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        <SidebarLink 
          href="/admin/role" 
          icon={<Shield className="w-5 h-5" />} 
          label="Role" 
          active={pathname.startsWith("/admin/role")}
          sidebarOpen={isMobile ? true : sidebarOpen}
          onClick={isMobile ? closeMobileDrawer : undefined}
        />
        {/* Akademik */}
        <div className={`text-xs font-semibold text-gray-400 px-2 mb-1 mt-4 flex items-center${(isMobile || sidebarOpen) ? '' : ' justify-center'}`}>{(isMobile || sidebarOpen) ? 'AKADEMIK' : <span className="text-lg">&bull;</span>}</div>
        <SidebarLink 
          href="/admin/kelas" 
          icon={<School className="w-5 h-5" />} 
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
          href="/admin/nilai" 
          icon={<FileText className="w-5 h-5" />} 
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
        {/* Keuangan */}
        <div className={`text-xs font-semibold text-gray-400 px-2 mb-1 mt-4 flex items-center${(isMobile || sidebarOpen) ? '' : ' justify-center'}`}>{(isMobile || sidebarOpen) ? 'KEUANGAN' : <span className="text-lg">&bull;</span>}</div>
        {/* Menu Keuangan dengan submenu */}
        <button
          className={`btn btn-ghost w-full flex items-center ${sidebarOpen ? "justify-start gap-3" : "justify-center gap-0"} ${keuanganOpen ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => setKeuanganOpen(!keuanganOpen)}
          aria-expanded={keuanganOpen}
          type="button"
        >
          <Wallet className="w-5 h-5" />
          {sidebarOpen && "Keuangan"}
          <span className={`ml-auto transition-transform ${keuanganOpen ? "rotate-90" : "rotate-0"} ${sidebarOpen ? "" : "hidden"}`}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </span>
        </button>
        {keuanganOpen && (
          <div className={`flex flex-col gap-1${sidebarOpen || isMobile ? ' ml-6' : ''}`}>
            <SidebarLink 
              href="/admin/keuangan/income" 
              icon={<ArrowDownCircle className="w-4 h-4" />} 
              label="Pemasukan" 
              active={pathname.startsWith("/admin/keuangan/income")}
              sidebarOpen={sidebarOpen || isMobile}
              onClick={isMobile ? closeMobileDrawer : undefined}
            />
            <SidebarLink 
              href="/admin/keuangan/expense" 
              icon={<ArrowUpCircle className="w-4 h-4" />} 
              label="Pengeluaran" 
              active={pathname.startsWith("/admin/keuangan/expense")}
              sidebarOpen={sidebarOpen || isMobile}
              onClick={isMobile ? closeMobileDrawer : undefined}
            />
            <SidebarLink 
              href="/admin/keuangan/spp" 
              icon={<Receipt className="w-4 h-4" />} 
              label="SPP" 
              active={pathname.startsWith("/admin/keuangan/spp")}
              sidebarOpen={sidebarOpen || isMobile}
              onClick={isMobile ? closeMobileDrawer : undefined}
            />
          </div>
        )}
      </nav>
      
      <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-base-300">
        <button className="btn btn-ghost justify-start gap-3 text-base-content">
          <UserCircle className="w-5 h-5" />
          {(isMobile || sidebarOpen) && 'Profil'}
        </button>
        <button 
          className="btn btn-ghost justify-start gap-3 text-base-content" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
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