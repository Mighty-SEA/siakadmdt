import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { ids } = body;
    if (!ids || !Array.isArray(ids)) return NextResponse.json({ error: "IDs diperlukan" }, { status: 400 });
    await prisma.classroom.deleteMany({ where: { id: { in: ids.map(Number) } } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 