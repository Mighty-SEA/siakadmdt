import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "ID riwayat kelas diperlukan" },
        { status: 400 }
      );
    }

    const { is_active } = await request.json();

    if (is_active === undefined) {
      return NextResponse.json(
        { error: "Status aktif diperlukan" },
        { status: 400 }
      );
    }

    // Jika mengaktifkan riwayat, nonaktifkan semua riwayat lain untuk siswa yang sama
    if (is_active) {
      // Cari riwayat kelas yang akan diaktifkan untuk mendapatkan ID siswa
      const targetRiwayat = await prisma.studentClassHistory.findUnique({
        where: { id: parseInt(id) },
        select: { student_id: true },
      });

      if (!targetRiwayat) {
        return NextResponse.json(
          { error: "Riwayat kelas tidak ditemukan" },
          { status: 404 }
        );
      }

      // Nonaktifkan semua riwayat kelas aktif untuk siswa tersebut
      await prisma.studentClassHistory.updateMany({
        where: {
          student_id: targetRiwayat.student_id,
          is_active: true,
        },
        data: {
          is_active: false,
        },
      });
    }

    // Update status riwayat kelas yang dipilih
    const updatedRiwayat = await prisma.studentClassHistory.update({
      where: { id: parseInt(id) },
      data: { is_active },
    });

    return NextResponse.json({
      message: is_active
        ? "Riwayat kelas berhasil diaktifkan"
        : "Riwayat kelas berhasil dinonaktifkan",
      data: updatedRiwayat,
    });
  } catch (error) {
    console.error("Error updating riwayat kelas status:", error);
    return NextResponse.json(
      { error: "Gagal mengubah status riwayat kelas" },
      { status: 500 }
    );
  }
} 