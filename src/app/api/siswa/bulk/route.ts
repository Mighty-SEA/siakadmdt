import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";

// Interface untuk data siswa
interface Student {
  id: number;
  name: string;
  nis: string;
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

// Endpoint untuk bulk delete siswa
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ID siswa diperlukan" }, { status: 400 });
    }
    
    // Ambil data siswa sebelum dihapus untuk notifikasi
    const siswaList = await prisma.student.findMany({
      where: { id: { in: ids.map(Number) } },
      select: { id: true, name: true, nis: true }
    }) as Student[];
    
    if (siswaList.length === 0) {
      return NextResponse.json({ error: "Tidak ada siswa yang ditemukan" }, { status: 404 });
    }
    
    // Hapus siswa secara batch
    try {
      await prisma.student.deleteMany({
        where: { id: { in: ids.map(Number) } }
      });
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === 'P2003' || (typeof err.message === 'string' && err.message.includes('Foreign key constraint'))) {
        return NextResponse.json({ error: "Data ini tidak bisa dihapus" }, { status: 400 });
      }
      throw e;
    }
    
    // Buat daftar siswa untuk notifikasi
    let siswaListHtml = "";
    if (siswaList.length > 0) {
      siswaListHtml = "<ul>";
      siswaList.forEach((siswa: Student) => {
        siswaListHtml += `<li><b>${siswa.name}</b> (${siswa.nis})</li>`;
      });
      siswaListHtml += "</ul>";
    }
    
    // Buat notifikasi untuk hapus siswa massal
    await sendNotificationToAdmins(
      "Siswa Dihapus Massal",
      `${siswaList.length} siswa telah dihapus dari sistem:${siswaListHtml}`,
      "warning",
      req
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `${siswaList.length} siswa berhasil dihapus`,
      deletedCount: siswaList.length
    });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data siswa";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// Endpoint untuk bulk update siswa
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { ids, data } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ID siswa diperlukan" }, { status: 400 });
    }
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: "Data update diperlukan" }, { status: 400 });
    }
    
    // Ambil data siswa sebelum diupdate untuk notifikasi
    const siswaList = await prisma.student.findMany({
      where: { id: { in: ids.map(Number) } },
      select: { id: true, name: true, nis: true }
    }) as Student[];
    
    if (siswaList.length === 0) {
      return NextResponse.json({ error: "Tidak ada siswa yang ditemukan" }, { status: 404 });
    }
    
    // Persiapkan data untuk update
    const updateData = { ...data };
    
    // Jika ada tanggal lahir, konversi ke Date
    if (updateData.birth_date) {
      updateData.birth_date = new Date(updateData.birth_date);
    }
    
    // Update siswa secara batch
    await prisma.student.updateMany({
      where: { id: { in: ids.map(Number) } },
      data: updateData
    });
    
    // Buat daftar siswa untuk notifikasi
    let siswaListHtml = "";
    if (siswaList.length > 0) {
      siswaListHtml = "<ul>";
      siswaList.forEach((siswa: Student) => {
        siswaListHtml += `<li><b>${siswa.name}</b> (${siswa.nis})</li>`;
      });
      siswaListHtml += "</ul>";
    }
    
    // Buat pesan notifikasi berdasarkan jenis update
    let notificationTitle = "Siswa Diperbarui Massal";
    let notificationMessage = `${siswaList.length} siswa telah diperbarui:${siswaListHtml}`;
    let notificationType: "success" | "info" | "warning" = "info";
    
    // Jika update status alumni, buat pesan khusus
    if ('is_alumni' in updateData) {
      const statusText = updateData.is_alumni ? "lulus (alumni)" : "aktif";
      notificationTitle = `Status Siswa Diubah Massal`;
      notificationMessage = `${siswaList.length} siswa telah diubah statusnya menjadi ${statusText}:${siswaListHtml}`;
      notificationType = "info";
    }
    
    // Buat notifikasi untuk update siswa massal
    await sendNotificationToAdmins(
      notificationTitle,
      notificationMessage,
      notificationType,
      req
    );
    
    return NextResponse.json({ 
      success: true, 
      message: notificationMessage.split(':')[0], // Hanya ambil bagian pertama tanpa daftar siswa
      updatedCount: siswaList.length
    });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data siswa";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 