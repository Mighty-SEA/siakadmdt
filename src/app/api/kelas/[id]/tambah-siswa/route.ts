import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { studentIds } = await request.json();

    // Validasi input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Daftar ID siswa tidak valid" },
        { status: 400 }
      );
    }

    // Validasi ID kelas
    const classroom = await prisma.classroom.findUnique({
      where: { id: parseInt(id) },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Konversi ID string ke number
    const studentIdsInt = studentIds.map((id: string) => parseInt(id));

    // Validasi siswa
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIdsInt },
        is_alumni: false,
      },
    });

    if (students.length !== studentIdsInt.length) {
      return NextResponse.json(
        { error: "Beberapa ID siswa tidak valid atau tidak ditemukan" },
        { status: 400 }
      );
    }

    // Cek apakah siswa sudah terdaftar di kelas ini
    const existingStudents = await prisma.studentClassHistory.findMany({
      where: {
        student_id: { in: studentIdsInt },
        classroom_id: parseInt(id),
        is_active: true,
      },
    });

    if (existingStudents.length > 0) {
      const existingIds = existingStudents.map((history) => history.student_id);
      const existingStudentNames = students
        .filter((student) => existingIds.includes(student.id))
        .map((student) => student.name)
        .join(", ");

      return NextResponse.json(
        {
          error: `Beberapa siswa sudah terdaftar di kelas ini: ${existingStudentNames}`,
        },
        { status: 400 }
      );
    }

    // Cek apakah siswa sudah terdaftar di kelas lain yang aktif
    const activeInOtherClasses = await prisma.studentClassHistory.findMany({
      where: {
        student_id: { in: studentIdsInt },
        is_active: true,
      },
      include: {
        student: true,
        classroom: {
          include: {
            classLevel: true,
            academicYear: true,
          },
        },
      },
    });

    if (activeInOtherClasses.length > 0) {
      // Nonaktifkan riwayat kelas lama
      await prisma.studentClassHistory.updateMany({
        where: {
          student_id: { in: studentIdsInt },
          is_active: true,
        },
        data: {
          is_active: false,
        },
      });
    }

    // Tambahkan siswa ke kelas
    const createdHistories = await Promise.all(
      studentIdsInt.map(async (studentId) => {
        return prisma.studentClassHistory.create({
          data: {
            student_id: studentId,
            classroom_id: parseInt(id),
            is_active: true,
          },
        });
      })
    );

    return NextResponse.json({
      message: `${studentIds.length} siswa berhasil ditambahkan ke kelas`,
      data: createdHistories,
    });
  } catch (error) {
    console.error("Error adding students to class:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan siswa ke kelas" },
      { status: 500 }
    );
  }
} 