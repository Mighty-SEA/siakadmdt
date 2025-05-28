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
        { error: "ID riwayat kelas diperlukan" },
        { status: 400 }
      );
    }

    const riwayatKelas = await prisma.studentClassHistory.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        student: true,
        classroom: {
          include: {
            classLevel: true,
            academicYear: true,
            teacher: true,
          },
        },
      },
    });

    if (!riwayatKelas) {
      return NextResponse.json(
        { error: "Riwayat kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: riwayatKelas });
  } catch (error) {
    console.error("Error fetching riwayat kelas detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail riwayat kelas" },
      { status: 500 }
    );
  }
} 