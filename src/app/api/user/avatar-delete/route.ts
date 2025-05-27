import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { filename } = await req.json();
    if (!filename) return NextResponse.json({ error: "Filename diperlukan" }, { status: 400 });
    const filePath = path.join(process.cwd(), "public", "avatar", filename.replace(/^.*[\\/]/, ""));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Gagal menghapus file" }, { status: 500 });
  }
} 