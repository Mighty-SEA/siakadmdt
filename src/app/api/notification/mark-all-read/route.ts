import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Menandai semua notifikasi sebagai sudah dibaca
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    // Jika tidak ada userId yang diberikan, ambil dari cookie
    let userIdToUse = userId;
    
    if (!userIdToUse) {
      const cookieStore = cookies();
      const userCookie = cookieStore.get("user");
      
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
      
      userIdToUse = user.id;
    }
    
    // Update semua notifikasi yang belum dibaca
    await prisma.notification.updateMany({
      where: {
        userId: parseInt(userIdToUse),
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
} 