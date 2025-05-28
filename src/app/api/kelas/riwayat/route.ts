import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const riwayatKelas = await prisma.studentClassHistory.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
        classroom: {
          include: {
            classLevel: true,
            academicYear: true,
          },
        },
      },
      orderBy: [
        { is_active: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return NextResponse.json({ data: riwayatKelas });
  } catch (error) {
    console.error("Error fetching riwayat kelas:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data riwayat kelas" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID riwayat kelas diperlukan" },
        { status: 400 }
      );
    }

    const riwayatKelas = await prisma.studentClassHistory.findUnique({
      where: { id: parseInt(id) },
    });

    if (!riwayatKelas) {
      return NextResponse.json(
        { error: "Riwayat kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.studentClassHistory.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Riwayat kelas berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting riwayat kelas:", error);
    return NextResponse.json(
      { error: "Gagal menghapus riwayat kelas" },
      { status: 500 }
    );
  }
} 