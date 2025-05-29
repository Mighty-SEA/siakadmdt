import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { historyIds } = await request.json();

    // Validasi input
    if (!historyIds || !Array.isArray(historyIds) || historyIds.length === 0) {
      return NextResponse.json(
        { error: "Daftar ID riwayat siswa tidak valid" },
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
    const historyIdsInt = historyIds.map((id: string) => parseInt(id));

    // Validasi riwayat kelas
    const histories = await prisma.studentClassHistory.findMany({
      where: {
        id: { in: historyIdsInt },
        classroom_id: parseInt(id),
        is_active: true,
      },
    });

    if (histories.length !== historyIdsInt.length) {
      return NextResponse.json(
        { error: "Beberapa ID riwayat kelas tidak valid atau tidak ditemukan" },
        { status: 400 }
      );
    }

    // Update status siswa menjadi tidak aktif di kelas
    await prisma.studentClassHistory.updateMany({
      where: {
        id: { in: historyIdsInt },
        classroom_id: parseInt(id),
        is_active: true,
      },
      data: {
        is_active: false,
      },
    });

    return NextResponse.json({
      message: `${historyIds.length} siswa berhasil dikeluarkan dari kelas`,
    });
  } catch (error) {
    console.error("Error removing students from class:", error);
    return NextResponse.json(
      { error: "Gagal mengeluarkan siswa dari kelas" },
      { status: 500 }
    );
  }
} 