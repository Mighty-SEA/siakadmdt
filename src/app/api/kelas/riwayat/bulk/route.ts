import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs riwayat kelas diperlukan" },
        { status: 400 }
      );
    }

    // Konversi string ID ke integer
    const numericIds = ids.map((id: string) => parseInt(id));

    // Hapus semua riwayat kelas dengan ID yang diberikan
    await prisma.studentClassHistory.deleteMany({
      where: {
        id: {
          in: numericIds,
        },
      },
    });

    return NextResponse.json({ message: `${ids.length} riwayat kelas berhasil dihapus` });
  } catch (error) {
    console.error("Error deleting multiple riwayat kelas:", error);
    return NextResponse.json(
      { error: "Gagal menghapus riwayat kelas" },
      { status: 500 }
    );
  }
} 