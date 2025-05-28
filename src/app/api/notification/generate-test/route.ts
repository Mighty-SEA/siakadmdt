import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Array judul notifikasi dummy
const dummyTitles = [
  "Pengumuman Penting",
  "Jadwal Rapat",
  "Perubahan Kurikulum",
  "Pembayaran SPP",
  "Ujian Tengah Semester",
  "Acara Sekolah",
  "Libur Nasional",
  "Tugas Baru",
  "Pemberitahuan Absensi",
  "Penilaian Siswa"
];

// Array isi pesan notifikasi dummy
const dummyMessages = [
  "Ada pengumuman penting dari kepala sekolah. Mohon untuk segera membaca dan menindaklanjuti pengumuman ini.",
  "Akan diadakan rapat pada hari Senin, 12 Juni 2023 pukul 09:00 WIB di ruang rapat utama. Mohon kehadirannya.",
  "Perubahan kurikulum akan diterapkan mulai semester depan. Silakan persiapkan materi sesuai kurikulum baru.",
  "Pembayaran SPP untuk bulan ini harap segera dilunasi sebelum tanggal 10.",
  "Ujian tengah semester akan dilaksanakan pada tanggal 15-20 Juni 2023. Mohon persiapkan dengan baik.",
  "Akan diadakan acara peringatan hari pendidikan nasional pada tanggal 2 Mei 2023. Semua siswa wajib hadir.",
  "Libur nasional pada tanggal 1 Juni 2023 dalam rangka peringatan Pancasila. Sekolah diliburkan.",
  "Ada tugas baru untuk mata pelajaran Matematika, silakan cek di halaman tugas.",
  "Siswa dengan NIS 123456 telah absen selama 3 hari berturut-turut tanpa keterangan.",
  "Nilai ujian akhir semester telah diinput oleh guru mata pelajaran. Silakan cek di halaman nilai."
];

// Array tipe notifikasi
const notificationTypes = ["info", "success", "warning", "error"];

// Fungsi untuk menghasilkan notifikasi dummy secara acak
export async function POST(req: Request) {
  try {
    // Dapatkan user ID dari cookie atau dari request body
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    
    let userId: number;
    
    if (userCookie?.value) {
      const user = JSON.parse(userCookie.value);
      userId = user.id;
    } else {
      // Jika tidak ada cookie, coba ambil dari body
      const { userId: bodyUserId } = await req.json();
      
      if (!bodyUserId) {
        return NextResponse.json(
          { error: "User ID diperlukan" },
          { status: 400 }
        );
      }
      
      userId = bodyUserId;
    }
    
    // Jumlah notifikasi yang akan dibuat (antara 1-5)
    const count = Math.floor(Math.random() * 5) + 1;
    
    const notifications = [];
    
    // Generate notifikasi dummy
    for (let i = 0; i < count; i++) {
      const titleIndex = Math.floor(Math.random() * dummyTitles.length);
      const messageIndex = Math.floor(Math.random() * dummyMessages.length);
      const typeIndex = Math.floor(Math.random() * notificationTypes.length);
      
      const notification = await prisma.notification.create({
        data: {
          title: dummyTitles[titleIndex],
          message: dummyMessages[messageIndex],
          type: notificationTypes[typeIndex],
          userId: userId,
          isRead: Math.random() > 0.7, // 30% kemungkinan sudah dibaca
        },
      });
      
      notifications.push(notification);
    }
    
    return NextResponse.json({ 
      message: `Berhasil membuat ${count} notifikasi dummy`,
      notifications 
    }, { status: 201 });
  } catch (error) {
    console.error("Error generating dummy notifications:", error);
    return NextResponse.json(
      { error: "Gagal membuat notifikasi dummy" },
      { status: 500 }
    );
  }
} 