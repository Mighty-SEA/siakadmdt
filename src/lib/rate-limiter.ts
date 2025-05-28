// Implementasi rate limiter sederhana menggunakan Map
// Menyimpan percobaan login berdasarkan IP address

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

// Menyimpan data rate limit dalam memory
// Dalam produksi sebaiknya menggunakan Redis atau database
const rateLimitMap = new Map<string, RateLimitInfo>();

// Konfigurasi rate limit
const MAX_REQUESTS = 5; // Maksimal 5 percobaan
const WINDOW_MS = 60 * 1000; // Window 1 menit (60 detik)

export function rateLimit(identifier: string): {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
} {
  const now = Date.now();
  const resetAt = now + WINDOW_MS;
  
  // Cek apakah identifier sudah ada di map
  const rateLimitInfo = rateLimitMap.get(identifier);
  
  // Jika belum ada atau sudah expired, buat entry baru
  if (!rateLimitInfo || rateLimitInfo.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS - 1,
      resetAt: new Date(resetAt)
    };
  }
  
  // Jika sudah mencapai batas
  if (rateLimitInfo.count >= MAX_REQUESTS) {
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      resetAt: new Date(rateLimitInfo.resetAt)
    };
  }
  
  // Increment counter
  rateLimitInfo.count += 1;
  rateLimitMap.set(identifier, rateLimitInfo);
  
  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - rateLimitInfo.count,
    resetAt: new Date(rateLimitInfo.resetAt)
  };
}

// Fungsi untuk mendapatkan IP dari request
export function getClientIp(request: Request): string {
  // Coba dapatkan IP dari header Cloudflare atau header proxy lainnya
  const forwarded = request.headers.get('x-forwarded-for');
  const cfConnecting = request.headers.get('cf-connecting-ip');
  
  if (cfConnecting) {
    return cfConnecting;
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback ke string default jika tidak bisa mendapatkan IP
  return 'unknown-ip';
} 