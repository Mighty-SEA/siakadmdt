import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";

export async function GET() {
  try {
    const siswa = await prisma.student.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ siswa });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data siswa" }, { status: 500 });
  }
}

// Fungsi helper untuk mendapatkan semua admin
async function getAdminUsers(): Promise<number[]> {
  try {
    // Dapatkan semua user dengan role admin (roleId = 1 asumsinya admin)
    const admins = await prisma.user.findMany({
      where: {
        roleId: 1,
      },
      select: {
        id: true,
      },
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
  
  // Coba dapatkan informasi user dari request headers jika ada
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
  
  // Tambahkan informasi user ke pesan
  const finalMessage = `${message}${userInfo}`;
  
  // Kirim notifikasi ke semua admin
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
      nis: body.nis,
      gender: body.gender,
      is_alumni: body.is_alumni === undefined || body.is_alumni === "" ? null : (body.is_alumni === true || body.is_alumni === "true"),
      nik: body.nik === undefined || body.nik === "" ? null : body.nik,
      kk: body.kk === undefined || body.kk === "" ? null : body.kk,
      father_name: body.father_name === undefined || body.father_name === "" ? null : body.father_name,
      mother_name: body.mother_name === undefined || body.mother_name === "" ? null : body.mother_name,
      father_job: body.father_job === undefined || body.father_job === "" ? null : body.father_job,
      mother_job: body.mother_job === undefined || body.mother_job === "" ? null : body.mother_job,
      origin_school: body.origin_school === undefined || body.origin_school === "" ? null : body.origin_school,
      nisn: body.nisn === undefined || body.nisn === "" ? null : body.nisn,
      birth_place: body.birth_place === undefined || body.birth_place === "" ? null : body.birth_place,
      qr_token: body.qr_token === undefined || body.qr_token === "" ? null : body.qr_token,
      birth_date: body.birth_date === undefined || body.birth_date === "" ? null : new Date(body.birth_date),
    };
    console.log("DATA YANG DIKIRIM:", data);
    const siswa = await prisma.student.create({ data });
    
    // Buat notifikasi untuk penambahan siswa
    await sendNotificationToAdmins(
      "Siswa Baru Ditambahkan",
      `Siswa baru bernama <b>${siswa.name}</b> dengan NIS <b>${siswa.nis}</b> telah berhasil ditambahkan ke sistem`,
      "success",
      req
    );
    
    return NextResponse.json({ siswa }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data siswa";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    
    // Ambil data siswa sebelum diupdate untuk notifikasi
    const oldData = await prisma.student.findUnique({
      where: { id: Number(id) }
    });
    
    if (!oldData) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }
    
    const data = {
      ...updateData,
      birth_date: updateData.birth_date ? new Date(updateData.birth_date) : null,
    };
    
    const siswa = await prisma.student.update({
      where: { id: Number(id) },
      data,
    });
    
    // Buat notifikasi untuk edit siswa
    await sendNotificationToAdmins(
      "Data Siswa Diperbarui",
      `Data siswa <b>${siswa.name}</b> dengan NIS <b>${siswa.nis}</b> telah berhasil diperbarui`,
      "info",
      req
    );
    
    return NextResponse.json({ siswa });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data siswa";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    
    // Ambil data siswa sebelum dihapus untuk notifikasi
    const siswa = await prisma.student.findUnique({
      where: { id: Number(id) }
    });
    
    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }
    
    // Simpan nama dan NIS siswa untuk notifikasi
    const nama = siswa.name;
    const nis = siswa.nis;
    
    await prisma.student.delete({ where: { id: Number(id) } });
    
    // Buat notifikasi untuk hapus siswa
    await sendNotificationToAdmins(
      "Siswa Dihapus",
      `Siswa <b>${nama}</b> dengan NIS <b>${nis}</b> telah dihapus dari sistem`,
      "warning",
      req
    );
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data siswa";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 