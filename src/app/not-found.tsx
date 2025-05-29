"use client";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <h1 className="text-7xl font-extrabold text-error mb-4 drop-shadow">404</h1>
      <p className="text-lg text-base-content mb-8">Halaman tidak ditemukan.</p>
      <Link href="/" className="btn btn-primary">Kembali ke Beranda</Link>
    </div>
  );
} 