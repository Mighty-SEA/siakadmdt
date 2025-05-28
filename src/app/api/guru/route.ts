import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    try {
      const guru = await prisma.teacher.findUnique({ where: { id: Number(id) } });
      if (!guru) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });
      return NextResponse.json({ guru });
    } catch {
      return NextResponse.json({ error: "Gagal mengambil data guru" }, { status: 500 });
    }
  }
  try {
    const guru = await prisma.teacher.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ data: guru });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data guru" }, { status: 500 });
  }
}

// Fungsi helper untuk mendapatkan semua admin
async function getAdminUsers(): Promise<number[]> {
  try {
    const admins = await prisma.user.findMany({
      where: { roleId: 1 },
      select: { id: true },
    });
    return admins.map((admin: { id: number }) => admin.id);
  } catch (error) {
    console.error("Gagal mendapatkan admin:", error);
    return [];
  }
}

// Fungsi untuk mengirim notifikasi ke semua admin dengan informasi user
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
    await createNotification({
      title,
      message: finalMessage,
      type,
      userId,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = {
      name: body.name,
      nip: body.nip === undefined || body.nip === "" ? null : body.nip,
      gender: body.gender === undefined || body.gender === "" ? null : body.gender,
    };
    const guru = await prisma.teacher.create({ data });
    // Notifikasi admin
    await sendNotificationToAdmins(
      "Guru Baru Ditambahkan",
      `Guru baru bernama <b>${guru.name}</b>${guru.nip ? ` dengan NIP <b>${guru.nip}</b>` : ""} telah berhasil ditambahkan ke sistem`,
      "success",
      req
    );
    return NextResponse.json({ guru }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data guru";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, nip, gender } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    // Ambil data guru sebelum update
    const oldData = await prisma.teacher.findUnique({ where: { id: Number(id) } });
    if (!oldData) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });
    const guru = await prisma.teacher.update({
      where: { id: Number(id) },
      data: {
        name,
        nip: nip === undefined || nip === "" ? null : nip,
        gender: gender === undefined || gender === "" ? null : gender,
      },
    });
    // Notifikasi admin
    await sendNotificationToAdmins(
      "Data Guru Diperbarui",
      `Data guru <b>${guru.name}</b>${guru.nip ? ` dengan NIP <b>${guru.nip}</b>` : ""} telah berhasil diperbarui`,
      "info",
      req
    );
    return NextResponse.json({ guru });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data guru";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    // Ambil data guru sebelum dihapus
    const guru = await prisma.teacher.findUnique({ where: { id: Number(id) } });
    if (!guru) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });
    await prisma.teacher.delete({ where: { id: Number(id) } });
    // Notifikasi admin
    await sendNotificationToAdmins(
      "Guru Dihapus",
      `Guru <b>${guru.name}</b>${guru.nip ? ` dengan NIP <b>${guru.nip}</b>` : ""} telah dihapus dari sistem`,
      "warning",
      req
    );
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data guru";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 