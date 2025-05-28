import { prisma } from "@/lib/prisma";

/**
 * Membuat notifikasi untuk user tertentu
 */
export async function createNotification({
  title,
  message,
  type = "info",
  userId,
}: {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  userId: number;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
} 