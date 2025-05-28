import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" }, include: { role: true } });
    
    // Pastikan avatar URL selalu konsisten
    const normalizedUsers = users.map(user => {
      if (user.avatar) {
        // Jika avatar tidak dimulai dengan http atau / maka tambahkan /
        if (!user.avatar.startsWith('http') && !user.avatar.startsWith('/')) {
          user.avatar = `/avatar/${user.avatar}`;
        } else if (user.avatar.startsWith('avatar_')) {
          // Jika hanya nama file avatar, tambahkan path lengkap
          user.avatar = `/avatar/${user.avatar}`;
        }
      }
      return user;
    });
    
    return NextResponse.json({ users: normalizedUsers });
  } catch (error) {
    console.error("Error getting users:", error);
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
      roleId: Number(body.roleId) || 1,
    };
    const user = await prisma.user.create({ data, include: { role: true } });
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
    
    interface UserUpdateData {
      name?: string;
      email?: string;
      password?: string;
      avatar?: string | null;
      roleId?: number;
    }
    
    const data: UserUpdateData = { ...updateData };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (body.avatar !== undefined) {
      data.avatar = body.avatar;
    }
    if (body.roleId !== undefined) {
      data.roleId = Number(body.roleId);
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      include: { role: true },
    });
    if (oldUser && body.avatar && oldUser.avatar && oldUser.avatar !== body.avatar) {
      try {
        const oldAvatarFile = oldUser.avatar.replace(/^.*[\\/]/, "").replace(/^\/avatar\//, "");
        const avatarPath = path.join(process.cwd(), "public", "avatar", oldAvatarFile);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (error) {
        console.error("Gagal menghapus avatar lama:", error);
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
      try {
        const oldAvatarFile = oldUser.avatar.replace(/^.*[\\/]/, "").replace(/^\/avatar\//, "");
        const avatarPath = path.join(process.cwd(), "public", "avatar", oldAvatarFile);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (error) {
        console.error("Gagal menghapus avatar:", error);
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menghapus data user";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 