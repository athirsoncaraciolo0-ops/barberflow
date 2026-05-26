import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const durationMinutes = Number(body.durationMinutes);
  const active = Boolean(body.active ?? true);

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Nome do serviço é obrigatório." },
      { status: 400 }
    );
  }

  if (price <= 0) {
    return NextResponse.json(
      { success: false, message: "Preço precisa ser maior que zero." },
      { status: 400 }
    );
  }

  if (durationMinutes <= 0) {
    return NextResponse.json(
      { success: false, message: "Duração precisa ser maior que zero." },
      { status: 400 }
    );
  }

  const id = `service-${randomUUID()}`;

  await db.query(
    'INSERT INTO "Service" ("id", "name", "price", "durationMinutes", "active") VALUES ($1, $2, $3, $4, $5)',
    [id, name, price, durationMinutes, active]
  );

  return NextResponse.json({
    success: true,
    message: "Serviço cadastrado no banco.",
    id,
  });
}
