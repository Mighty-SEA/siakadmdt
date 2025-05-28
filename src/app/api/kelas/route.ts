import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    try {
      const kelas = await prisma.classroom.findUnique({
        where: { id: Number(id) },
        include: { classLevel: true, academicYear: true, teacher: true },
      });
      if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
      return NextResponse.json({ kelas });
    } catch {
      return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
    }
  }
  try {
    const kelas = await prisma.classroom.findMany({
      orderBy: { id: "asc" },
      include: { classLevel: true, academicYear: true, teacher: true },
    });
    return NextResponse.json({ kelas });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = {
      class_level_id: Number(body.class_level_id),
      academic_year_id: Number(body.academic_year_id),
      teacher_id: body.teacher_id ? Number(body.teacher_id) : null,
    };
    const kelas = await prisma.classroom.create({ data });
    return NextResponse.json({ kelas }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, class_level_id, academic_year_id, teacher_id } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const kelas = await prisma.classroom.update({
      where: { id: Number(id) },
      data: {
        class_level_id: Number(class_level_id),
        academic_year_id: Number(academic_year_id),
        teacher_id: teacher_id ? Number(teacher_id) : null,
      },
    });
    return NextResponse.json({ kelas });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    await prisma.classroom.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 