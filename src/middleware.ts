import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Next.js untuk melindungi rute admin dan menambahkan header keamanan
 * 
 * Middleware ini berjalan sebelum request mencapai halaman yang diminta.
 * Jika pengguna mencoba mengakses rute admin tanpa terautentikasi,
 * mereka akan diarahkan ke halaman login.
 * 
 * Juga menambahkan header keamanan untuk semua response.
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
    
    // Redirect langsung ke halaman login dengan header keamanan
    const response = NextResponse.redirect(url);
    // Tambahkan header keamanan
    addSecurityHeaders(response);
    return response;
  }

  console.log('Melanjutkan ke halaman yang diminta');
  // Lanjutkan request normal jika sudah login atau bukan rute admin
  const response = NextResponse.next();
  
  // Tambahkan header keamanan untuk semua response
  addSecurityHeaders(response);
  
  // Tambahkan header khusus untuk halaman admin
  if (pathname.startsWith('/admin')) {
    // Tambahkan header untuk mencegah caching dengan nilai yang lebih agresif
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Surrogate-Control', 'no-store');
    // Tambahkan timestamp server untuk membantu deteksi perubahan otentikasi
    response.headers.set('X-Auth-Timestamp', Date.now().toString());
    // Secara eksplisit menolak penggunaan cache penyimpanan
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }
  
  return response;
}

/**
 * Menambahkan header keamanan ke response
 */
function addSecurityHeaders(response: NextResponse) {
  // Mencegah clickjacking dengan X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Mengaktifkan proteksi XSS di browser
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Mencegah MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Content Security Policy untuk mencegah XSS dan injeksi
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
  );
  
  // HTTP Strict Transport Security (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (sebelumnya Feature Policy)
  response.headers.set(
    'Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Tambahkan header cache-control untuk mencegah caching pada semua response
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

/**
 * Konfigurasi middleware
 * 
 * Tentukan rute mana yang akan diproses oleh middleware ini
 * https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  // Jalankan middleware pada semua rute untuk menambahkan header keamanan
  matcher: [
    // Khusus untuk path yang dimulai dengan /admin
    '/admin', 
    '/admin/:path*',
    // Tambahkan path login untuk menerapkan header keamanan
    '/login',
    // Tambahkan path API untuk menerapkan header keamanan
    '/api/:path*'
  ],
}; 