import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id, jumlah_bulan, paid_at, amount, infaq, startMonth, startYear } = body;
    if (!student_id || !jumlah_bulan || !paid_at || !amount) {
      return NextResponse.json({ error: "Field wajib diisi" }, { status: 400 });
    }
    // Ambil pembayaran SPP terakhir siswa
    const last = await prisma.sppPayment.findFirst({
      where: { student_id: Number(student_id) },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    let month = 1;
    let year = new Date().getFullYear();
    if (last) {
      month = last.month;
      year = last.year;
    } else if (startMonth && startYear) {
      month = Number(startMonth) - 1; // dikurangi 1 agar loop dimulai dari bulan yang diinput user
      year = Number(startYear);
    }
    // Generate bulan dan tahun untuk pembayaran berikutnya
    const payments = [];
    for (let i = 0; i < Number(jumlah_bulan); i++) {
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      payments.push({
        student_id: Number(student_id),
        month,
        year,
        paid_at: new Date(paid_at),
        amount: Number(amount),
        infaq: infaq ? Number(infaq) : 0,
      });
    }
    // Simpan semua pembayaran
    const created = await prisma.sppPayment.createMany({ data: payments });
    return NextResponse.json({ success: true, count: created.count });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Gagal menambah data SPP via QR', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
} 