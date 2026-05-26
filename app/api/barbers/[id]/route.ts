import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

  await db.query(
    'UPDATE "Barber" SET "name" = $1, "specialty" = $2, "phone" = $3, "active" = $4 WHERE "id" = $5',
    [name, specialty, phone, active, id]
  );

  return NextResponse.json({
    success: true,
    message: "Barbeiro atualizado no banco.",
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const activeAppointments = await db.query(
    'SELECT "id" FROM "Appointment" WHERE "barberId" = $1 AND "status" NOT IN ($2, $3) LIMIT 1',
    [id, "cancelled", "completed"]
  );

  if (activeAppointments.rows.length > 0) {
    await db.query('UPDATE "Barber" SET "active" = false WHERE "id" = $1', [id]);

    return NextResponse.json({
      success: true,
      message: "Barbeiro possui agendamentos ativos, então foi apenas desativado.",
    });
  }

  await db.query('DELETE FROM "Appointment" WHERE "barberId" = $1', [id]);
  await db.query('DELETE FROM "Barber" WHERE "id" = $1', [id]);

  return NextResponse.json({
    success: true,
    message: "Barbeiro removido do banco.",
  });
}
