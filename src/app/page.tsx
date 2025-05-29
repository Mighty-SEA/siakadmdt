"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const galleryImages = [
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
  "/file.svg",
  "/globe.svg",
];

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-200 shadow sticky top-0 z-50">
        <div className="flex-1">
          <Image src="/next.svg" alt="Logo" width={40} height={40} className="rounded" />
          <span className="ml-2 text-xl font-bold text-primary">MDT BILAL BIN RABBAH</span>
        </div>
        <div className="flex-none gap-2">
          <select
            className="select select-bordered select-sm"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            {["light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter","dim","nord","sunset","caramellatte","abyss","silk"].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <a href="#daftar" className="btn btn-primary btn-sm">Daftar</a>
        </div>
      </div>

      {/* HERO */}
      <section className="hero min-h-[60vh] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="hero-content flex-col lg:flex-row-reverse gap-8">
          <Image src="/next.svg" alt="Logo" width={120} height={120} className="rounded-xl shadow-lg bg-white" />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Selamat Datang di MDT BILAL BIN RABBAH</h1>
            <p className="py-2 text-lg text-base-content max-w-xl">Madrasah Diniyah yang berkomitmen membina generasi Qur&#39;an, berakhlak mulia, dan berwawasan luas. Bergabunglah bersama kami untuk pendidikan agama yang berkualitas dan lingkungan belajar yang inspiratif.</p>
            <a href="#daftar" className="btn btn-primary mt-4">Daftar Sekarang</a>
          </div>
        </div>
      </section>

      {/* DESKRIPSI */}
      <section className="py-12 bg-base-100" id="deskripsi">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-center text-secondary mb-4">Tentang MDT BILAL BIN RABBAH</h2>
          <p className="text-base md:text-lg text-center text-base-content">MDT BILAL BIN RABBAH adalah lembaga pendidikan diniyah yang berfokus pada pembentukan karakter islami, penguatan hafalan Al-Qur&#39;an, dan pengembangan wawasan keislaman bagi generasi muda. Kami menyediakan lingkungan belajar yang kondusif, guru-guru berpengalaman, serta program-program unggulan untuk mendukung tumbuh kembang anak secara holistik.</p>
        </div>
      </section>

      {/* GALERI */}
      <section className="py-12 bg-base-200" id="galeri">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-primary mb-8">Galeri Kegiatan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-center">
            {galleryImages.map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-lg bg-base-100">
                <Image src={img} alt={`Galeri ${i+1}`} width={200} height={120} className="object-cover w-full h-32" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALAMAT */}
      <section className="py-12 bg-base-100" id="alamat">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center text-secondary mb-4">Alamat Madrasah</h2>
          <div className="text-center text-base-content mb-4">
            Jl. Contoh Alamat No. 123, Desa Maju, Kecamatan Makmur, Kabupaten Sejahtera, Provinsi Indonesia
          </div>
          {/* Google Maps Embed Placeholder */}
          <div className="flex justify-center">
            <div className="mockup-window border bg-base-200 w-full max-w-xl">
              <iframe
                title="Lokasi MDT BILAL BIN RABBAH"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.9999999999995!2d110.00000000000001!3d-7.000000000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMDAnMDAuMCJTIDExMMKwMDAnMDAuMCJF!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer footer-center p-6 bg-base-200 text-base-content/70 mt-8">
        <aside>
          <p className="font-semibold">{year && `© ${year} MDT BILAL BIN RABBAH`}</p>
          <p>Kontak: 0812-3456-7890 | Email: info@mdtbilal.sch.id</p>
        </aside>
      </footer>
    </div>
  );
}
