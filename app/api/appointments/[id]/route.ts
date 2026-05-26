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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const current = await db.query('SELECT * FROM "Appointment" WHERE "id" = $1', [
    id,
  ]);

  if (current.rows.length === 0) {
    return NextResponse.json(
      { success: false, message: "Agendamento não encontrado." },
      { status: 404 }
    );
  }

  const currentAppointment = current.rows[0];

  const nextAppointment = {
    clientId: String(body.clientId ?? currentAppointment.clientId),
    barberId: String(body.barberId ?? currentAppointment.barberId),
    serviceId: String(body.serviceId ?? currentAppointment.serviceId),
    date: String(body.date ?? currentAppointment.date),
    time: String(body.time ?? currentAppointment.time),
    status: String(body.status ?? currentAppointment.status),
  };

  const isActive =
    nextAppointment.status !== "cancelled" &&
    nextAppointment.status !== "completed";

  if (isActive) {
    const conflict = await hasConflict({
      id,
      barberId: nextAppointment.barberId,
      date: nextAppointment.date,
      time: nextAppointment.time,
    });

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Não foi possível alterar: este barbeiro já possui outro agendamento ativo nesse dia e horário.",
        },
        { status: 400 }
      );
    }
  }

  await db.query(
    `
    UPDATE "Appointment"
    SET "clientId" = $1,
        "barberId" = $2,
        "serviceId" = $3,
        "date" = $4,
        "time" = $5,
        "status" = $6
    WHERE "id" = $7
    `,
    [
      nextAppointment.clientId,
      nextAppointment.barberId,
      nextAppointment.serviceId,
      nextAppointment.date,
      nextAppointment.time,
      nextAppointment.status,
      id,
    ]
  );

  return NextResponse.json({
    success: true,
    message: "Agendamento atualizado no banco.",
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const status = String(body.status ?? "");

  if (!["scheduled", "confirmed", "completed", "cancelled"].includes(status)) {
    return NextResponse.json(
      { success: false, message: "Status inválido." },
      { status: 400 }
    );
  }

  const current = await db.query('SELECT * FROM "Appointment" WHERE "id" = $1', [
    id,
  ]);

  if (current.rows.length === 0) {
    return NextResponse.json(
      { success: false, message: "Agendamento não encontrado." },
      { status: 404 }
    );
  }

  const currentAppointment = current.rows[0];

  const isActive = status !== "cancelled" && status !== "completed";

  if (isActive) {
    const conflict = await hasConflict({
      id,
      barberId: currentAppointment.barberId,
      date: currentAppointment.date,
      time: currentAppointment.time,
    });

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Não foi possível ativar: existe conflito com outro agendamento ativo.",
        },
        { status: 400 }
      );
    }
  }

  await db.query('UPDATE "Appointment" SET "status" = $1 WHERE "id" = $2', [
    status,
    id,
  ]);

  return NextResponse.json({
    success: true,
    message: "Status atualizado no banco.",
  });
}
