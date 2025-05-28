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
      const classLevel = await prisma.classLevel.findUnique({ where: { id: Number(id) } });
      if (!classLevel) return NextResponse.json({ error: "Tingkat kelas tidak ditemukan" }, { status: 404 });
      return NextResponse.json({ classLevel });
    } catch {
      return NextResponse.json({ error: "Gagal mengambil data tingkat kelas" }, { status: 500 });
    }
  }
  try {
    const classLevels = await prisma.classLevel.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ data: classLevels });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data tingkat kelas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = { name: body.name };
    const classLevel = await prisma.classLevel.create({ data });
    await sendNotificationToAdmins(
      "Tingkat Kelas Ditambahkan",
      `Tingkat kelas <b>${classLevel.name}</b> berhasil ditambahkan ke sistem`,
      "success",
      req
    );
    return NextResponse.json({ classLevel }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data tingkat kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const classLevel = await prisma.classLevel.update({ where: { id: Number(id) }, data: { name } });
    await sendNotificationToAdmins(
      "Tingkat Kelas Diperbarui",
      `Tingkat kelas <b>${classLevel.name}</b> berhasil diperbarui`,
      "info",
      req
    );
    return NextResponse.json({ classLevel });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data tingkat kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const classLevel = await prisma.classLevel.findUnique({ where: { id: Number(id) } });
    await prisma.classLevel.delete({ where: { id: Number(id) } });
    if (classLevel) {
      await sendNotificationToAdmins(
        "Tingkat Kelas Dihapus",
        `Tingkat kelas <b>${classLevel.name}</b> telah dihapus dari sistem`,
        "warning",
        req
      );
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data tingkat kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 