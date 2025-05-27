import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Next.js untuk melindungi rute admin
 * 
 * Middleware ini berjalan sebelum request mencapai halaman yang diminta.
 * Jika pengguna mencoba mengakses rute admin tanpa terautentikasi,
 * mereka akan diarahkan ke halaman login.
 */
export function middleware(request: NextRequest) {
  // Cek apakah user sudah login dengan memeriksa cookie
  const userCookie = request.cookies.get('user');
  const isAuthenticated = !!userCookie?.value;

  // Mendapatkan path yang diminta
  const { pathname } = request.nextUrl;

  console.log('Middleware dipanggil untuk path:', pathname);
  console.log('Status autentikasi:', isAuthenticated ? 'Terautentikasi' : 'Tidak terautentikasi');

  // Jika mengakses rute admin dan belum login
  if (pathname.startsWith('/admin') && !isAuthenticated) {
    console.log('Melakukan redirect ke halaman login');
    // Redirect ke halaman login dengan parameter returnUrl untuk redirect kembali setelah login
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    
    // Redirect langsung ke halaman login
    return NextResponse.redirect(url);
  }

  console.log('Melanjutkan ke halaman yang diminta');
  // Lanjutkan request normal jika sudah login atau bukan rute admin
  return NextResponse.next();
}

/**
 * Konfigurasi middleware
 * 
 * Tentukan rute mana yang akan diproses oleh middleware ini
 * https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  // Jalankan middleware hanya pada rute admin 
  // Menggunakan pattern yang lebih spesifik
  matcher: [
    // Khusus untuk path yang dimulai dengan /admin
    '/admin', 
    '/admin/:path*'
  ],
}; 