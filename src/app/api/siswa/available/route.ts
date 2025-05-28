import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "Parameter classId diperlukan" },
        { status: 400 }
      );
    }

    // Validasi ID kelas
    const classroom = await prisma.classroom.findUnique({
      where: { id: parseInt(classId) },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Dapatkan ID siswa yang sudah ada di kelas ini
    const existingStudentIds = await prisma.studentClassHistory.findMany({
      where: {
        classroom_id: parseInt(classId),
        is_active: true,
      },
      select: {
        student_id: true,
      },
    });

    const existingIds = existingStudentIds.map((item) => item.student_id);

    // Dapatkan siswa yang belum terdaftar di kelas ini
    // dan bukan alumni
    const availableStudents = await prisma.student.findMany({
      where: {
        id: {
          notIn: existingIds.length > 0 ? existingIds : [-1], // Jika tidak ada siswa, gunakan ID dummy
        },
        is_alumni: false,
      },
      select: {
        id: true,
        name: true,
        nis: true,
        gender: true,
        is_alumni: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      data: availableStudents.map((student) => ({
        ...student,
        id: student.id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching available students:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data siswa yang tersedia" },
      { status: 500 }
    );
  }
} 