import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Mendapatkan timestamp untuk menghindari cache
    const timestamp = Date.now();
    
    // Get cookie user - gunakan await karena cookies() adalah async API di Next.js terbaru
    const cookieStore = await cookies();
    const userCookie = await cookieStore.get("user");
    
    if (!userCookie?.value) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    
    try {
      // Parse user data dari cookie
      const userData = JSON.parse(userCookie.value);
      const userId = userData.id;
      
      if (!userId) {
        return NextResponse.json({ error: "Data user tidak valid" }, { status: 400 });
      }
      
      // Dapatkan data user segar dari database
      const freshUserData = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
      
      if (!freshUserData) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      }
      
      // Jangan return password
      const { password: _, ...userSafe } = freshUserData; // eslint-disable-line @typescript-eslint/no-unused-vars
      
      // Tambahkan properti dari cookie untuk menjaga konsistensi
      const responseData = {
        ...userSafe,
        loginTimestamp: userData.loginTimestamp || timestamp,
        sessionId: userData.sessionId || timestamp.toString()
      };
      
      // Tambahkan header cache-control untuk mencegah caching
      const response = NextResponse.json({ 
        user: responseData,
        timestamp: timestamp
      });
      
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      
      return response;
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error mendapatkan user:", error);
    return NextResponse.json({ error: "Gagal mendapatkan data user" }, { status: 500 });
  }
} 