"use client";
import { useEffect, useState } from "react";

const themes = [
  "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter","dim","nord","sunset","caramellatte","abyss","silk"
];

export default function Home() {
  const [theme, setTheme] = useState("light");

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 px-2 sm:px-4">
      <div className="w-full max-w-2xl bg-base-200 rounded-xl shadow-xl p-4 sm:p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary text-center">MDT BILAL BIN RABBAH</h1>
        <p className="text-base sm:text-lg md:text-xl text-base-content text-center max-w-xl">
          Madrasah Diniyah yang berkomitmen membina generasi Qur&#39;ani, berakhlak mulia, dan berwawasan luas. Bergabunglah bersama kami untuk pendidikan agama yang berkualitas dan lingkungan belajar yang inspiratif.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button className="btn btn-primary btn-wide">Daftar Sekarang</button>
          <button className="btn btn-outline btn-secondary btn-wide">Kontak Kami</button>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <label className="font-semibold text-base-content">Pilih Tema Tampilan:</label>
          <select
            className="select select-bordered w-full max-w-xs text-base-content"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            {themes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <footer className="mt-10 text-base-content/60 text-sm text-center">&copy; {new Date().getFullYear()} MDT BILAL BIN RABBAH</footer>
    </div>
  );
}
