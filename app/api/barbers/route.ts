import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const specialty = String(body.specialty ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const active = Boolean(body.active ?? true);

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Nome do barbeiro é obrigatório." },
      { status: 400 }
    );
  }

  if (!specialty) {
    return NextResponse.json(
      { success: false, message: "Especialidade é obrigatória." },
      { status: 400 }
    );
  }

  const id = `barber-${randomUUID()}`;

  await db.query(
    'INSERT INTO "Barber" ("id", "name", "specialty", "phone", "active") VALUES ($1, $2, $3, $4, $5)',
    [id, name, specialty, phone, active]
  );

  return NextResponse.json({
    success: true,
    message: "Barbeiro cadastrado no banco.",
    id,
  });
}
