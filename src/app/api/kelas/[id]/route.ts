import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: "ID kelas diperlukan" },
        { status: 400 }
      );
    }

    const kelas = await prisma.classroom.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        classLevel: true,
        academicYear: true,
        teacher: true,
        studentClassHistories: {
          where: { is_active: true },
          include: { student: true },
        },
      },
    });

    if (!kelas) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: kelas });
  } catch (error) {
    console.error("Error fetching class detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail kelas" },
      { status: 500 }
    );
  }
} 