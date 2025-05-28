import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";

// Helper untuk dapatkan semua admin
async function getAdminUsers() {
  try {
    const admins = await prisma.user.findMany({ where: { roleId: 1 }, select: { id: true } });
    return admins.map((admin: { id: number }) => admin.id);
  } catch (error) {
    console.error("Gagal mendapatkan admin:", error);
    return [];
  }
}

// Helper untuk kirim notifikasi ke semua admin
async function sendNotificationToAdmins(
  title: string,
  message: string,
  type: "success" | "error" | "info" | "warning",
  request?: Request
) {
  const adminIds = await getAdminUsers();
  let userInfo = "";
  if (request) {
    try {
      const authHeader = request.headers.get("x-user-data");
      if (authHeader) {
        const userData = JSON.parse(authHeader);
        if (userData && userData.name) {
          userInfo = ` oleh <b>${userData.name}</b>`;
        }
      }
    } catch (error) {
      console.error("Gagal parsing user data dari header:", error);
    }
  }
  const finalMessage = `${message}${userInfo}`;
  for (const userId of adminIds) {
    await createNotification({ title, message: finalMessage, type, userId });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    try {
      const academicYear = await prisma.academicYear.findUnique({
        where: { id: Number(id) },
      });
      if (!academicYear) return NextResponse.json({ error: "Tahun akademik tidak ditemukan" }, { status: 404 });
      return NextResponse.json({ academicYear });
    } catch {
      return NextResponse.json({ error: "Gagal mengambil data tahun akademik" }, { status: 500 });
    }
  }
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ data: academicYears });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data tahun akademik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = {
      year: body.year,
      is_active: !!body.is_active,
    };
    // Jika is_active true, nonaktifkan tahun lain
    if (data.is_active) {
      await prisma.academicYear.updateMany({ data: { is_active: false } });
    }
    const academicYear = await prisma.academicYear.create({ data });
    // Notifikasi admin
    await sendNotificationToAdmins(
      "Tahun Akademik Ditambahkan",
      `Tahun akademik <b>${academicYear.year}</b> berhasil ditambahkan ke sistem`,
      "success",
      req
    );
    return NextResponse.json({ academicYear }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data tahun akademik";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, year, is_active } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    // Jika is_active true, nonaktifkan tahun lain
    if (is_active) {
      await prisma.academicYear.updateMany({ data: { is_active: false } });
    }
    const academicYear = await prisma.academicYear.update({
      where: { id: Number(id) },
      data: { year, is_active: !!is_active },
    });
    // Notifikasi admin
    await sendNotificationToAdmins(
      "Tahun Akademik Diperbarui",
      `Tahun akademik <b>${academicYear.year}</b> berhasil diperbarui`,
      "info",
      req
    );
    return NextResponse.json({ academicYear });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data tahun akademik";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    // Ambil data sebelum dihapus untuk notifikasi
    const academicYear = await prisma.academicYear.findUnique({ where: { id: Number(id) } });
    await prisma.academicYear.delete({ where: { id: Number(id) } });
    // Notifikasi admin
    if (academicYear) {
      await sendNotificationToAdmins(
        "Tahun Akademik Dihapus",
        `Tahun akademik <b>${academicYear.year}</b> telah dihapus dari sistem`,
        "warning",
        req
      );
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data tahun akademik";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 