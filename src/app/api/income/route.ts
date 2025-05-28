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
    // Get by id
    const data = await prisma.income.findUnique({ where: { id: Number(id) } });
    if (!data) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  }
  // List all
  const data = await prisma.income.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.date || !body.description || !body.amount) {
      return NextResponse.json({ error: "Field wajib diisi" }, { status: 400 });
    }
    const created = await prisma.income.create({
      data: {
        date: new Date(body.date),
        description: body.description,
        amount: Number(body.amount),
        category: body.category || null,
      },
    });
    await sendNotificationToAdmins(
      "Pemasukan Ditambahkan",
      `Pemasukan <b>${created.description}</b> sebesar <b>Rp${created.amount.toLocaleString('id-ID')}</b> berhasil ditambahkan ke sistem`,
      "success",
      req
    );
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: "Gagal menambah data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });
  try {
    const body = await req.json();
    const updated = await prisma.income.update({
      where: { id: Number(id) },
      data: {
        date: new Date(body.date),
        description: body.description,
        amount: Number(body.amount),
        category: body.category || null,
      },
    });
    await sendNotificationToAdmins(
      "Pemasukan Diupdate",
      `Pemasukan <b>${updated.description}</b> sebesar <b>Rp${updated.amount.toLocaleString('id-ID')}</b> berhasil diupdate`,
      "info",
      req
    );
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    if (id) {
      const deleted = await prisma.income.delete({ where: { id: Number(id) } });
      await sendNotificationToAdmins(
        "Pemasukan Dihapus",
        `Pemasukan <b>${deleted.description}</b> sebesar <b>Rp${deleted.amount.toLocaleString('id-ID')}</b> berhasil dihapus`,
        "warning",
        req
      );
      return NextResponse.json({ success: true });
    }
    // Bulk delete
    const body = await req.json();
    if (Array.isArray(body.ids)) {
      await prisma.income.deleteMany({ where: { id: { in: body.ids.map(Number) } } });
      await sendNotificationToAdmins(
        "Pemasukan Dihapus (Bulk)",
        `Beberapa data pemasukan berhasil dihapus (total: ${body.ids.length})`,
        "warning",
        req
      );
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
} 