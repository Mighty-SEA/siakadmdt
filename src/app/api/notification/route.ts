import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Ambil notifikasi user yang login
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit") as string) : undefined;
    const onlyUnread = url.searchParams.get("onlyUnread") === "true";
    
    // Dapatkan user ID dari cookie jika tidak ada di query params
    if (!userId) {
      const cookieStore = await cookies();
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
      
      const whereClause: any = { userId: user.id };
      
      if (onlyUnread) {
        whereClause.isRead = false;
      }
      
      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: limit,
      });
      
      const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      });
      
      return NextResponse.json({ notifications, unreadCount });
    } else {
      const whereClause: any = { userId: parseInt(userId) };
      
      if (onlyUnread) {
        whereClause.isRead = false;
      }
      
      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: limit,
      });
      
      const unreadCount = await prisma.notification.count({
        where: { userId: parseInt(userId), isRead: false },
      });
      
      return NextResponse.json({ notifications, unreadCount });
    }
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Membuat notifikasi baru
export async function POST(req: Request) {
  try {
    const { title, message, userId, type = "info" } = await req.json();
    
    if (!title || !message || !userId) {
      return NextResponse.json(
        { error: "Title, message, and userId are required" },
        { status: 400 }
      );
    }
    
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: parseInt(userId),
      },
    });
    
    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// Menandai notifikasi sebagai sudah dibaca
export async function PATCH(req: Request) {
  try {
    const { id, isRead = true } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }
    
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead },
    });
    
    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// Menghapus notifikasi
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }
    
    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
} 