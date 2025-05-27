import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const siswa = await prisma.student.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ siswa });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data siswa" }, { status: 500 });
  }
} 