import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const siswa = await prisma.student.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ siswa });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data siswa" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data: any = {
      name: body.name,
      nis: body.nis,
      gender: body.gender,
      is_alumni: body.is_alumni === undefined || body.is_alumni === "" ? null : (body.is_alumni === true || body.is_alumni === "true"),
      nik: body.nik === undefined || body.nik === "" ? null : body.nik,
      kk: body.kk === undefined || body.kk === "" ? null : body.kk,
      father_name: body.father_name === undefined || body.father_name === "" ? null : body.father_name,
      mother_name: body.mother_name === undefined || body.mother_name === "" ? null : body.mother_name,
      father_job: body.father_job === undefined || body.father_job === "" ? null : body.father_job,
      mother_job: body.mother_job === undefined || body.mother_job === "" ? null : body.mother_job,
      origin_school: body.origin_school === undefined || body.origin_school === "" ? null : body.origin_school,
      nisn: body.nisn === undefined || body.nisn === "" ? null : body.nisn,
      birth_place: body.birth_place === undefined || body.birth_place === "" ? null : body.birth_place,
      qr_token: body.qr_token === undefined || body.qr_token === "" ? null : body.qr_token,
      birth_date: body.birth_date === undefined || body.birth_date === "" ? null : new Date(body.birth_date),
    };
    console.log("DATA YANG DIKIRIM:", data);
    const siswa = await prisma.student.create({ data: data as object });
    return NextResponse.json({ siswa }, { status: 201 });
  } catch (e: unknown) {
    const errorMsg = typeof e === "object" && e && "message" in e ? (e as Record<string, unknown>).message : "Gagal menyimpan data siswa";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 