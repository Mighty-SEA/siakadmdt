import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    // Implementasi rate limiter
    const clientIp = getClientIp(req);
    const rateLimitResult = rateLimit(clientIp);
    
    // Jika rate limit terlampaui
    if (!rateLimitResult.success) {
      const resetTime = format(rateLimitResult.resetAt, 'HH:mm:ss');
      return NextResponse.json(
        { 
          error: `Terlalu banyak percobaan login. Coba lagi setelah ${resetTime}` 
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt.getTime() / 1000).toString()
          }
        }
      );
    }

    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username/email dan password wajib diisi" }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { name: username },
        ],
      },
      include: { role: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }
    // Jangan return password
    const { password: _, ...userSafe } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    
    // Tambahkan header cache-control untuk mencegah caching pada browser
    const response = NextResponse.json({ user: userSafe, timestamp: Date.now() });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error("Error login:", error);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
} 