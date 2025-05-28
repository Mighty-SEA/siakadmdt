import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("avatar");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });
  }
  const ext = file.name.split(".").pop();
  const fileName = `avatar_${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(process.cwd(), "public", "avatar", fileName);
  await writeFile(filePath, buffer);
  const url = `/avatar/${fileName}`;
  return NextResponse.json({ url });
} 