import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ambil semua pembayaran SPP, bisa difilter by student_id, month, year
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const student_id = searchParams.get('student_id');
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const where: Record<string, unknown> = {};
  if (student_id) where.student_id = Number(student_id);
  if (month) where.month = Number(month);
  if (year) where.year = Number(year);
  try {
    const spp = await prisma.sppPayment.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, nis: true }
        }
      },
      orderBy: { paid_at: 'desc' }
    });
    return NextResponse.json({ data: spp });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Gagal mengambil data SPP', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

// Tambah pembayaran SPP
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.student_id || !body.month || !body.year || !body.paid_at || !body.amount) {
      return NextResponse.json({ error: 'Field wajib diisi' }, { status: 400 });
    }
    const created = await prisma.sppPayment.create({
      data: {
        student_id: Number(body.student_id),
        month: Number(body.month),
        year: Number(body.year),
        paid_at: new Date(body.paid_at),
        amount: Number(body.amount),
        infaq: body.infaq ? Number(body.infaq) : 0,
      },
    });
    return NextResponse.json(created);
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Gagal menambah data SPP', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

// Edit pembayaran SPP
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 });
  try {
    const body = await req.json();
    const updated = await prisma.sppPayment.update({
      where: { id: Number(id) },
      data: {
        student_id: Number(body.student_id),
        month: Number(body.month),
        year: Number(body.year),
        paid_at: new Date(body.paid_at),
        amount: Number(body.amount),
        infaq: body.infaq ? Number(body.infaq) : 0,
      },
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Gagal update data SPP', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

// Hapus pembayaran SPP
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    if (id) {
      await prisma.sppPayment.delete({ where: { id: Number(id) } });
      return NextResponse.json({ success: true });
    }
    // Bulk delete
    const body = await req.json();
    if (Array.isArray(body.ids)) {
      await prisma.sppPayment.deleteMany({ where: { id: { in: body.ids.map(Number) } } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Gagal hapus data SPP', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
} 