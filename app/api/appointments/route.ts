import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function hasConflict(data: {
  id?: string;
  barberId: string;
  date: string;
  time: string;
}) {
  const result = await db.query(
    `
    SELECT "id"
    FROM "Appointment"
    WHERE "barberId" = $1
      AND "date" = $2
      AND "time" = $3
      AND "status" NOT IN ('cancelled', 'completed')
      AND ($4::text IS NULL OR "id" <> $4)
    LIMIT 1
    `,
    [data.barberId, data.date, data.time, data.id ?? null]
  );

  return result.rows.length > 0;
}

export async function POST(request: Request) {
  const body = await request.json();

  const clientId = String(body.clientId ?? "");
  const barberId = String(body.barberId ?? "");
  const serviceId = String(body.serviceId ?? "");
  const date = String(body.date ?? "");
  const time = String(body.time ?? "");

  if (!clientId || !barberId || !serviceId || !date || !time) {
    return NextResponse.json(
      { success: false, message: "Preencha todos os campos do agendamento." },
      { status: 400 }
    );
  }

  const conflict = await hasConflict({ barberId, date, time });

  if (conflict) {
    return NextResponse.json(
      {
        success: false,
        message: "Este barbeiro já possui um agendamento ativo nesse dia e horário.",
      },
      { status: 400 }
    );
  }

  const id = `appointment-${randomUUID()}`;

  await db.query(
    `
    INSERT INTO "Appointment"
    ("id", "clientId", "barberId", "serviceId", "date", "time", "status")
    VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
    `,
    [id, clientId, barberId, serviceId, date, time]
  );

  return NextResponse.json({
    success: true,
    message: "Agendamento criado no banco.",
    id,
  });
}
