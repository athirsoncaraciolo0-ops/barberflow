import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const notes = String(body.notes ?? "").trim() || null;

  if (!name || !phone) {
    return NextResponse.json(
      { success: false, message: "Nome e telefone são obrigatórios." },
      { status: 400 }
    );
  }

  const id = `client-${randomUUID()}`;

  await db.query(
    'INSERT INTO "Client" ("id", "name", "phone", "notes") VALUES ($1, $2, $3, $4)',
    [id, name, phone, notes]
  );

  return NextResponse.json({
    success: true,
    message: "Cliente cadastrado no banco.",
    id,
  });
}
