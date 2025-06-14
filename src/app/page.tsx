"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from 'next/image';

// Helper untuk deteksi mobile
const isSSR = typeof window === 'undefined';

export default function Home() {
  // State tema lokal landing
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState(0);
  // State untuk deteksi mobile screen (client only)
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const sectionRef0 = useRef<HTMLElement>(null);
  const sectionRef1 = useRef<HTMLElement>(null);
  const sectionRef2 = useRef<HTMLElement>(null);
  const sectionRef3 = useRef<HTMLElement>(null);
  const sectionRefs: React.RefObject<HTMLElement | null>[] = useMemo(() => [
    sectionRef0,
    sectionRef1,
    sectionRef2,
    sectionRef3
  ], []);

  // Efek deteksi mobile screen (client only)
  useEffect(() => {
    if (isSSR) return;
    const checkMobile = () => setIsMobileScreen(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Palet warna harmonis
  const palette = theme === 'dark'
    ? {
        svgColor: '#181c2a', // biru tua keunguan
        svgAccent: '#FFD36E', // kuning soft
        svgAccent2: '#FFB86B', // oranye soft
        textColor: '#F8F8FF', // putih keabu
        blockBg: 'rgba(24,28,42,0.82)',
        shadow: '0 4px 32px rgba(24,28,42,0.25)',
        textShadow: '0 2px 12px rgba(0,0,0,0.45)',
        accentText: '#FFD36E',
      }
    : {
        svgColor: '#eaf6ff', // biru muda/putih kebiruan
        svgAccent: '#FBAE3C', // oranye cerah
        svgAccent2: '#FFD36E', // kuning cerah
        textColor: '#1a237e', // biru navy
        blockBg: 'rgba(255,255,255,0.82)',
        shadow: '0 4px 32px rgba(30,136,229,0.10)',
        textShadow: '0 2px 12px rgba(30,136,229,0.18)',
        accentText: '#FBAE3C',
      };

  // Palet warna harmonis per section
  const sectionPalettes = theme === 'dark'
    ? [
        // Section 1
        { svgColor: '#007C77', svgAccent: '#7EE081', svgAccent2: '#7EE081' },
        // Section 2
        { svgColor: '#D84727', svgAccent: '#EF7B45', svgAccent2: '#EF7B45' },
        // Section 3
        { svgColor: '#12343b', svgAccent: '#FFD36E', svgAccent2: '#FFB86B' },
        // Section 4
        { svgColor: '#0d1333', svgAccent: '#FFB86B', svgAccent2: '#FFD36E' },
      ]
    : [
        // Section 1
        { svgColor: '#007C77', svgAccent: '#7EE081', svgAccent2: '#7EE081' },
        // Section 2
        { svgColor: '#D84727', svgAccent: '#EF7B45', svgAccent2: '#EF7B45' },
        // Section 3
        { svgColor: '#e0f7fa', svgAccent: '#FFD36E', svgAccent2: '#FFB86B' },
        // Section 4
        { svgColor: '#1565c0', svgAccent: '#FBAE3C', svgAccent2: '#FFD36E' },
      ];

  // Intersection Observer untuk deteksi section aktif
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.forEach((ref, idx) => {
      if (!ref.current) return;
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveSection(idx);
          }
        },
        { threshold: [0.6] }
      );
      observer.observe(ref.current);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [theme, sectionRefs]);

  // Komponen SVG dengan animasi transisi warna
  function Waves1Animated({ idx }: { idx: number }) {
    const palette = sectionPalettes[idx];
    return (
      <svg viewBox="0 0 900 600" width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, willChange: 'transform' }} xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="900" height="600" fill={palette.svgColor} style={{ transition: 'fill 1.5s cubic-bezier(.4,0,.2,1)' }}></rect>
        <g transform="translate(900, 600)"><path d="M-486.7 0C-484.8 -68.9 -482.9 -137.9 -449.7 -186.3C-416.5 -234.7 -352.2 -262.6 -305.5 -305.5C-258.8 -348.3 -229.7 -406.1 -181.8 -438.8C-133.8 -471.5 -66.9 -479.1 0 -486.7L0 0Z" fill={palette.svgAccent} style={{ transition: 'fill 1.5s cubic-bezier(.4,0,.2,1)' }}></path></g>
        <g transform="translate(0, 0)"><path d="M486.7 0C440.5 49.1 394.2 98.2 372.3 154.2C350.4 210.2 352.9 273.1 326.7 326.7C300.5 380.3 245.5 424.6 186.3 449.7C127 474.8 63.5 480.8 0 486.7L0 0Z" fill={palette.svgAccent2 || palette.svgAccent} style={{ transition: 'fill 1.5s cubic-bezier(.4,0,.2,1)' }}></path></g>
      </svg>
    );
  }
  function Waves2Animated({ idx }: { idx: number }) {
    const palette = sectionPalettes[idx];
    return (
      <svg viewBox="0 0 900 600" width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, willChange: 'transform' }} xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="900" height="600" fill={palette.svgColor} style={{ transition: 'fill 1.5s cubic-bezier(.4,0,.2,1)' }}></rect>
        <g transform="translate(900, 0)"><path d="M0 486.7C-68.9 484.8 -137.9 482.9 -186.3 449.7C-234.7 416.5 -262.6 352.2 -305.5 305.5C-348.3 258.8 -406.1 229.7 -438.8 181.8C-471.5 133.8 -479.1 66.9 -486.7 0L0 0Z" fill={palette.svgAccent} style={{ transition: 'fill 1.5s cubic-bezier(.4,0,.2,1)' }}></path></g>
        <g transform="translate(0, 600)"><path d="M0 -486.7C49.1 -440.5 98.2 -394.2 154.2 -372.3C210.2 -350.4 273.1 -352.9 326.7 -326.7C380.3 -300.5 424.6 -245.5 449.7 -186.3C474.8 -127 480.8 -63.5 486.7 0L0 0Z" fill={palette.svgAccent2 || palette.svgAccent} style={{ transition: 'fill 1.5s cubic-bezier(.4,0,.2,1)' }}></path></g>
      </svg>
    );
  }

  // Fungsi scroll ke section
  const scrollToSection = (idx: number) => {
    sectionRefs[idx].current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Tambahkan state untuk dropdown menu mobile
  type MenuItem = { label: string; idx: number };
  const menuItems: MenuItem[] = [
    { label: 'Beranda', idx: 0 },
    { label: 'Profil', idx: 1 },
    { label: 'Galeri', idx: 2 },
    { label: 'Kontak', idx: 3 },
  ];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [mobileCardIndex, setMobileCardIndex] = useState(0);
  const cardList = [
    {
      title: 'Visi',
      content: null,
    },
    {
      title: 'Misi',
      content: null,
    },
    {
      title: 'Kurikulum',
      content: (
        <ul style={{margin:'10px 0 0 0',padding:0,fontSize:'0.98rem',color:palette.textColor}}>
          <li>• Al-Qur&#39;an & Tajwid</li>
          <li>• Aqidah & Akhlak</li>
          <li>• Fiqih & Ibadah</li>
          <li>• Sejarah Islam</li>
          <li>• Bahasa Arab</li>
        </ul>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100vh',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}
      className="hide-scrollbar"
    >
      {/* Tombol Switch Tema & Dropdown Menu Mobile (pojok kanan atas) */}
      <div
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 110,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Tombol switch tema */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            background: palette.accentText,
            color: theme === 'dark' ? palette.textColor : '#1a237e',
            border: `2px solid ${theme === 'dark' ? '#fff' : '#1a237e'}`,
            outline: `2.5px solid ${theme === 'dark' ? '#FFD36E' : '#FBAE3C'}`,
            outlineOffset: '2px',
            borderRadius: 8,
            padding: isMobileScreen ? '0.35rem 0.7rem' : '0.5rem 1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: palette.shadow,
            letterSpacing: 1,
            transition: 'outline-color 0.2s, border-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobileScreen ? '1.1rem' : '1.2rem',
          }}
          aria-label="Ganti tema"
        >
          {theme === 'dark' ? (
            // Icon Matahari (untuk mode terang)
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            // Icon Bulan (untuk mode gelap)
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={palette.textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
          )}
        </button>
        {/* Tombol menu hamburger, hanya tampil di mobile */}
        {isMobileScreen && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              style={{
                background: palette.accentText,
                color: theme === 'dark' ? palette.textColor : '#1a237e',
                border: `2px solid ${theme === 'dark' ? '#fff' : '#1a237e'}`,
                borderRadius: 8,
                padding: '0.35rem 0.7rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: palette.shadow,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 6,
              }}
              aria-label="Menu Navigasi"
            >
              {/* Ikon hamburger */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            {/* Dropdown menu */}
            {mobileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: palette.blockBg,
                  border: `2px solid ${palette.accentText}`,
                  borderRadius: 10,
                  boxShadow: palette.shadow,
                  minWidth: 140,
                  padding: '0.5rem 0',
                  zIndex: 999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {menuItems.map((item) => (
                  <button
                    key={item.idx}
                    onClick={() => {
                      scrollToSection(item.idx);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      background: activeSection === item.idx ? palette.accentText : 'transparent',
                      color: activeSection === item.idx ? (theme === 'dark' ? '#1a237e' : '#fff') : palette.textColor,
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.6rem 1.2rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >{item.label}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tombol Navigasi Section (center, scrollable di mobile) */}
      <div
        style={{
          position: 'fixed',
          top: isMobileScreen ? 60 : 24,
          left: 0,
          right: 0,
          zIndex: 100,
          display: isMobileScreen ? 'none' : 'flex', // Sembunyikan di mobile
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 0,
          overflowX: isMobileScreen ? 'auto' : 'visible',
          padding: isMobileScreen ? '0 4px' : '0 16px',
          pointerEvents: 'auto',
        }}
      >
        {/* Logo dan nama sekolah (hanya desktop/tablet) */}
        {!isMobileScreen && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Logo */}
            <Image src="/android-chrome-512x512.png" alt="Logo" width={60} height={60} style={{ objectFit: 'contain', display: 'block', marginRight: 18 }} unoptimized />
            {/* Nama sekolah */}
            <span style={{ fontWeight: 800, fontSize: '1.35rem', color: palette.textColor, letterSpacing: 1, textShadow: '0 1px 4px #fff, 0 0.5px 0 #FBAE3C' }}>
              MDT BILAL BIN RABBAH
            </span>
          </div>
        )}
        <div style={{
          display: 'flex',
          gap: isMobileScreen ? 6 : 8,
          position: !isMobileScreen ? 'absolute' : undefined,
          left: !isMobileScreen ? '50%' : undefined,
          top: !isMobileScreen ? '50%' : undefined,
          transform: !isMobileScreen ? 'translate(-50%, -50%)' : undefined,
          margin: isMobileScreen ? undefined : 0,
        }}>
          {menuItems.map((item) => (
            <button
              key={item.idx}
              onClick={() => scrollToSection(item.idx)}
              style={{
                background: activeSection === item.idx
                  ? (theme === 'dark' ? 'rgba(255,211,110,0.95)' : 'rgba(251,174,60,0.95)')
                  : (theme === 'dark' ? 'rgba(24,28,42,0.85)' : 'rgba(255,255,255,0.85)'),
                color: activeSection === item.idx
                  ? (theme === 'dark' ? '#1a237e' : '#fff')
                  : (theme === 'dark' ? '#FFD36E' : '#1a237e'),
                border: `2px solid ${palette.accentText}`,
                outline: `1.5px solid ${theme === 'dark' ? '#fff' : '#1a237e'}`,
                outlineOffset: '1.5px',
                borderRadius: 10,
                padding: isMobileScreen ? '0.35rem 0.9rem' : '0.6rem 1.4rem',
                fontWeight: 800,
                fontSize: isMobileScreen ? '1rem' : '1.13rem',
                cursor: 'pointer',
                boxShadow: '0 6px 24px 0 rgba(30,30,60,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)',
                letterSpacing: 1,
                transition: 'background 0.2s, color 0.2s, outline 0.2s',
                minWidth: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: theme === 'dark'
                  ? '0 1px 4px #000, 0 0.5px 0 #FFD36E'
                  : '0 1px 4px #fff, 0 0.5px 0 #FBAE3C',
                backdropFilter: 'blur(4px)',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLButtonElement).style.background = activeSection === item.idx
                  ? (theme === 'dark' ? 'rgba(255,211,110,1)' : 'rgba(251,174,60,1)')
                  : (theme === 'dark' ? 'rgba(40,44,60,0.95)' : 'rgba(255,255,255,1)');
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLButtonElement).style.background = activeSection === item.idx
                  ? (theme === 'dark' ? 'rgba(255,211,110,0.95)' : 'rgba(251,174,60,0.95)')
                  : (theme === 'dark' ? 'rgba(24,28,42,0.85)' : 'rgba(255,255,255,0.85)');
              }}
            >{item.label}</button>
          ))}
        </div>
      </div>

      {/* Section 1: Beranda */}
      <section
        ref={sectionRefs[0]}
        style={{
          height: isMobileScreen ? '100svh' : 'auto',
          minHeight: isMobileScreen ? '100svh' : '100vh',
          maxHeight: isMobileScreen ? '100svh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: isMobileScreen ? '1.2rem 0.5rem' : '3.5rem 1rem 2.5rem 1rem',
          marginTop: isMobileScreen ? 80 : 0,
          overflow: 'hidden',
          scrollSnapAlign: 'start',
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
          contain: 'strict',
        }}
      >
        {/* Ornamen background islami transparan */}
        {!isMobileScreen && (
          <svg width="340" height="340" viewBox="0 0 340 340" fill="none" style={{position:'absolute',top:-60,left:-60,opacity:0.13,zIndex:0}}><circle cx="170" cy="170" r="170" fill="#FBAE3C"/><path d="M170 60l18.5 56.5h59.5l-48 34.5 18.5 56.5-48-34.5-48 34.5 18.5-56.5-48-34.5h59.5z" fill="#FFD36E"/></svg>
        )}
        <Waves1Animated idx={activeSection === 0 ? 0 : activeSection} />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 800,
            margin: '0 auto',
            background: palette.blockBg,
            borderRadius: 32,
            boxShadow: '0 8px 40px 0 rgba(30,30,60,0.13), 0 2px 12px 0 rgba(0,0,0,0.10)',
            padding: isMobileScreen ? '2.2rem 1rem' : '3.2rem 2.5rem 2.5rem 2.5rem',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: isMobileScreen ? 'column' : 'row',
            alignItems: 'center',
            gap: isMobileScreen ? 0 : 36,
          }}
        >
          {/* Ilustrasi anak belajar */}
          {!isMobileScreen && (
            <div style={{flex:'0 0 220px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Image src="/android-chrome-512x512.png" alt="Logo" width={160} height={160} style={{ objectFit: 'contain', display: 'block' }} />
            </div>
          )}
          <div style={{flex:1}}>
            {/* Badge tahun ajaran baru */}
            <div style={{display:'inline-block',background:'linear-gradient(90deg,#FFD36E,#FBAE3C)',color:'#1a237e',fontWeight:700,fontSize:'1.05rem',borderRadius:8,padding:'0.25rem 1.1rem',marginBottom:18,boxShadow:'0 2px 8px rgba(251,174,60,0.13)'}}>
              PPDB {new Date().getFullYear()}/{(new Date().getFullYear()+1).toString().slice(2)}
            </div>
            {/* Judul gradasi dan underline animasi */}
            <h1 style={{
              fontSize: isMobileScreen ? '7vw' : '2.7rem',
              fontWeight: 900,
              marginBottom: 8,
              background: 'linear-gradient(90deg,#FFD36E 30%,#FBAE3C 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 1.5,
              position: 'relative',
              lineHeight: 1.13,
              textShadow: '0 2px 12px rgba(251,174,60,0.13)',
              display: 'inline-block',
            }}>
              Menerima Peserta Didik Baru
              <span style={{display:'block',height:5,marginTop:6,background:'linear-gradient(90deg,#FFD36E,#FBAE3C)',borderRadius:3,animation:'underlineAnim 2.2s infinite alternate'}}></span>
            </h1>
            <style>{`@keyframes underlineAnim{0%{width:40%}100%{width:100%}}`}</style>
            {/* Deskripsi poin keunggulan */}
            <ul style={{listStyle:'none',padding:0,margin:'18px 0 0 0',textAlign:'left',maxWidth:480,marginLeft:'auto',marginRight:'auto'}}>
              <li style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:'1.3rem'}}>🌱</span>
                <span style={{fontSize:'1.08rem',color:palette.textColor,fontWeight:500}}>Lingkungan Islami & suasana kekeluargaan</span>
              </li>
              <li style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:'1.3rem'}}>👨‍🏫</span>
                <span style={{fontSize:'1.08rem',color:palette.textColor,fontWeight:500}}>Pembimbingan agama & akhlak dasar</span>
              </li>
              <li style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:'1.3rem'}}>📚</span>
                <span style={{fontSize:'1.08rem',color:palette.textColor,fontWeight:500}}>Belajar Al-Qur&#39;an, Ibadah, dan Ilmu Dasar</span>
              </li>
              <li style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:'1.3rem'}}>💸</span>
                <span style={{fontSize:'1.08rem',color:palette.textColor,fontWeight:500}}>Biaya pendidikan sangat ringan & terjangkau</span>
              </li>
            </ul>
            {/* Ajakan & tombol */}
            <div style={{marginTop: isMobileScreen ? 22 : 32}}>
              <p style={{fontSize:'1.08rem',color:palette.textColor,textShadow:palette.textShadow,fontWeight:500,marginBottom:14}}>Untuk informasi pendaftaran, silakan klik tombol di bawah ini atau hubungi kami.</p>
              <a href="#profil" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 0,
                padding: isMobileScreen ? '0.7rem 1.5rem' : '1rem 2.5rem',
                background: 'linear-gradient(90deg,#FFD36E,#FBAE3C)',
                color: '#1a237e',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: isMobileScreen ? '1.08rem' : '1.18rem',
                textDecoration: 'none',
                boxShadow: '0 4px 18px 0 rgba(251,174,60,0.13)',
                border: '2px solid #FFD36E',
                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
              }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(90deg,#FBAE3C,#FFD36E)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px 0 rgba(251,174,60,0.18)';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(90deg,#FFD36E,#FBAE3C)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 18px 0 rgba(251,174,60,0.13)';
                }}
              >
                Lihat Info PPDB
                <svg width="22" height="22" fill="none" stroke="#1a237e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Profil Sekolah */}
      <section
        ref={sectionRefs[1]}
        id="profil-madrasah-baleendah-malakasari"
        className="profil-madrasah section-profil-sekolah madrasah-di-baleendah madrasah-di-malakasari"
        itemScope
        itemType="https://schema.org/School"
        style={{
          height: isMobileScreen ? '100svh' : 'auto',
          minHeight: isMobileScreen ? '100svh' : '100vh',
          maxHeight: isMobileScreen ? '100svh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: isMobileScreen ? '1.2rem 0.5rem' : '2rem 1rem',
          overflow: 'hidden',
          scrollSnapAlign: 'start',
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
          contain: 'strict',
        }}
      >
        <Waves2Animated idx={activeSection === 1 ? 1 : activeSection} />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 800,
            margin: '0 auto',
            background: palette.blockBg,
            borderRadius: 24,
            boxShadow: palette.shadow,
            padding: isMobileScreen ? '0.5rem' : '2.8rem 1.5rem 2.5rem 1.5rem',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2 itemProp="name" style={{ fontSize: isMobileScreen ? '6vw' : '2.2rem', fontWeight: 800, marginBottom: isMobileScreen ? '0.5rem' : '1.2rem', color: palette.accentText, textShadow: palette.textShadow, letterSpacing: 0.5, display:'flex',alignItems:'center',gap:10 }}>
            <svg width="32" height="32" fill="none" stroke={palette.accentText} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 13v7m0 0H7m5 0h5"/></svg>
            Profil MDT Bilal Bin Rabbah
          </h2>
          <div style={{height:2,background:`linear-gradient(90deg,${palette.accentText},${palette.accentText}33,transparent)`,margin:isMobileScreen ? '0 auto 8px auto' : '0 auto 22px auto',width:'60%',borderRadius:2}}></div>
          <p itemProp="description" style={{ fontSize: isMobileScreen ? '1rem' : '1.18rem', color: palette.textColor, textShadow: palette.textShadow, fontWeight: 500, marginBottom: isMobileScreen ? 8 : 18, lineHeight: 1.5, textAlign: 'justify' }}>
            <strong>Madrasah Diniyah Takmiliyah (MDT) Bilal Bin Rabbah</strong> adalah <strong>madrasah di Desa Malakasari</strong>, Kecamatan Baleendah, yang berperan penting dalam membentuk karakter, memperdalam pemahaman agama, dan menanamkan nilai-nilai akhlak mulia bagi generasi muda. MDT hadir sebagai pelengkap pendidikan formal, memberikan ruang yang lebih luas untuk pembelajaran Al-Qur&#39;an, aqidah, ibadah, akhlak, serta bahasa Arab secara terstruktur dan berjenjang.
          </p>
          {/* Visi dan Misi */}
          <div style={{
            display: isMobileScreen ? 'block' : 'flex',
            flexWrap: isMobileScreen ? undefined : 'wrap',
            justifyContent: 'center',
            gap: isMobileScreen ? undefined : '1.5rem',
            marginBottom: isMobileScreen ? 4 : 8,
            width: '100%',
            position: 'relative',
          }}>
            {/* MOBILE SLIDER */}
            {isMobileScreen ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: 340, margin: '0 auto' }}>
                <div style={{
                  minWidth: 180,
                  maxWidth: 340,
                  background: theme === 'dark' ? '#23263a' : '#fffbe8',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #0001',
                  padding: '0.7rem 0.5rem',
                  textAlign: 'left',
                  margin: '0 auto',
                  transition: 'all 0.3s',
                }}>
                  <strong style={{ color: palette.accentText, fontWeight: 700, fontSize: '1.05rem', letterSpacing: 0.5 }}>{cardList[mobileCardIndex].title}</strong>
                  {cardList[mobileCardIndex].content}
                </div>
                {/* Navigasi panah */}
                <button
                  onClick={() => setMobileCardIndex((prev) => prev === 0 ? cardList.length - 1 : prev - 1)}
                  style={{
                    position: 'absolute',
                    left: -18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: palette.accentText,
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px #0002',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                  aria-label="Sebelumnya"
                >
                  <svg width="18" height="18" fill="none" stroke="#1a237e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={() => setMobileCardIndex((prev) => prev === cardList.length - 1 ? 0 : prev + 1)}
                  style={{
                    position: 'absolute',
                    right: -18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: palette.accentText,
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px #0002',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                  aria-label="Berikutnya"
                >
                  <svg width="18" height="18" fill="none" stroke="#1a237e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                </button>
                {/* Indikator bulat */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                  {cardList.map((_, idx) => (
                    <span key={idx} style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: idx === mobileCardIndex ? palette.accentText : '#ccc',
                      display: 'inline-block',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
              </div>
            ) : (
              // DESKTOP: 3 card sejajar
              <>
                <div style={{
                  minWidth: 220,
                  maxWidth: 260,
                  background: theme === 'dark' ? '#23263a' : '#fffbe8',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #0001',
                  padding: '1.2rem 1.3rem',
                  textAlign: 'left',
                  flex: 1,
                }}>
                  <strong style={{ color: palette.accentText, fontWeight: 700, fontSize: '1.15rem', letterSpacing: 0.5 }}>Visi</strong>
                </div>
                <div style={{
                  minWidth: 220,
                  maxWidth: 260,
                  background: theme === 'dark' ? '#23263a' : '#fffbe8',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #0001',
                  padding: '1.2rem 1.3rem',
                  textAlign: 'left',
                  flex: 1,
                }}>
                  <strong style={{ color: palette.accentText, fontWeight: 700, fontSize: '1.15rem', letterSpacing: 0.5 }}>Misi</strong>
                </div>
                <div style={{
                  minWidth: 220,
                  maxWidth: 260,
                  background: theme === 'dark' ? '#23263a' : '#fffbe8',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #0001',
                  padding: '1.2rem 1.3rem',
                  textAlign: 'left',
                  flex: 1,
                }}>
                  <strong style={{ color: palette.accentText, fontWeight: 700, fontSize: '1.15rem', letterSpacing: 0.5 }}>Kurikulum</strong>
                  <ul style={{margin:'10px 0 0 0',padding:0,fontSize:'1.05rem',color:palette.textColor}}>
                    <li>• Al-Qur&#39;an & Tajwid</li>
                    <li>• Aqidah & Akhlak</li>
                    <li>• Fiqih & Ibadah</li>
                    <li>• Sejarah Islam</li>
                    <li>• Bahasa Arab</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Galeri Kegiatan */}
      <section
        ref={sectionRefs[2]}
        style={{
          height: isMobileScreen ? '100svh' : 'auto',
          minHeight: isMobileScreen ? '100svh' : '100vh',
          maxHeight: isMobileScreen ? '100svh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: isMobileScreen ? '1.2rem 0.5rem' : '2rem 0.5rem',
          overflow: 'hidden',
          scrollSnapAlign: 'start',
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
          contain: 'strict',
        }}
        id="galeri"
      >
        <Waves1Animated idx={activeSection === 2 ? 2 : activeSection} />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 900,
            background: palette.blockBg,
            borderRadius: 24,
            boxShadow: palette.shadow,
            padding: '2.5rem 0.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <h2 style={{ fontSize: isMobileScreen ? '6vw' : '2.1rem', fontWeight: 700, marginBottom: '2rem', color: palette.accentText, textShadow: palette.textShadow, letterSpacing: 0.5 }}>
            Galeri Kegiatan
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobileScreen ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '1rem',
              justifyContent: 'center',
            }}
          >
            {/* Placeholder Tailwind Gallery */}
            {(isMobileScreen ? Array.from({length:4}) : Array.from({length:8})).map((_, i) => (
              <div key={i} style={{ borderRadius: '1rem', background: theme === 'dark' ? 'rgba(40,40,60,0.85)' : 'rgba(255,255,255,0.92)', padding: '2rem', boxShadow: palette.shadow, color: palette.textColor, fontWeight: 500, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:120 }}>
                <svg className="mx-auto mb-3" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="64" height="64" rx="16" fill="#F3F4F6"/>
                  <path d="M16 48L28 32L40 44L48 36V48H16Z" fill="#E5E7EB"/>
                  <circle cx="22" cy="26" r="4" fill="#E5E7EB"/>
                </svg>
                <span style={{color:'#9CA3AF',fontSize:'1.05rem'}}>Belum ada foto</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Kontak */}
      <section
        ref={sectionRefs[3]}
        id="kontak"
        className="section-kontak-lokasi kontak-madrasah madrasah-di-malakasari madrasah-di-baleendah"
        itemScope
        itemType="https://schema.org/Organization"
        style={{
          height: isMobileScreen ? '100svh' : 'auto',
          minHeight: isMobileScreen ? '100svh' : '100vh',
          maxHeight: isMobileScreen ? '100svh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: isMobileScreen ? '1.2rem 0.5rem' : '2rem 0.5rem',
          overflow: 'hidden',
          scrollSnapAlign: 'start',
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
          contain: 'strict',
        }}
      >
        <Waves2Animated idx={activeSection === 3 ? 3 : activeSection} />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 900,
            margin: '0 auto',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 32px rgba(30,136,229,0.10)',
            padding: isMobileScreen ? '0.5rem' : '2.5rem',
            display: 'flex',
            flexDirection: isMobileScreen ? 'column' : 'row',
            gap: isMobileScreen ? 8 : 36,
            alignItems: 'stretch',
            justifyContent: 'center',
          }}
        >
          {/* Info Kontak & Lokasi */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: isMobileScreen ? 'center' : 'flex-start',
            padding: isMobileScreen ? 0 : '0 0.7rem 0 0',
            marginBottom: isMobileScreen ? 0 : 0,
          }}>
            {/* Judul & Nama */}
            <h2 itemProp="name" style={{ fontSize: isMobileScreen ? '5vw' : '1.5rem', fontWeight: 800, marginBottom: isMobileScreen ? 6 : 12, color: palette.accentText, textShadow: palette.textShadow, letterSpacing: 0.5, display:'flex',flexDirection:'column',alignItems:'flex-start',gap:2 }}>
              <span>Kontak & Lokasi</span>
              <span>MDT Bilal Bin Rabbah</span>
            </h2>
            <div style={{height:2,background:`linear-gradient(90deg,${palette.accentText},${palette.accentText}33,transparent)`,margin:isMobileScreen ? '0 0 6px 0' : '0 0 16px 0',width:'60%',borderRadius:2}}></div>
            {/* Alamat */}
            <address itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{fontStyle:'normal',color:palette.textColor,marginBottom: isMobileScreen ? 4 : 10, width: '100%', textAlign: isMobileScreen ? 'center' : 'left'}}>
              <div style={{fontSize: isMobileScreen ? '0.95rem' : '1.08rem',marginBottom:isMobileScreen ? 2 : 6,color:'#222',fontWeight:500}}>
                Jl. Pasir Pogor Kp. Pasirpogor No.Rt 05/03, Desa Malakasari, Kecamatan Baleendah, Kabupaten Bandung, Jawa Barat 40375
              </div>
            </address>
            {/* Telepon */}
            <div style={{display:'flex',alignItems:'center',gap:isMobileScreen ? 4 : 8,marginBottom:isMobileScreen ? 4 : 10,justifyContent: isMobileScreen ? 'center' : 'flex-start'}}>
              <svg width="18" height="18" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.67 20.13l-1.51-4.36a2.13 2.13 0 0 0-2-1.45h-1.11a2.13 2.13 0 0 0-2 1.45l-1.51 4.36a2.13 2.13 0 0 0 2 2.87h1.11a2.13 2.13 0 0 0 2-2.87z"/><circle cx="12" cy="12" r="10"/></svg>
              <span itemProp="telephone" style={{fontWeight:600, color:'#222'}}>0812-3456-7890</span>
            </div>
            {/* Tombol WhatsApp */}
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="wa-kontak-madrasah" style={{ display: 'inline-flex', alignItems:'center', gap:isMobileScreen ? 4 : 8, marginTop: 0, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: isMobileScreen ? '0.95rem' : '1.05rem', border:'2px solid #25D366', borderRadius:8, padding:isMobileScreen ? '4px 10px' : '6px 18px', background:'#25D366', boxShadow:'0 2px 8px #25D36622', transition:'background 0.2s, color 0.2s', marginBottom: isMobileScreen ? 4 : 10 }}
              onMouseOver={e => {e.currentTarget.style.background='#128C7E';e.currentTarget.style.color='#fff';}}
              onMouseOut={e => {e.currentTarget.style.background='#25D366';e.currentTarget.style.color='#fff';}}
              itemProp="url"
            >
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.67 20.13l-1.51-4.36a2.13 2.13 0 0 0-2-1.45h-1.11a2.13 2.13 0 0 0-2 1.45l-1.51 4.36a2.13 2.13 0 0 0 2 2.87h1.11a2.13 2.13 0 0 0 2-2.87z"/><circle cx="12" cy="12" r="10"/></svg>
              WhatsApp MDT Bilal Bin Rabbah
            </a>
            {/* Deskripsi Lokasi */}
            <div style={{marginTop:isMobileScreen ? 4 : 10, color:palette.textColor, fontSize:isMobileScreen ? '0.92rem' : '0.98rem', textAlign:'justify', maxWidth: 400, marginBottom: isMobileScreen ? 6 : 0}}>
              <strong>Lokasi MDT Bilal Bin Rabbah</strong> sangat strategis, mudah dijangkau dari berbagai wilayah di <strong>Desa Malakasari</strong> maupun <strong>Kecamatan Baleendah</strong>. Untuk informasi lebih lanjut mengenai <strong>madrasah di Malakasari</strong> atau <strong>madrasah di Baleendah</strong>, silakan hubungi kontak di atas atau kunjungi langsung lokasi kami.
            </div>
          </div>
          {/* Peta Google Maps */}
          <div style={{
            flex: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            borderRadius: 0,
            boxShadow: 'none',
            padding: isMobileScreen ? 0 : '0 0 0 0.5rem',
            minHeight: isMobileScreen ? 120 : 400,
            marginTop: isMobileScreen ? 0 : 0,
            order: isMobileScreen ? 2 : 0, // pastikan di mobile peta di bawah
          }}>
            <div className="mapouter" style={{ position: 'relative', textAlign: 'right', width: isMobileScreen ? '100%' : 400, height: isMobileScreen ? 120 : 400, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px #0001', display:'flex',alignItems:'stretch' }}>
              <div className="gmap_canvas" style={{ overflow: 'hidden', background: 'none', width: '100%', height: '100%' }}>
                <iframe
                  width={isMobileScreen ? '100%' : '400px'}
                  height={isMobileScreen ? '120px' : '400px'}
                  style={{ border: 0, borderRadius: 14, height: '100%' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed/v1/place?q=mdt%20bilal%20bin%20rabbah&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
                  title="Lokasi MDT Bilal Bin Rabbah"
                ></iframe>
              </div>
              <a href="https://norsumediagroup.com/embed-google-map-website-free" target="_blank" rel="noopener noreferrer" className="gme-generated-link" style={{ display: 'none' }}>Embed Map on Website for Free</a>
              <style>{`.mapouter{position:relative;text-align:right;}.gmap_canvas{overflow:hidden;background:none!important;}.gmap_canvas iframe{width:100%;height:100%;}.mapouter a{display:block;font-size:0.85em;text-align:center;padding:5px 0;color:#6c757d;text-decoration:none;}.gme-generated-link{display:none!important;}`}</style>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
