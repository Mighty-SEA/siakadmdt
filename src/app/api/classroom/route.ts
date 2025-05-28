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
      const classroom = await prisma.classroom.findUnique({
        where: { id: Number(id) },
        include: { classLevel: true, academicYear: true, teacher: true },
      });
      if (!classroom) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
      return NextResponse.json({ classroom });
    } catch {
      return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
    }
  }
  try {
    const classrooms = await prisma.classroom.findMany({
      orderBy: { id: "asc" },
      include: { classLevel: true, academicYear: true, teacher: true },
    });
    return NextResponse.json({ data: classrooms });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = {
      class_level_id: Number(body.class_level_id),
      academic_year_id: Number(body.academic_year_id),
      teacher_id: body.teacher_id ? Number(body.teacher_id) : null,
    };
    const classroom = await prisma.classroom.create({ data });
    await sendNotificationToAdmins(
      "Kelas Ditambahkan",
      `Kelas baru berhasil ditambahkan (Tingkat: <b>${data.class_level_id}</b>, Tahun: <b>${data.academic_year_id}</b>)`,
      "success",
      req
    );
    return NextResponse.json({ classroom }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, class_level_id, academic_year_id, teacher_id } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const classroom = await prisma.classroom.update({
      where: { id: Number(id) },
      data: {
        class_level_id: Number(class_level_id),
        academic_year_id: Number(academic_year_id),
        teacher_id: teacher_id ? Number(teacher_id) : null,
      },
    });
    await sendNotificationToAdmins(
      "Kelas Diperbarui",
      `Kelas berhasil diperbarui (ID: <b>${id}</b>)`,
      "info",
      req
    );
    return NextResponse.json({ classroom });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const classroom = await prisma.classroom.findUnique({ where: { id: Number(id) }, include: { classLevel: true, academicYear: true, teacher: true } });
    await prisma.classroom.delete({ where: { id: Number(id) } });
    if (classroom) {
      await sendNotificationToAdmins(
        "Kelas Dihapus",
        `Kelas (Tingkat: <b>${classroom.classLevel?.name || '-'} </b>, Tahun: <b>${classroom.academicYear?.year || '-'} </b>) telah dihapus dari sistem`,
        "warning",
        req
      );
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 