import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  try {
    if (id) {
      const kelas = await prisma.classroom.findUnique({
        where: { id: Number(id) },
        include: { 
          classLevel: true, 
          academicYear: true, 
          teacher: true,
          studentClassHistories: {
            include: {
              student: true
            },
            where: {
              is_active: true
            }
          }
        },
      });
      
      if (!kelas) {
        return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
      }
      
      return NextResponse.json({ kelas });
    }
    
    const kelas = await prisma.classroom.findMany({
      orderBy: [
        { academic_year_id: "desc" },
        { class_level_id: "asc" }
      ],
      include: { 
        classLevel: true, 
        academicYear: true, 
        teacher: true,
        studentClassHistories: {
          where: {
            is_active: true
          }
        }
      },
    });
    
    return NextResponse.json({ data: kelas });
  } catch (error) {
    console.error("Error fetching classroom data:", error);
    return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validasi data
    if (!body.class_level_id) {
      return NextResponse.json({ error: "Tingkat kelas harus diisi" }, { status: 400 });
    }
    
    if (!body.academic_year_id) {
      return NextResponse.json({ error: "Tahun ajaran harus diisi" }, { status: 400 });
    }
    
    // Periksa apakah kelas dengan kombinasi yang sama sudah ada
    const existingClass = await prisma.classroom.findFirst({
      where: {
        class_level_id: Number(body.class_level_id),
        academic_year_id: Number(body.academic_year_id)
      }
    });
    
    if (existingClass) {
      return NextResponse.json({ 
        error: "Kelas dengan tingkat dan tahun ajaran yang sama sudah ada" 
      }, { status: 400 });
    }
    
    const data = {
      class_level_id: Number(body.class_level_id),
      academic_year_id: Number(body.academic_year_id),
      teacher_id: body.teacher_id ? Number(body.teacher_id) : null,
    };
    
    const kelas = await prisma.classroom.create({ 
      data,
      include: {
        classLevel: true,
        academicYear: true,
        teacher: true
      }
    });
    
    // Ambil data lengkap untuk notifikasi
    const classLevel = await prisma.classLevel.findUnique({
      where: { id: Number(body.class_level_id) }
    });
    
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: Number(body.academic_year_id) }
    });
    
    let teacherInfo = "";
    if (body.teacher_id) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: Number(body.teacher_id) }
      });
      if (teacher) {
        teacherInfo = ` dengan wali kelas <b>${teacher.name}</b>`;
      }
    }
    
    // Kirim notifikasi
    await sendNotificationToAdmins(
      "Kelas Baru Ditambahkan",
      `Kelas <b>${classLevel?.name || ''}</b> tahun ajaran <b>${academicYear?.year || ''}</b>${teacherInfo} telah berhasil ditambahkan ke sistem`,
      "success",
      req
    );
    
    return NextResponse.json({ kelas }, { status: 201 });
  } catch (e: unknown) {
    console.error("Error creating classroom:", e);
    const errorMsg = typeof e === "object" && e && "message" in e 
      ? (e as Record<string, unknown>).message 
      : "Gagal menyimpan data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, class_level_id, academic_year_id, teacher_id } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }
    
    // Validasi data
    if (!class_level_id) {
      return NextResponse.json({ error: "Tingkat kelas harus diisi" }, { status: 400 });
    }
    
    if (!academic_year_id) {
      return NextResponse.json({ error: "Tahun ajaran harus diisi" }, { status: 400 });
    }
    
    // Periksa apakah kelas dengan kombinasi yang sama sudah ada (kecuali kelas ini sendiri)
    const existingClass = await prisma.classroom.findFirst({
      where: {
        class_level_id: Number(class_level_id),
        academic_year_id: Number(academic_year_id),
        id: { not: Number(id) }
      }
    });
    
    if (existingClass) {
      return NextResponse.json({ 
        error: "Kelas dengan tingkat dan tahun ajaran yang sama sudah ada" 
      }, { status: 400 });
    }
    
    // Ambil data kelas sebelum diupdate
    const oldClass = await prisma.classroom.findUnique({
      where: { id: Number(id) },
      include: {
        classLevel: true,
        academicYear: true,
        teacher: true
      }
    });
    
    if (!oldClass) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }
    
    const kelas = await prisma.classroom.update({
      where: { id: Number(id) },
      data: {
        class_level_id: Number(class_level_id),
        academic_year_id: Number(academic_year_id),
        teacher_id: teacher_id ? Number(teacher_id) : null,
      },
      include: {
        classLevel: true,
        academicYear: true,
        teacher: true
      }
    });
    
    // Ambil data lengkap untuk notifikasi
    const classLevel = await prisma.classLevel.findUnique({
      where: { id: Number(class_level_id) }
    });
    
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: Number(academic_year_id) }
    });
    
    let teacherInfo = "";
    if (teacher_id) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: Number(teacher_id) }
      });
      if (teacher) {
        teacherInfo = ` dengan wali kelas <b>${teacher.name}</b>`;
      }
    }
    
    // Kirim notifikasi
    await sendNotificationToAdmins(
      "Kelas Diperbarui",
      `Kelas <b>${classLevel?.name || ''}</b> tahun ajaran <b>${academicYear?.year || ''}</b>${teacherInfo} telah berhasil diperbarui`,
      "info",
      req
    );
    
    return NextResponse.json({ kelas });
  } catch (e: unknown) {
    console.error("Error updating classroom:", e);
    const errorMsg = typeof e === "object" && e && "message" in e 
      ? (e as Record<string, unknown>).message 
      : "Gagal mengupdate data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }
    
    // Periksa apakah kelas memiliki siswa yang aktif
    const classWithStudents = await prisma.classroom.findUnique({
      where: { id: Number(id) },
      include: {
        classLevel: true,
        academicYear: true,
        teacher: true,
        studentClassHistories: {
          where: { is_active: true }
        }
      }
    });
    
    if (!classWithStudents) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }
    
    if (classWithStudents.studentClassHistories.length) {
      return NextResponse.json({ 
        error: "Tidak dapat menghapus kelas yang memiliki siswa aktif" 
      }, { status: 400 });
    }
    
    await prisma.classroom.delete({ where: { id: Number(id) } });
    
    // Kirim notifikasi
    await sendNotificationToAdmins(
      "Kelas Dihapus",
      `Kelas <b>${classWithStudents.classLevel?.name || ''}</b> tahun ajaran <b>${classWithStudents.academicYear?.year || ''}</b> telah dihapus dari sistem`,
      "warning",
      req
    );
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("Error deleting classroom:", e);
    const errorMsg = typeof e === "object" && e && "message" in e 
      ? (e as Record<string, unknown>).message 
      : "Gagal menghapus data kelas";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 