import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Menandai semua notifikasi sebagai sudah dibaca
export async function POST() {
  try {
    // Dapatkan user ID dari cookie
    const cookieStore = await cookies();
    const userCookie = await cookieStore.get("user");
    
    if (!userCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = JSON.parse(userCookie.value);
    
    if (!user.id) {
      return NextResponse.json(
        { error: "Invalid user data" },
        { status: 401 }
      );
    }
    
    // Update semua notifikasi yang belum dibaca menjadi dibaca
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    
    // Buat respons dengan header anti-caching
    const response = NextResponse.json({ 
      success: true, 
      message: "All notifications marked as read",
      unreadCount: 0,
      timestamp: Date.now()
    });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
} 