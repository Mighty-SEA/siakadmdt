import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ roles });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data role" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = await prisma.role.create({ data: { name: body.name } });
    return NextResponse.json({ role }, { status: 201 });
  } catch (e: unknown) {
    const error = e as { meta?: { target?: string[] } };
    return NextResponse.json({ error: error?.meta?.target?.includes('name') ? 'Nama role sudah ada' : 'Gagal menambah role' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const role = await prisma.role.update({ where: { id: Number(body.id) }, data: { name: body.name } });
    return NextResponse.json({ role });
  } catch (e: unknown) {
    const error = e as { meta?: { target?: string[] } };
    return NextResponse.json({ error: error?.meta?.target?.includes('name') ? 'Nama role sudah ada' : 'Gagal mengupdate role' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const role = await prisma.role.findUnique({ where: { id: Number(body.id) }, include: { users: true } });
    if (role && role.users.length > 0) {
      return NextResponse.json({ error: "Role masih digunakan user" }, { status: 400 });
    }
    await prisma.role.delete({ where: { id: Number(body.id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus role" }, { status: 500 });
  }
} 