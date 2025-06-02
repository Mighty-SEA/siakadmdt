"use client";
import { useState, useRef, useEffect } from "react";

// Helper untuk deteksi mobile
const isSSR = typeof window === 'undefined';

export default function Home() {
  // State tema lokal landing
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState(0);
  // State untuk deteksi mobile screen (client only)
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const sectionRefs: React.RefObject<HTMLElement | null>[] = [
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null)
  ];

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
  }, [theme]);

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
            <img src="/android-chrome-512x512.png" alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain', display: 'block', marginRight: 18 }} onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style=\'font-weight:800;font-size:2.2rem;color:#FBAE3C;\'>S</span>'; }} />
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
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: isMobileScreen ? '2.5rem 0.5rem 1.5rem 0.5rem' : '3.5rem 1rem 2.5rem 1rem',
          marginTop: isMobileScreen ? 80 : 0,
          overflow: 'hidden',
          scrollSnapAlign: 'start',
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
              <img src="/android-chrome-512x512.png" alt="Logo" style={{ width: 160, height: 160, objectFit: 'contain', display: 'block' }} />
            </div>
          )}
          <div style={{flex:1}}>
            {/* Badge tahun ajaran baru */}
            <div style={{display:'inline-block',background:'linear-gradient(90deg,#FFD36E,#FBAE3C)',color:'#1a237e',fontWeight:700,fontSize:'1.05rem',borderRadius:8,padding:'0.25rem 1.1rem',marginBottom:18,boxShadow:'0 2px 8px rgba(251,174,60,0.13)'}}>
              PPDB {new Date().getFullYear()}/{(new Date().getFullYear()+1).toString().slice(2)}
            </div>
            {/* Judul gradasi dan underline animasi */}
            <h1 style={{
              fontSize: isMobileScreen ? '2rem' : '2.7rem',
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
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: '2rem 1rem',
          overflow: 'hidden',
          scrollSnapAlign: 'start',
          transform: 'translateZ(0)',
          contain: 'strict',
        }}
        id="profil"
      >
        <Waves2Animated idx={activeSection === 1 ? 1 : activeSection} />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 700,
            margin: '0 auto',
            background: palette.blockBg,
            borderRadius: 24,
            boxShadow: palette.shadow,
            padding: '2.5rem 1rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, marginBottom: '1rem', color: palette.accentText, textShadow: palette.textShadow, letterSpacing: 0.5 }}>
            Profil Sekolah
          </h2>
          <p style={{ fontSize: '1.15rem', color: palette.textColor, textShadow: palette.textShadow, fontWeight: 500 }}>
            Sekolah kami berkomitmen mencetak generasi cerdas, berakhlak mulia, dan berwawasan global. Didukung tenaga pendidik profesional, fasilitas lengkap, serta lingkungan belajar yang nyaman dan islami.
          </p>
        </div>
      </section>

      {/* Section 3: Galeri Kegiatan */}
      <section
        ref={sectionRefs[2]}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: '2rem 0.5rem',
          overflow: 'hidden',
          scrollSnapAlign: 'start',
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
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, marginBottom: '2rem', color: palette.accentText, textShadow: palette.textShadow, letterSpacing: 0.5 }}>
            Galeri Kegiatan
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(2, 1fr)',
              gap: '1rem',
              justifyContent: 'center',
            }}
          >
            <div style={{ borderRadius: '1rem', background: theme === 'dark' ? 'rgba(40,40,60,0.85)' : 'rgba(255,255,255,0.92)', padding: '2rem', boxShadow: palette.shadow, color: palette.textColor, fontWeight: 500 }}>Kegiatan 1</div>
            <div style={{ borderRadius: '1rem', background: theme === 'dark' ? 'rgba(40,40,60,0.85)' : 'rgba(255,255,255,0.92)', padding: '2rem', boxShadow: palette.shadow, color: palette.textColor, fontWeight: 500 }}>Kegiatan 2</div>
            <div style={{ borderRadius: '1rem', background: theme === 'dark' ? 'rgba(40,40,60,0.85)' : 'rgba(255,255,255,0.92)', padding: '2rem', boxShadow: palette.shadow, color: palette.textColor, fontWeight: 500 }}>Kegiatan 3</div>
            <div style={{ borderRadius: '1rem', background: theme === 'dark' ? 'rgba(40,40,60,0.85)' : 'rgba(255,255,255,0.92)', padding: '2rem', boxShadow: palette.shadow, color: palette.textColor, fontWeight: 500 }}>Kegiatan 4</div>
          </div>
        </div>
      </section>

      {/* Section 4: Kontak */}
      <section
        ref={sectionRefs[3]}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: '2rem 0.5rem',
          overflow: 'hidden',
          scrollSnapAlign: 'start',
          transform: 'translateZ(0)',
          contain: 'strict',
        }}
        id="kontak"
      >
        <Waves2Animated idx={activeSection === 3 ? 3 : activeSection} />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 600,
            margin: '0 auto',
            background: palette.blockBg,
            borderRadius: 24,
            boxShadow: palette.shadow,
            padding: '2.5rem 0.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, marginBottom: '1rem', color: palette.accentText, textShadow: palette.textShadow, letterSpacing: 0.5 }}>
            Kontak & Lokasi
          </h2>
          <p style={{ color: palette.textColor, marginBottom: '0.5rem', textShadow: palette.textShadow, fontWeight: 500 }}>Hubungi kami untuk informasi lebih lanjut atau kunjungi kampus kami:</p>
          <p style={{ fontWeight: 'bold', color: palette.textColor, textShadow: palette.textShadow }}>Email: info@sekolahanda.sch.id</p>
          <p style={{ fontWeight: 'bold', color: palette.textColor, textShadow: palette.textShadow }}>Telepon: 0812-3456-7890</p>
          <p style={{ color: palette.textColor, textShadow: palette.textShadow, marginTop: 8 }}>Jl. Pendidikan No. 123, Kota Anda</p>
        </div>
      </section>
    </div>
  );
}
