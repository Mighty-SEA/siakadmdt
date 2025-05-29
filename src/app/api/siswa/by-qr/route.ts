import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qr_token = searchParams.get("qr_token");
  if (!qr_token) {
    return NextResponse.json({ error: "qr_token diperlukan" }, { status: 400 });
  }
  const siswa = await prisma.student.findUnique({
    where: { qr_token },
    select: { id: true, name: true, nis: true, qr_token: true },
  });
  if (!siswa) {
    return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ siswa });
} 