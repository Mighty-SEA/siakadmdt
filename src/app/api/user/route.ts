import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hashed = await bcrypt.hash(body.password, 10);
    const data = {
      name: body.name,
      email: body.email,
      password: hashed,
      avatar: body.avatar || null,
      role: body.role || "ADMIN",
    };
    const user = await prisma.user.create({ data });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data user";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, password, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const oldUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    const data: any = { ...updateData };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (body.avatar !== undefined) {
      data.avatar = body.avatar;
    }
    if (body.role !== undefined) {
      data.role = body.role;
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });
    if (oldUser && body.avatar && oldUser.avatar && oldUser.avatar !== body.avatar) {
      const avatarPath = path.join(process.cwd(), "public", "avatar", oldUser.avatar.replace(/^.*[\\/]/, ""));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    return NextResponse.json({ user });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal mengupdate data user";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    const oldUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    await prisma.user.delete({ where: { id: Number(id) } });
    if (oldUser && oldUser.avatar) {
      const avatarPath = path.join(process.cwd(), "public", "avatar", oldUser.avatar.replace(/^.*[\\/]/, ""));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data user";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 