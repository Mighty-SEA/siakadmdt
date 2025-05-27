import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
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
    const { password: _, ...userSafe } = user;
    return NextResponse.json({ user: userSafe });
  } catch {
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
} 