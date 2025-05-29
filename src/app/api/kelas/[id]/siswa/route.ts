import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type StudentHistoryWithStudent = {
  id: number;
  student_id: number;
  classroom_id: number;
  is_active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  student: {
    id: number;
    name: string;
    nis: string;
    gender: string | null;
    is_alumni: boolean | null;
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Filter
    const search = searchParams.get("search") || "";
    const gender = searchParams.get("gender") || "all";
    
    // Validasi ID kelas
    const classroom = await prisma.classroom.findUnique({
      where: { id: parseInt(id) },
      include: {
        classLevel: true,
        academicYear: true,
        teacher: true,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Build filter conditions
    const whereConditions: Prisma.StudentClassHistoryWhereInput = {
      classroom_id: parseInt(id),
      is_active: true,
    };

    // Build student filter
    const studentWhereConditions: Prisma.StudentWhereInput = {};
    
    if (gender !== "all") {
      studentWhereConditions.gender = gender;
    }
    
    if (search) {
      studentWhereConditions.OR = [
        { name: { contains: search } },
        { nis: { contains: search } },
      ];
    }

    // Count total students
    const totalStudents = await prisma.studentClassHistory.count({
      where: {
        ...whereConditions,
        student: studentWhereConditions,
      },
    });

    // Get students with pagination
    const studentHistories = await prisma.studentClassHistory.findMany({
      where: {
        ...whereConditions,
        student: studentWhereConditions,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nis: true,
            gender: true,
            is_alumni: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { student: { name: "asc" } },
    });

    // Map to expected format
    const students = studentHistories.map((history: StudentHistoryWithStudent) => ({
      ...history.student,
      studentClassHistoryId: history.id.toString(),
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalStudents / limit);

    return NextResponse.json({
      data: students,
      meta: {
        page,
        limit,
        totalStudents,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
} 