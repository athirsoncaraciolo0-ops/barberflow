import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

  await db.query(
    'UPDATE "Service" SET "name" = $1, "price" = $2, "durationMinutes" = $3, "active" = $4 WHERE "id" = $5',
    [name, price, durationMinutes, active, id]
  );

  return NextResponse.json({
    success: true,
    message: "Serviço atualizado no banco.",
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const activeAppointments = await db.query(
    'SELECT "id" FROM "Appointment" WHERE "serviceId" = $1 AND "status" NOT IN ($2, $3) LIMIT 1',
    [id, "cancelled", "completed"]
  );

  if (activeAppointments.rows.length > 0) {
    await db.query('UPDATE "Service" SET "active" = false WHERE "id" = $1', [id]);

    return NextResponse.json({
      success: true,
      message: "Serviço possui agendamentos ativos, então foi apenas desativado.",
    });
  }

  await db.query('DELETE FROM "Appointment" WHERE "serviceId" = $1', [id]);
  await db.query('DELETE FROM "Service" WHERE "id" = $1', [id]);

  return NextResponse.json({
    success: true,
    message: "Serviço removido do banco.",
  });
}
