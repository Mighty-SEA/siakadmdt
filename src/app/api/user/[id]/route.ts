import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id);
    
    if (isNaN(numId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: numId },
      include: { role: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    
    // Jangan return password
    const { password: _, ...userSafe } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    
    // Tambahkan header cache-control untuk mencegah caching
    const response = NextResponse.json({ user: userSafe });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error mendapatkan user:", error);
    return NextResponse.json({ error: "Gagal mendapatkan data user" }, { status: 500 });
  }
} 